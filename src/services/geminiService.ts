import { NextResponse } from "next/server";

export interface UserContext {
  name: string;
  currentWeight: number;
  targetWeight: number;
  goal: string;
  targetCalories: number;
  loggedCalories: number;
  targetProtein: number;
  loggedProtein: number;
  activityLevel: string;
  dietPreference: string;
  weightProgress?: any[];
  foodLogs?: any[];
}

export interface StructuredCoachResponse {
  summary: string;
  caloriesRecommendation: number;
  proteinRecommendation: number;
  advice: string[];
  warnings: string[];
  nextSteps: string[];
}

/**
 * Production-ready Gemini API Service for ZenZi Coach
 */
export class GeminiService {
  private static STABLE_MODEL = "gemini-1.5-flash";
  private static API_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";

  /**
   * Generates a local fallback response if Gemini fails completely
   */
  public static getFallbackResponse(context: UserContext, errorMsg: string): StructuredCoachResponse {
    console.warn(`[ZenZi Fallback Engine] Active due to API failure: ${errorMsg}`);
    
    const name = context.name || "ZenLog Member";
    const goal = context.goal?.toLowerCase() || "maintain";
    const targetCalories = context.targetCalories || 2000;
    const targetProtein = context.targetProtein || 140;

    let summary = `Hi ${name}, I detected a connection issue with my main server, so I'm generating your daily report using my local backup engine. We are currently focusing on your ${goal.toUpperCase()} phase.`;
    
    let advice = [
      "Prioritize high-fiber Indian meals like dal, roasted chana, and vegetables to keep satiety levels high.",
      "Stay hydrated by consuming at least 3-4 liters of water throughout the day.",
      "Ensure you hit 7-8 hours of sleep to keep cortisol levels low and aid recovery."
    ];
    
    let warnings = [];
    if (context.loggedCalories > targetCalories + 200) {
      warnings.push("You have exceeded your target calorie budget for today. Focus on light activity like walking to balance it.");
    }
    if (context.loggedCalories > 0 && context.loggedProtein < (targetProtein * 0.5)) {
      warnings.push("Your protein intake today is currently low relative to your calories. Aim to incorporate high-protein snacks.");
    }

    let nextSteps = [
      `Aim to eat a high-protein dinner containing paneer, tofu, lentils, or egg whites to meet your remaining target.`,
      `Track your weight again tomorrow morning to keep the auto-calibration engine updated.`
    ];

    return {
      summary,
      caloriesRecommendation: targetCalories,
      proteinRecommendation: targetProtein,
      advice,
      warnings: warnings.length > 0 ? warnings : ["No major warnings today. Keep maintaining your routine!"],
      nextSteps
    };
  }

  /**
   * Safe fetch call with timeout handling
   */
  private static async fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 8000): Promise<Response> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(id);
      return response;
    } catch (err: any) {
      clearTimeout(id);
      throw err;
    }
  }

  /**
   * Calls the Gemini API with auto-retries and safe response validation
   */
  public static async generateCoaching(
    prompt: string,
    context: UserContext,
    apiKey: string
  ): Promise<StructuredCoachResponse> {
    const url = `${this.API_ENDPOINT}/${this.STABLE_MODEL}:generateContent?key=${apiKey}`;
    
    const systemPrompt = `You are ZenZi, an elite AI nutrition and fitness coach.
You analyze the user's logs and goals to provide structured advice.
User Context:
- Name: ${context.name}
- Current Weight: ${context.currentWeight} kg (Target: ${context.targetWeight} kg)
- Transformation Goal: ${context.goal.toUpperCase()}
- Daily Target: ${context.targetCalories} kcal (Consumed: ${context.loggedCalories} kcal)
- Daily Protein: ${context.targetProtein}g (Consumed: ${context.loggedProtein}g)
- Diet Preference: ${context.dietPreference}
- Activity Level: ${context.activityLevel}

You MUST return a response that is strictly valid JSON matching this exact structure:
{
  "summary": "Concise summary of their current progress and status.",
  "caloriesRecommendation": ${context.targetCalories},
  "proteinRecommendation": ${context.targetProtein},
  "advice": ["Actionable advice 1", "Actionable advice 2", "Actionable advice 3"],
  "warnings": ["Warning/Alert 1 if any, otherwise positive note"],
  "nextSteps": ["Specific next step 1", "Specific next step 2"]
}

Rules:
1. Suggest primarily Indian home-cooked foods matching their preference (${context.dietPreference}).
2. Do NOT add any markdown format like \`\`\`json or \`\`\`. Your output must contain ONLY the raw JSON string.
3. Be encouraging, precise, and practical.`;

    const payload = {
      contents: [
        {
          role: "user",
          parts: [{ text: `${systemPrompt}\n\nUser Message/Request: ${prompt}` }]
        }
      ],
      generationConfig: {
        maxOutputTokens: 600,
        temperature: 0.2,
        responseMimeType: "application/json"
      }
    };

    let attempt = 0;
    const maxAttempts = 3;
    let lastError = "";

    while (attempt < maxAttempts) {
      attempt++;
      try {
        console.log(`[ZenZi API] Sending request to Gemini (Attempt ${attempt}/${maxAttempts})...`);
        const response = await this.fetchWithTimeout(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }, 6000); // 6s timeout per request

        // Validate response format & headers
        const contentType = response.headers.get("content-type") || "";
        if (!response.ok) {
          const errText = await response.text().catch(() => "Unknown error");
          throw new Error(`Google API failed (Status ${response.status}): ${errText}`);
        }

        if (!contentType.includes("application/json")) {
          const rawText = await response.text().catch(() => "");
          throw new Error(`Received non-JSON content: ${rawText.substring(0, 100)}`);
        }

        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!text) {
          throw new Error("Gemini returned empty text response candidates.");
        }

        // Validate JSON format
        const cleanText = text.trim();
        const parsed: StructuredCoachResponse = JSON.parse(cleanText);
        
        if (!parsed.summary || typeof parsed.caloriesRecommendation !== 'number') {
          throw new Error("Response JSON lacks required schema keys.");
        }

        console.log(`[ZenZi API] Success! Response processed in ${(attempt)} attempts.`);
        return parsed;

      } catch (err: any) {
        lastError = err?.message || "Unknown error occurred";
        console.error(`[ZenZi API] Attempt ${attempt} failed: ${lastError}`);
        
        // Wait with simple backoff before retrying
        if (attempt < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
        }
      }
    }

    throw new Error(`All ${maxAttempts} attempts failed. Last error: ${lastError}`);
  }
}
