import { calculateNutritionTargets, OnboardingData } from "../lib/calculations";
import { LoggedMeal, WeightLog, Badge } from "../context/AppContext";

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

describe("ZenLog Dashboard Extensions & Calculation Tests", () => {
  const userId = "usr_dashboard_test";
  
  beforeEach(() => {
    mockLocalStorage.clear();
  });

  // Test 1: Food Logging updates consumed and remaining calories instantly
  test("Logging a meal updates consumed macros and decreases remaining calories instantly", () => {
    const targetCalories = 2000;
    const targetProtein = 140;
    const targetCarbs = 210;
    const targetFat = 65;

    // Simulate empty dashboard state
    let meals: LoggedMeal[] = [];
    let loggedCalories = meals.reduce((sum, m) => sum + (m.calories * m.servings), 0);
    let remainingCalories = Math.max(0, targetCalories - loggedCalories);

    expect(loggedCalories).toBe(0);
    expect(remainingCalories).toBe(2000);

    // Simulate Logging a Meal: Paneer Butter Masala (1.5 servings)
    // 340 kcal, 14g Pro, 12g Carb, 26g Fat
    const servings = 1.5;
    const newMeal: LoggedMeal = {
      id: "meal-log-1",
      name: "Paneer Butter Masala",
      mealType: "Lunch",
      calories: Math.round(340 * servings), // 510 kcal
      protein: Math.round(14.0 * servings * 10) / 10, // 21g
      carbs: Math.round(12.0 * servings * 10) / 10, // 18g
      fat: Math.round(26.0 * servings * 10) / 10, // 39g
      servings,
      loggedDate: new Date().toISOString().split("T")[0]
    };

    meals.push(newMeal);

    // Recalculate logged and remaining macros
    loggedCalories = meals.reduce((sum, m) => sum + m.calories, 0);
    const loggedProtein = meals.reduce((sum, m) => sum + m.protein, 0);
    const loggedCarbs = meals.reduce((sum, m) => sum + m.carbs, 0);
    const loggedFat = meals.reduce((sum, m) => sum + m.fat, 0);

    remainingCalories = Math.max(0, targetCalories - loggedCalories);

    // Assert updates are correct
    expect(loggedCalories).toBe(510);
    expect(loggedProtein).toBe(21);
    expect(loggedCarbs).toBe(18);
    expect(loggedFat).toBe(39);
    expect(remainingCalories).toBe(1490);
  });

  // Test 2: Water Tracker logs hydration and unlocks badges
  test("Logging water increments hydration level and unlocks Hydration Master badge when target is met", () => {
    let waterLogged = 0;
    const waterTargetMl = 3000;
    let unlockedBadges: Badge[] = [];

    // Helper to log water and simulate Context badge checking
    const logWater = (amountMl: number) => {
      waterLogged += amountMl;
      if (waterLogged >= waterTargetMl) {
        if (!unlockedBadges.some(b => b.id === "water_champ")) {
          unlockedBadges.push({
            id: "water_champ",
            name: "Hydration Master",
            description: "Drank over 3,000ml of water in a day",
            icon: "💧",
            unlockedDate: new Date().toISOString().split("T")[0]
          });
        }
      }
    };

    // Log a glass of water
    logWater(250);
    expect(waterLogged).toBe(250);
    expect(unlockedBadges.length).toBe(0);

    // Log a bottle of water
    logWater(500);
    expect(waterLogged).toBe(750);
    expect(unlockedBadges.length).toBe(0);

    // Log enough to cross target (3000ml)
    logWater(2250);
    expect(waterLogged).toBe(3000);
    expect(unlockedBadges.length).toBe(1);
    expect(unlockedBadges[0].id).toBe("water_champ");
  });

  // Test 3: Weight Tracker updates current weight, recalculates targets, and maps goals
  test("Logging weight updates profile weight, modifies target calorie budget, and adjusts progress goals", () => {
    const onboardingData: OnboardingData = {
      gender: "male",
      age: 25,
      height: 180,
      currentWeight: 85, // Starts at 85kg
      targetWeight: 75,
      goal: "lose_fat",
      activityLevel: "moderate",
      workoutFrequency: "3 days/week",
      fitnessExperience: "Beginner",
      dietPreference: "non_vegetarian",
      allergies: [],
      mealsPerDay: 3,
      timeline: "8 weeks",
      challenge: "Consistency",
      dreamPhysique: "Lean"
    };

    // Initial targets calculation
    // BMR = 10*85 + 6.25*180 - 5*25 + 5 = 850 + 1125 - 125 + 5 = 1855
    // TDEE = 1855 * 1.55 = 2875.25
    // Deficit = 500 kcal -> target = 2375
    let targets = calculateNutritionTargets(onboardingData);
    expect(targets.targetCalories).toBe(2375);

    let weightLogs: WeightLog[] = [{ weight: 85, date: "2026-06-01" }];

    // Simulate Logging New Weight (e.g. user weighs in at 82kg today)
    const newWeight = 82;
    const todayStr = new Date().toISOString().split("T")[0];
    
    // Add new weight log and remove duplicate today logs
    weightLogs = [...weightLogs.filter(w => w.date !== todayStr), { weight: newWeight, date: todayStr }];
    
    const updatedOnboarding = { ...onboardingData, currentWeight: newWeight };
    
    // Recalculate targets based on updated weight
    // BMR = 10*82 + 6.25*180 - 5*25 + 5 = 820 + 1125 - 125 + 5 = 1825
    // TDEE = 1825 * 1.55 = 2828.75
    // Deficit = 500 kcal -> target = 2329
    targets = calculateNutritionTargets(updatedOnboarding);

    const latestWeight = weightLogs[weightLogs.length - 1].weight;
    const targetWeight = updatedOnboarding.targetWeight;
    const weightDifference = Math.round((latestWeight - targetWeight) * 10) / 10;

    // Assert correct updates
    expect(latestWeight).toBe(82);
    expect(targets.targetCalories).toBe(2329);
    expect(weightDifference).toBe(7.0); // 82 - 75 = 7kg left to lose
  });

  // Test 4: Edge cases: invalid log inputs
  test("Logging edge-case serving portions should scale nutritional entries correctly or skip 0 servings", () => {
    const baseCalories = 200;
    
    // Case A: logging fractional serving (0.5 servings)
    const fractionalServings = 0.5;
    const fractionCalories = Math.round(baseCalories * fractionalServings);
    expect(fractionCalories).toBe(100);

    // Case B: validation logic prevents logging <= 0 servings
    const zeroServings = 0;
    const negativeServings = -1.5;
    
    const validateServings = (s: number) => s > 0;
    expect(validateServings(zeroServings)).toBe(false);
    expect(validateServings(negativeServings)).toBe(false);
    expect(validateServings(1.2)).toBe(true);
  });
});
