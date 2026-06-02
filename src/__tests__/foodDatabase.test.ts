import { searchFoodsOfflineOnline, foodSearchCache } from "../lib/foodSearchService";
import { INITIAL_FOODS, FoodItem } from "../lib/foods";

// Simple mock for localStorage
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

// A list of exactly 100 food items to search automatically
const TEST_100_FOODS = [
  "Rice", "Paneer", "Jalebi", "Roti", "Dal", "Tofu", "Oats",
  "Apple", "Banana", "Orange", "Strawberry", "Blueberry", "Mango", "Pineapple", "Grape", "Watermelon", "Peach", "Plum",
  "Chicken", "Beef", "Pork", "Turkey", "Salmon", "Tuna", "Shrimp", "Egg", "Milk", "Cheese", "Butter", "Yogurt",
  "Spinach", "Broccoli", "Carrot", "Potato", "Tomato", "Onion", "Garlic", "Ginger", "Cucumber", "Lettuce", "Cabbage",
  "Almond", "Walnut", "Peanut", "Cashew", "Chia Seeds", "Flax Seeds", "Pumpkin Seeds", "Sunflower Seeds",
  "Pizza", "Burger", "Sandwich", "Pasta", "Noodles", "Sushi", "Taco", "Burrito", "Quesadilla", "Fries",
  "Samosa", "Dhokla", "Poha", "Upma", "Idli", "Dosa", "Vada Pav", "Pav Bhaji", "Pani Puri", "Kachori", "Kadhi Pakora",
  "Biryani", "Pulav", "Naan", "Paratha", "Lassi", "Chaas", "Gulab Jamun", "Rasgulla", "Thepla", "Chana Masala",
  "Coca Cola Classic", "Coke Zero", "Red Bull", "Starbucks Latte", "Oreo Cookies", "Amul Butter", "Amul Paneer", "Amul Curd",
  "Green Salad", "Chicken Breast", "Brown Rice", "Quinoa", "Whey Protein", "Greek Yogurt", "Buttermilk", "Basmati Rice",
  "Jeera Rice", "Dal Tadka", "Dal Makhani", "Rajma Masala", "Chole Bhature", "Bhindi Fry", "Aloo Gobi"
];

// Helper to dynamically mock fetch calls to USDA and OFF
const mockFetchHandler = (url: string) => {
  let query = "food";
  try {
    if (url.includes("?")) {
      const queryString = url.split("?")[1];
      const params = new URLSearchParams(queryString);
      query = params.get("query") || params.get("search_terms") || "food";
    }
  } catch (e) {
    // Ignore URL parsing errors
  }

  if (url.includes("api.nal.usda.gov")) {
    const foods = [
      {
        fdcId: 100001,
        description: `USDA Mock ${query}`,
        brandOwner: "USDA Corp",
        servingSize: 100,
        servingSizeUnit: "g",
        foodNutrients: [
          { nutrientId: 1008, value: 120 }, // Calories
          { nutrientId: 1003, value: 8.5 }, // Protein
          { nutrientId: 1005, value: 15.0 }, // Carbs
          { nutrientId: 1004, value: 3.2 }  // Fat
        ]
      }
    ];
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ foods }),
    });
  } else if (url.includes("openfoodfacts.org")) {
    const products = [
      {
        code: "9999999999",
        product_name: `OFF Mock ${query}`,
        brands: "OFF Brand",
        serving_size: "100g",
        nutriments: {
          "energy-kcal_100g": 110,
          "proteins_100g": 6.0,
          "carbohydrates_100g": 18.0,
          "fat_100g": 2.5
        }
      }
    ];
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ products }),
    });
  }

  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  });
};

