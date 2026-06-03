import { UserProfile, Meal, WeightLog } from "../store/useStore";

export interface WeeklySummaryReport {
  weightChangeKg: number;
  averageCalories: number;
  proteinGoalAchievedDays: number;
  proteinGoalTotalDays: number;
  aiCoachRecommendation: string;
  newTargetCalories: number;
  newTargetProtein: number;
  generatedDate: string;
}

/**
 * 1. Weekly AI Coaching Aggregator
 * Generates structured performance feedback and adjusts macros based on the past 7 days logs
 */
export async function generateWeeklySummaryReport(
  user: UserProfile,
  meals: Meal[],
  weightLogs: WeightLog[]
): Promise<WeeklySummaryReport> {
  const generatedDate = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  
  // Calculate weight delta over past 7 days
  let weightChangeKg = 0;
  if (weightLogs.length > 1) {
    const sorted = [...weightLogs].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    const latest = sorted[sorted.length - 1].weight;
    const baseIndex = Math.max(0, sorted.length - 8);
    const baseline = sorted[baseIndex].weight;
    weightChangeKg = Math.round((latest - baseline) * 10) / 10;
  }

  // Calculate calories average & protein consistency
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split("T")[0];
  });

  let totalCal = 0;
  let proteinGoalAchievedDays = 0;
  const targetProtein = user.target_protein || 140;
  const oldCalories = user.target_calories || 2000;

  last7Days.forEach((dateStr) => {
    const dayMeals = meals.filter((m) => m.created_at.startsWith(dateStr));
    const dayCal = dayMeals.reduce((sum, m) => sum + m.calories, 0);
    const dayPro = dayMeals.reduce((sum, m) => sum + m.protein, 0);

    totalCal += dayCal;
    if (dayPro >= targetProtein) {
      proteinGoalAchievedDays += 1;
    }
  });

  const averageCalories = Math.round(totalCal / 7);

// Gemini 1.5 Pro Instruction prompt for Weekly Summary analysis
  const systemInstruction = `You are a premium AI Nutrition Coach for ZenLog.
Analyze this user's weekly check-in statistics:
- Current Target Calories: ${oldCalories} kcal
- Current Target Protein: ${targetProtein}g
- Weight Change: ${weightChangeKg > 0 ? "+" + weightChangeKg : weightChangeKg} kg
- Average Daily Consumed Calories: ${averageCalories} kcal
- Protein Goals Met: ${proteinGoalAchievedDays} out of 7 days
- Overall Transformation Target: ${user.goal?.toUpperCase() || "MAINTAIN"}

Adjust their caloric and protein targets if they are stalling or losing/gaining too fast.
Formulate a highly professional, clinical, encouraging 2-sentence recommendation.
Return your response STRICTLY as a valid JSON object matching this structure:
{
  "recommendation": "Your coaching message...",
  "newTargetCalories": 2100,
  "newTargetProtein": 150
}`;

  let aiCoachRecommendation = `Maintain your steady fat loss by increasing daily protein by 10g and keeping steps above 8,000 to sustain metabolic expenditure splits.`;
  let newTargetCalories = oldCalories;
  let newTargetProtein = targetProtein;

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      // Upgraded to Gemini 1.5 Pro for advanced reasoning
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`;
      const payload = {
        contents: [
          {
            role: "user",
            parts: [{ text: systemInstruction }]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json"
        }
      };

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const resData = await response.json();
        const text = resData?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const parsed = JSON.parse(text);
          aiCoachRecommendation = parsed.recommendation || aiCoachRecommendation;
          newTargetCalories = parsed.newTargetCalories || newTargetCalories;
          newTargetProtein = parsed.newTargetProtein || newTargetProtein;
        }
      }
    }
  } catch (e) {
    console.error("Weekly AI coach aggregate call failed:", e);
  }

  return {
    weightChangeKg,
    averageCalories,
    proteinGoalAchievedDays,
    proteinGoalTotalDays: 7,
    aiCoachRecommendation,
    newTargetCalories,
    newTargetProtein,
    generatedDate
  };
}

/**
 * 2. Simulated Push Notification trigger
 */
export function triggerWeeklyNotification() {
  console.log("Triggered Sunday Weekly Assessment report notification successfully.");
}
