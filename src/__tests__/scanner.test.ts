import { POST } from "../app/api/scan/route";

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

describe("ZenLog AI Food Scanner Endpoint Tests", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    mockLocalStorage.clear();
    
    // Setup Mock Fetch for Gemini Vision and USDA/OFF endpoints
    global.fetch = jest.fn().mockImplementation((url: string, init?: RequestInit) => {
      if (url.includes("generativelanguage.googleapis.com")) {
        const body = JSON.parse(init?.body as string);
        const cleanBase64 = body.contents[0].parts[1].inlineData.data;

        let responseText = "";

        if (cleanBase64 === "jalebi") {
          responseText = JSON.stringify({
            foods: [
              { name: "Jalebi", estimated_weight_g: 75, confidence: 0.95 }
            ]
          });
        } else if (cleanBase64 === "pizza") {
          responseText = JSON.stringify({
            foods: [
              { name: "Cheese Pizza (Classic Slice)", estimated_weight_g: 150, confidence: 0.92 }
            ]
          });
        } else if (cleanBase64 === "paneer") {
          responseText = JSON.stringify({
            foods: [
              { name: "Amul Fresh Paneer", estimated_weight_g: 150, confidence: 0.90 }
            ]
          });
        } else if (cleanBase64 === "rice") {
          responseText = JSON.stringify({
            foods: [
              { name: "Steamed Basmati Rice", estimated_weight_g: 200, confidence: 0.98 }
            ]
          });
        } else if (cleanBase64 === "dal") {
          responseText = JSON.stringify({
            foods: [
              { name: "Dal Tadka (Arhar/Toor Dal)", estimated_weight_g: 150, confidence: 0.94 }
            ]
          });
        } else if (cleanBase64 === "mixed_thali") {
          responseText = JSON.stringify({
            foods: [
              { name: "Steamed Basmati Rice", estimated_weight_g: 200, confidence: 0.96 },
              { name: "Dal Tadka (Arhar/Toor Dal)", estimated_weight_g: 150, confidence: 0.94 },
              { name: "Whole Wheat Roti / Chapati", estimated_weight_g: 35, confidence: 0.97 },
              { name: "Amul Fresh Paneer", estimated_weight_g: 100, confidence: 0.92 }
            ]
          });
        } else {
          responseText = JSON.stringify({
            foods: [
              { name: "Generic Food", estimated_weight_g: 100, confidence: 0.85 }
            ]
          });
        }

        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            candidates: [
              {
                content: {
                  parts: [
                    { text: responseText }
                  ]
                }
              }
            ]
          })
        });
      } else if (url.includes("api.nal.usda.gov") || url.includes("openfoodfacts.org")) {
        // Mock USDA/OFF API search endpoints to return empty lists immediately
        // so that searchFoodsOfflineOnline uses local preseeded matching
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ foods: [], products: [] }),
        });
      }

      return originalFetch(url, init);
    }) as any;
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  const performScanRequest = async (foodType: string) => {
    const req = new Request("http://localhost:3000/api/scan", {
      method: "POST",
      body: JSON.stringify({
        imageBase64: `data:image/jpeg;base64,${foodType}`,
        mimeType: "image/jpeg",
        clientApiKey: "AIzaSyFakeKey"
      })
    });
    const res = await POST(req);
    return await res.json();
  };

  test("Scan Jalebi: correctly detects, queries database, and scales nutrition", async () => {
    const res = await performScanRequest("jalebi");
    expect(res.success).toBe(true);
    expect(res.foods.length).toBe(1);

    const food = res.foods[0];
    expect(food.name).toBe("Jalebi");
    expect(food.estimatedWeightG).toBe(75);
    expect(food.calories).toBe(300); // 300 kcal per 75g serving
    expect(food.protein).toBe(2.2);
    expect(food.carbs).toBe(58);
    expect(food.fat).toBe(7);
    expect(food.confidence).toBe(0.95);
  });

  test("Scan Pizza: scales metrics based on portion size", async () => {
    const res = await performScanRequest("pizza");
    expect(res.success).toBe(true);
    const food = res.foods[0];
    
    expect(food.name).toBe("Cheese Pizza (Classic Slice)");
    expect(food.estimatedWeightG).toBe(150);
    // Base: 266 kcal per 100g. Scale 1.5 -> 399 kcal
    expect(food.calories).toBe(399);
    expect(food.protein).toBe(17); // 11.3 * 1.5 = 16.95 -> 17
    expect(food.carbs).toBe(45); // 30.0 * 1.5 = 45
    expect(food.fat).toBe(15.2); // 10.1 * 1.5 = 15.15 -> 15.2
    expect(food.confidence).toBe(0.92);
  });

  test("Scan Paneer: scales base values correctly", async () => {
    const res = await performScanRequest("paneer");
    expect(res.success).toBe(true);
    const food = res.foods[0];

    expect(food.name).toBe("Amul Fresh Paneer");
    expect(food.estimatedWeightG).toBe(150);
    // Base: 290 kcal per 100g. Scale 1.5 -> 435 kcal
    expect(food.calories).toBe(435);
    expect(food.protein).toBe(30); // 20 * 1.5 = 30
    expect(food.fat).toBe(34.2); // 22.8 * 1.5 = 34.2
  });

  test("Scan Rice: maps serving size bowl to grams", async () => {
    const res = await performScanRequest("rice");
    expect(res.success).toBe(true);
    const food = res.foods[0];

    expect(food.name).toBe("Steamed Basmati Rice");
    expect(food.estimatedWeightG).toBe(200);
    // Base: 195 kcal per 1 bowl (150g). Scale 200/150 = 1.333 -> 195 * 1.333 = 260
    expect(food.calories).toBe(260);
  });

  test("Scan Dal: maps Yellow Dal Tadka", async () => {
    const res = await performScanRequest("dal");
    expect(res.success).toBe(true);
    const food = res.foods[0];

    expect(food.name).toBe("Dal Tadka (Arhar/Toor Dal)");
    expect(food.estimatedWeightG).toBe(150);
    // Base: 150 kcal per 150g -> 150 kcal
    expect(food.calories).toBe(150);
    expect(food.protein).toBe(7);
    expect(food.carbs).toBe(22);
    expect(food.fat).toBe(4);
  });

  test("Scan Mixed Thali: detects multiple food items concurrently", async () => {
    const res = await performScanRequest("mixed_thali");
    expect(res.success).toBe(true);
    expect(res.foods.length).toBe(4);

    const rice = res.foods.find((f: any) => f.name === "Steamed Basmati Rice");
    const dal = res.foods.find((f: any) => f.name === "Dal Tadka (Arhar/Toor Dal)");
    const roti = res.foods.find((f: any) => f.name === "Whole Wheat Roti / Chapati");
    const paneer = res.foods.find((f: any) => f.name === "Amul Fresh Paneer");

    expect(rice).toBeDefined();
    expect(dal).toBeDefined();
    expect(roti).toBeDefined();
    expect(paneer).toBeDefined();

    // Assert portion weight and calorie scale
    expect(rice.estimatedWeightG).toBe(200);
    expect(rice.calories).toBe(260);

    expect(dal.estimatedWeightG).toBe(150);
    expect(dal.calories).toBe(150);

    expect(roti.estimatedWeightG).toBe(35);
    expect(roti.calories).toBe(85); // 1 Roti (35g) base

    expect(paneer.estimatedWeightG).toBe(100);
    expect(paneer.calories).toBe(290); // 100g base
  });
});
