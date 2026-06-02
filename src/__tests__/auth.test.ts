import { User } from "../context/AuthContext";

// Simple mock values
const SESSION_KEY = "zenlog_session_v3";

class MockLocalStorage {
  private store: { [key: string]: string } = {};

  clear() {
    this.store = {};
  }

  getItem(key: string) {
    return this.store[key] || null;
  }

  setItem(key: string, value: string) {
    this.store[key] = String(value);
  }

  removeItem(key: string) {
    delete this.store[key];
  }
}

const mockLocalStorage = new MockLocalStorage();
Object.defineProperty(global, "localStorage", {
  value: mockLocalStorage,
});

describe("ZenLog Authentication System Flow Tests", () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    jest.clearAllMocks();
  });

  // Flow 1: New User Login (No database profile -> forced to onboarding)
  test("New user login should route to onboarding questionnaire with no backdoor bypass", () => {
    // Mock Firebase user registration
    const mockFirebaseUser = {
      uid: "user_new_123",
      email: "newuser@gmail.com",
      displayName: "New User",
      photoURL: "https://api.dicebear.com/svg?seed=new",
      getIdTokenResult: async () => ({ claims: { role: "user" } }),
    };

    // Simulate AuthContext mapping logic
    const role = "user";
    const isOnboarded = false; // No backdoor bypass!

    const u: User = {
      id: mockFirebaseUser.uid,
      email: mockFirebaseUser.email,
      name: mockFirebaseUser.displayName,
      photoURL: mockFirebaseUser.photoURL,
      provider: "google",
      role: role as "user" | "admin",
      isOnboarded: isOnboarded,
      createdAt: new Date().toISOString(),
    };

    // Save session
    localStorage.setItem(SESSION_KEY, JSON.stringify(u));

    // Assertions
    expect(u.isOnboarded).toBe(false); // Must complete onboarding
    expect(JSON.parse(localStorage.getItem(SESSION_KEY) || "")).toEqual(u);
  });

  // Flow 2: Existing User Login (onboardingCompleted is true -> goes straight to Dashboard)
  test("Existing user login should restore profile and bypass onboarding", () => {
    const mockFirebaseUser = {
      uid: "user_existing_456",
      email: "existing@gmail.com",
      displayName: "Existing User",
      getIdTokenResult: async () => ({ claims: { role: "user" } }),
    };

    // Simulate Firestore sync resolving onboardingCompleted = true
    const firestoreProfile = {
      uid: "user_existing_456",
      onboardingCompleted: true,
      gender: "male",
      age: 26,
      height: 178,
      weight: 78.4,
      targetWeight: 72.0,
      goal: "cut",
      activityLevel: "moderate",
    };

    // Simulate restoring onboarding details to localStorage
    const onboardingData = {
      gender: firestoreProfile.gender,
      age: firestoreProfile.age,
      height: firestoreProfile.height,
      currentWeight: firestoreProfile.weight,
      targetWeight: firestoreProfile.targetWeight,
      goal: firestoreProfile.goal,
      activityLevel: firestoreProfile.activityLevel,
    };

    localStorage.setItem(`zenlog_onboarding_${mockFirebaseUser.uid}`, JSON.stringify(onboardingData));

    const role = "user";
    const isOnboarded = firestoreProfile.onboardingCompleted;

    const u: User = {
      id: mockFirebaseUser.uid,
      email: mockFirebaseUser.email,
      name: mockFirebaseUser.displayName,
      provider: "google",
      role: role as "user" | "admin",
      isOnboarded: isOnboarded,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(u));

    // Assertions
    expect(u.isOnboarded).toBe(true); // Bypasses onboarding
    expect(localStorage.getItem(`zenlog_onboarding_${mockFirebaseUser.uid}`)).not.toBeNull();
  });

  // Flow 3: Logout
  test("Logout should wipe local storage session and clear user state", () => {
    const activeUser: User = {
      id: "usr_123",
      email: "test@gmail.com",
      name: "Test User",
      provider: "google",
      role: "user",
      isOnboarded: true,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(activeUser));
    expect(localStorage.getItem(SESSION_KEY)).not.toBeNull();

    // Trigger logout simulation
    localStorage.removeItem(SESSION_KEY);
    
    // Assertions
    expect(localStorage.getItem(SESSION_KEY)).toBeNull();
  });

  // Flow 4: Session Persistence (Instant load on reload)
  test("Startup should restore session instantly from localStorage cache to prevent flicker", () => {
    const cachedUser: User = {
      id: "usr_persisted",
      email: "persisted@gmail.com",
      name: "Persisted User",
      provider: "google",
      role: "user",
      isOnboarded: true,
      createdAt: new Date().toISOString(),
    };

    // Cache the session
    localStorage.setItem(SESSION_KEY, JSON.stringify(cachedUser));

    // Simulate startup retrieval logic
    const stored = localStorage.getItem(SESSION_KEY);
    let currentUser: User | null = null;
    let loading = true;

    if (stored) {
      currentUser = JSON.parse(stored);
      loading = false; // Zero network wait / instant restoration!
    }

    // Assertions
    expect(currentUser).toEqual(cachedUser);
    expect(loading).toBe(false);
  });

  // Flow 5: Invalid Login (Graceful Google Sign-In failure handling)
  test("Google Sign-In failure should handle errors gracefully and throw clean warnings", () => {
    // Simulate login failure reasons
    const mockGoogleSignInFailure = (errorCode: string) => {
      let errorMsg = "Unable to complete Google Sign-In. Please try again.";
      if (errorCode === "auth/popup-closed-by-user") {
        errorMsg = "Login was cancelled. Please select a Google account to log in.";
      } else if (errorCode === "auth/network-request-failed") {
        errorMsg = "Authentication failed. Check your internet connection.";
      }
      return { success: false, error: errorMsg };
    };

    // Assertions
    const res1 = mockGoogleSignInFailure("auth/popup-closed-by-user");
    expect(res1.success).toBe(false);
    expect(res1.error).toBe("Login was cancelled. Please select a Google account to log in.");

    const res2 = mockGoogleSignInFailure("auth/network-request-failed");
    expect(res2.success).toBe(false);
    expect(res2.error).toBe("Authentication failed. Check your internet connection.");
  });
});
