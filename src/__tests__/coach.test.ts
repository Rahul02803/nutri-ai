import { POST } from "../app/api/ai/route";

describe("AI Nutrition Coach Recommendations Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Should verify veg nutrition suggestions return Paneer/Soya chunks for cutting veg users", async () => {
    const mockRequest = new Request("http://localhost:3000/api/ai", {
      method: "POST",
      body: JSON.stringify({
        prompt: "Recommend high-protein vegetarian Indian snacks",
        userContext: {
          name: "Amit",
          currentWeight: 80,
          targetWeight: 75,
          goal: "lose_fat",
          targetCalories: 1800,
          loggedCalories: 500,
          targetProtein: 150,
          loggedProtein: 20
        }
      })
    });

    const response = await POST(mockRequest);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.reply).toContain("Amit");
    expect(data.reply).toContain("Paneer");
    expect(data.reply).toContain("Soya Chunks");
  });

  test("Should verify weight loss calorie deficit advice fits calorie target parameters", async () => {
    const mockRequest = new Request("http://localhost:3000/api/ai", {
      method: "POST",
      body: JSON.stringify({
        prompt: "Explain my calorie deficit",
        userContext: {
          name: "Sara",
          currentWeight: 65,
          targetWeight: 60,
          goal: "lose_fat",
          targetCalories: 1400,
          loggedCalories: 200,
          targetProtein: 110,
          loggedProtein: 10
        }
      })
    });

    const response = await POST(mockRequest);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.reply).toContain("Sara");
    expect(data.reply).toContain("1400 kcal");
    expect(data.reply).toContain("deficit");
  });

  test("Should verify workout splits recommendation fits weight parameters", async () => {
    const mockRequest = new Request("http://localhost:3000/api/ai", {
      method: "POST",
      body: JSON.stringify({
        prompt: "Show my workout split details",
        userContext: {
          name: "Rahul",
          currentWeight: 90,
          targetWeight: 82,
          goal: "lose_fat",
          targetCalories: 2200,
          loggedCalories: 1100,
          targetProtein: 160,
          loggedProtein: 80
        }
      })
    });

    const response = await POST(mockRequest);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.reply).toContain("Rahul");
    expect(data.reply).toContain("90 kg");
    expect(data.reply).toContain("Split");
  });
});
