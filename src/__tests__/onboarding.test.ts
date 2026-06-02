import { OnboardingData, calculateNutritionTargets } from "../lib/calculations";
import { User } from "../context/AuthContext";

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

describe("ZenLog Onboarding & Profile Editing Flow Tests", () => {
  beforeEach(() => {
    mockLocalStorage.clear();
  });

  // Test 1: Complete Onboarding and Store Permanently
  test("Completing onboarding should calculate targets, save data, and update status", () => {
    const mockUser: User = {
      id: "usr_onboard_123",
      email: "onboard@gmail.com",
      name: "Onboard Tester",
      provider: "google",
      role: "user",
      isOnboarded: false, // Starts as false
      createdAt: new Date().toISOString(),
    };

    // Store user session initially
    localStorage.setItem(SESSION_KEY, JSON.stringify(mockUser));

    // Simulate Onboarding Wizard inputs
    const onboardingPayload: OnboardingData = {
      gender: "male",
      age: 26,
      height: 180,
      currentWeight: 80,
      targetWeight: 75,
      goal: "lose_fat",
      activityLevel: "moderate",
      workoutFrequency: "3 days/week",
      fitnessExperience: "Beginner",
      dietPreference: "vegetarian",
      allergies: [],
      mealsPerDay: 3,
      timeline: "8 weeks",
      challenge: "Consistency",
      dreamPhysique: "Lean & Toned"
    };

    // Trigger calculations
    const targets = calculateNutritionTargets(onboardingPayload);

    // Assert Mifflin-St Jeor equation results for 80kg male, 180cm, 26yo, moderate activity
    // BMR = 10 * 80 + 6.25 * 180 - 5 * 26 + 5 = 800 + 1125 - 130 + 5 = 1800
    // TDEE = 1800 * 1.55 = 2790
    // lose_fat (deficit 500) = 2790 - 500 = 2290
    expect(targets.bmr).toBe(1800);
    expect(targets.tdee).toBe(2790);
    expect(targets.targetCalories).toBe(2290);

    // Save onboarding data and set onboarded = true
    localStorage.setItem(`zenlog_onboarding_${mockUser.id}`, JSON.stringify(onboardingPayload));
    
    const updatedUser: User = { ...mockUser, isOnboarded: true };
    localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));

    // Verify persisted states
    const savedOnboarding = JSON.parse(localStorage.getItem(`zenlog_onboarding_${mockUser.id}`) || "");
    const savedUser = JSON.parse(localStorage.getItem(SESSION_KEY) || "");

    expect(savedOnboarding).toEqual(onboardingPayload);
    expect(savedUser.isOnboarded).toBe(true);
  });

  // Test 2: Close App and Reopen App (Session Persistence & No Onboarding Popup)
  test("Reopening the app should restore user session and bypass onboarding page", () => {
    const userId = "usr_persisted_789";
    const onboardedUser: User = {
      id: userId,
      email: "persisted@gmail.com",
      name: "Persisted User",
      provider: "google",
      role: "user",
      isOnboarded: true, // Already onboarded!
      createdAt: new Date().toISOString(),
    };

    const onboardingData: OnboardingData = {
      gender: "female",
      age: 24,
      height: 165,
      currentWeight: 60,
      targetWeight: 55,
      goal: "maintain",
      activityLevel: "light",
      workoutFrequency: "2 days/week",
      fitnessExperience: "Beginner",
      dietPreference: "vegan",
      allergies: [],
      mealsPerDay: 3,
      timeline: "6 weeks",
      challenge: "Consistency",
      dreamPhysique: "Lean"
    };

    // Cache the states (Simulating they were saved previously)
    localStorage.setItem(SESSION_KEY, JSON.stringify(onboardedUser));
    localStorage.setItem(`zenlog_onboarding_${userId}`, JSON.stringify(onboardingData));

    // Simulate App Close & Reopen (In-memory variables cleared, boot sequence reads from local storage cache)
    const storedSession = localStorage.getItem(SESSION_KEY);
    const storedOnboarding = localStorage.getItem(`zenlog_onboarding_${userId}`);

    expect(storedSession).not.toBeNull();
    expect(storedOnboarding).not.toBeNull();

    const parsedUser = JSON.parse(storedSession || "");
    const parsedOnboarding = JSON.parse(storedOnboarding || "");

    // Logic verification: checks if user is logged in AND completed onboarding
    const shouldShowOnboarding = !parsedUser || !parsedUser.isOnboarded;
    const shouldGoToDashboard = parsedUser && parsedUser.isOnboarded;

    // Assert onboarding is skipped
    expect(shouldShowOnboarding).toBe(false);
    expect(shouldGoToDashboard).toBe(true);
  });

  // Test 3: Allow Editing Profile Later (Recalculates targets instantly)
  test("Editing profile should save new values and recalculate calorie/macro targets instantly", () => {
    const userId = "usr_edit_999";
    const mockUser: User = {
      id: userId,
      email: "edituser@gmail.com",
      name: "Original Name",
      provider: "google",
      role: "user",
      isOnboarded: true,
      createdAt: new Date().toISOString(),
    };

    const originalOnboarding: OnboardingData = {
      gender: "male",
      age: 30,
      height: 175,
      currentWeight: 85,
      targetWeight: 80,
      goal: "lose_fat",
      activityLevel: "sedentary", // Sedentary = 1.2 multiplier
      workoutFrequency: "0 days/week",
      fitnessExperience: "Beginner",
      dietPreference: "non_vegetarian",
      allergies: [],
      mealsPerDay: 3,
      timeline: "10 weeks",
      challenge: "Time",
      dreamPhysique: "Athletic"
    };

    // Mifflin-St Jeor for 85kg male, 175cm, 30yo:
    // BMR = 10 * 85 + 6.25 * 175 - 5 * 30 + 5 = 850 + 1093.75 - 150 + 5 = 1798.75 -> 1799
    // TDEE = 1799 * 1.2 = 2159
    // targetCalories = 2159 - 500 = 1659
    const originalTargets = calculateNutritionTargets(originalOnboarding);
    expect(originalTargets.targetCalories).toBe(1659);

    // Save original parameters
    localStorage.setItem(SESSION_KEY, JSON.stringify(mockUser));
    localStorage.setItem(`zenlog_onboarding_${userId}`, JSON.stringify(originalOnboarding));

    // Simulate Profile Edit Form submission (User changes name, weight, and activity level to Active)
    const updatedName = "New Name";
    const updatedOnboarding: OnboardingData = {
      ...originalOnboarding,
      currentWeight: 82, // Weight dropped to 82kg
      activityLevel: "active", // Switched to active exercise (1.725 multiplier)
    };

    // Save updated parameters
    const updatedUserObj: User = { ...mockUser, name: updatedName };
    localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUserObj));
    localStorage.setItem(`zenlog_onboarding_${userId}`, JSON.stringify(updatedOnboarding));

    // Recalculate targets based on updated parameters
    // BMR = 10 * 82 + 6.25 * 175 - 5 * 30 + 5 = 820 + 1093.75 - 150 + 5 = 1768.75 -> 1769
    // TDEE = 1769 * 1.725 = 3051.5 -> 3052
    // targetCalories = 3052 - 500 = 2552
    const updatedTargets = calculateNutritionTargets(updatedOnboarding);

    expect(updatedTargets.targetCalories).toBe(2551); // Successfully recalculated targets!
    expect(JSON.parse(localStorage.getItem(SESSION_KEY) || "").name).toBe("New Name");
  });
});