describe("ZenLog Food Database Layer & Cache Tests", () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    foodSearchCache.clear();
    // Default to mock fetch handler to prevent real network calls
    global.fetch = jest.fn().mockImplementation(mockFetchHandler) as any;
  });

  test("Required Staples (Rice, Paneer, Jalebi, Roti, Dal, Tofu, Oats) must return correct nutritional fields", async () => {
    const staples = ["Rice", "Paneer", "Jalebi", "Roti", "Dal", "Tofu", "Oats"];

    for (const staple of staples) {
      const results = await searchFoodsOfflineOnline(staple);
      
      // Ensure we get results
      expect(results.length).toBeGreaterThan(0);
      
      // Verify first/top match has all required fields
      const bestMatch = results[0];
      expect(bestMatch.name).toBeDefined();
      expect(bestMatch.servingSize).toBeDefined();
      expect(typeof bestMatch.calories).toBe("number");
      expect(typeof bestMatch.protein).toBe("number");
      expect(typeof bestMatch.carbs).toBe("number");
      expect(typeof bestMatch.fat).toBe("number");
    }
  });

  test("Search 100 foods automatically, verify fields, and check performance speed", async () => {
    const startTotalTime = performance.now();
    let totalLatency = 0;

    for (const food of TEST_100_FOODS) {
      const startQuery = performance.now();
      const results = await searchFoodsOfflineOnline(food);
      const latency = performance.now() - startQuery;
      totalLatency += latency;

      // Verify at least one result exists
      expect(results.length).toBeGreaterThan(0);

      // Verify structure of the first item
      const item = results[0];
      expect(item.id).toBeDefined();
      expect(item.name).toBeDefined();
      expect(item.servingSize).toBeDefined();
      expect(typeof item.calories).toBe("number");
      expect(typeof item.protein).toBe("number");
      expect(typeof item.carbs).toBe("number");
      expect(typeof item.fat).toBe("number");
    }

    const endTotalTime = performance.now();
    const avgLatency = totalLatency / TEST_100_FOODS.length;

    console.log(`[TEST REPORT] Total Time for 100 searches: ${(endTotalTime - startTotalTime).toFixed(2)}ms`);
    console.log(`[TEST REPORT] Average search latency: ${avgLatency.toFixed(2)}ms`);

    // The average search latency should be well under the target 300ms
    expect(avgLatency).toBeLessThan(300);
  });

  test("Caching layer resolves repeated searches under 300ms (targets <10ms)", async () => {
    // Mock slow API response on first load
    global.fetch = jest.fn().mockImplementation(async (url: string) => {
      // Simulate 100ms network delay
      await new Promise(r => setTimeout(r, 100));
      return mockFetchHandler(url);
    }) as any;

    const query = "Healthy Avocado";

    // 1st search: Cache cold (simulates network wait)
    const t0 = performance.now();
    const results1 = await searchFoodsOfflineOnline(query);
    const firstDuration = performance.now() - t0;

    expect(results1.length).toBeGreaterThan(0);

    // 2nd search: Cache hot (hits cache instantly)
    const t1 = performance.now();
    const results2 = await searchFoodsOfflineOnline(query);
    const secondDuration = performance.now() - t1;

    expect(results2).toEqual(results1);
    
    console.log(`[TEST REPORT] Cold search duration: ${firstDuration.toFixed(2)}ms`);
    console.log(`[TEST REPORT] Hot (cached) search duration: ${secondDuration.toFixed(2)}ms`);

    // Assert that the cached search is super fast and under 300ms
    expect(secondDuration).toBeLessThan(300);
    // Assertion on local memory cache speed (usually <=10ms)
    expect(secondDuration).toBeLessThan(20);
  });

  test("Offline network failure resilience: should gracefully fallback to local preseeded search results", async () => {
    // Mock network failure
    global.fetch = jest.fn().mockImplementation(() => {
      return Promise.reject(new TypeError("Failed to fetch"));
    }) as any;

    // Search for a preseeded staple (should succeed using local matching catalog)
    const results = await searchFoodsOfflineOnline("Paneer");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name.toLowerCase()).toContain("paneer");
    expect(typeof results[0].calories).toBe("number");
  });
});
