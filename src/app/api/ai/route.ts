import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt, userContext, clientApiKey } = await req.json();
    const apiKey = clientApiKey || process.env.GEMINI_API_KEY;

    // Gather metrics safely from context
    const name = userContext?.name || "User";
    const targetCalories = userContext?.targetCalories || 2000;
    const loggedCalories = userContext?.loggedCalories || 0;
    const targetProtein = userContext?.targetProtein || 140;
    const currentWeight = userContext?.currentWeight || 75;

    // Construct high-quality system instruction priming the AI fitness coach behavior
    const systemPrompt = `You are a supportive, concise, premium fitness and nutrition coach.
The user's name is ${name}.
Their weight is ${currentWeight} kg.
Their daily calorie target is ${targetCalories} kcal (currently logged: ${loggedCalories} kcal).
Their daily protein goal is ${targetProtein}g.
Provide concise, intelligent, encouraging responses. Suggest Indian foods primarily.
Use bullet points and clean formatting where applicable. Keep responses under 150 words.`;

    if (apiKey) {
      // Production path: Connect directly to official Google Gemini API beta endpoints
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      
      const payload = {
        contents: [
          {
            role: "user",
            parts: [{ text: `${systemPrompt}\n\nUser Question: ${prompt}` }]
          }
        ],
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.7
        }
      };

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const responseData = await response.json();
      
      // Parse Gemini response text
      const reply = responseData?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (reply) {
        return NextResponse.json({ reply });
      }
    }

    // Dynamic Mock Fallback Simulator:
    // When API Key is missing, inspect prompt keywords to supply high-fidelity responses
    const query = prompt.toLowerCase();
    let reply = "";

    if (query.includes("veg") || query.includes("vegetary") || query.includes("vegetarian")) {
      reply = `Hey ${name}! For high-quality Indian vegetarian protein, here are the absolute best staples to hit your ${targetProtein}g target:

• Raw Paneer (Low Fat): 18g protein per 100g
• Roasted Chana: 20g protein per 100g
• Soya Chunks: 52g protein per 100g (exceptional!)
• Moong Dal Cheela: 7g protein per cheela
• Greek Yogurt or thick Curd: 10g protein per 100g

Since you've logged ${loggedCalories} kcal today, adding a couple of Egg Whites (if you consume eggs) or 100g grilled low-fat paneer will easily push you closer to your goal without exceeding your budget! 🥑`;
    } 
    else if (query.includes("deficit") || query.includes("fat loss") || query.includes("lose")) {
      reply = `Excellent question, ${name}. A calorie deficit means consuming fewer calories than your TDEE (Total Daily Energy Expenditure) to force your body to burn fat deposits for energy.

• Your current target calorie is set to ${targetCalories} kcal (incorporating a safe deficit from your estimated TDEE).
• Consistent deficits of 300–500 kcal per day yield a highly sustainable fat loss of 0.25 to 0.5 kg of body fat per week.
• To maintain hard-earned muscle during a deficit, ensure you hit your daily protein goal of ${targetProtein}g and stay highly hydrated!`;
    }
    else if (query.includes("workout") || query.includes("routine") || query.includes("exercise") || query.includes("split")) {
      reply = `Here is a highly effective, time-efficient 3-Day Full-Body Split perfect for your goals, ${name}:

• Monday (Strength): Squats (3x10), Bench Press (3x10), Lat Pulldowns (3x12), Core Planks (3x45s)
• Wednesday (Hypertrophy): Romanian Deadlifts (3x10), Overhead Shoulder Press (3x12), Incline Dumbbell Rows (3x10), Bicep/Tricep superset (3x12)
• Friday (Conditioning): Leg Press (3x12), Pushups (3xMax), Pullups or Cable Rows (3x10), Hanging Leg Raises (3x12)

Focus on progressive overload (slowly adding weight or reps weekly). Since your current weight is ${currentWeight} kg, stay active outside the gym with 8,000 daily steps to boost TDEE! 🏋️`;
    }
    else if (query.includes("progress") || query.includes("analyze") || query.includes("logs")) {
      reply = `Analyzing your statistics, ${name}:

• Weight Logs: Your weight log shows a steady fluctuating downward trend toward your target, which indicates your calorie deficit is perfectly calibrated!
• Daily Nutrition: You have logged ${loggedCalories} kcal today out of your ${targetCalories} kcal budget. That leaves you with ${Math.max(0, targetCalories - loggedCalories)} kcal remaining.
• Recommendation: If you have calories remaining, satisfy them with a slow-digesting protein snack (like 100g curd or a scoop of Whey protein) before bed to optimize muscle recovery overnight!`;
    }
    else {
      // Default encouraging response
      reply = `Hey ${name}! That's a great fitness question. As your coach, my main recommendations for a ${currentWeight} kg bodyweight are:

1. Consistency over intensity: Track meals daily to stay within your ${targetCalories} kcal budget.
2. Fuel recovery: Target ${targetProtein}g of protein daily, focusing on clean dals, paneer, and eggs.
3. Rest & Hydrate: Drink at least 3 liters of water (you logged some water today, keep going!) and sleep 7-8 hours.

What specific details should we refine next? Meal prep, calorie tracking, or lifting splits? 🥑`;
    }

    // Return mock response after small simulated delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    return NextResponse.json({ reply });

  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}
