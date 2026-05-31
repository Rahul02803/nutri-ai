import { UserProfile, Meal, WeightLog } from "../store/useStore";

export interface WeeklySummaryReport {
  weightChangeKg: number;
  averageCalories: number;
  proteinGoalAchievedDays: number;
  proteinGoalTotalDays: number;
  aiCoachRecommendation: string;
  generatedDate: string;
}

/**
 * 1. Weekly AI Coaching Aggregator
 * Generates structured performance feedback based on the past 7 days logs
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

  // Gemini Coach Instruction prompt for Weekly Summary analysis
  const systemInstruction = `You are a premium AI Nutrition Coach for ZenLog.
Analyze this user's weekly check-in statistics:
- Weight Change: ${weightChangeKg > 0 ? `+${weightChangeKg}` : weightChangeKg} kg
- Average Daily Calories: ${averageCalories} kcal
- Protein Goals Met: ${proteinGoalAchievedDays} out of 7 days (Target: ${targetProtein}g daily)
- Overall Target: ${user.goal?.toUpperCase() || "MAINTAIN"}

Formulate a highly professional, clinical, encouraging 2-sentence recommendation advising on calorie adjustments, macro splits, or step count adjustments. Use under 60 words.`;

  let aiCoachRecommendation = `Maintain your steady fat loss by increasing daily protein by 10g and keeping steps above 8,000 to sustain metabolic expenditure splits.`;

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      const payload = {
        contents: [
          {
            role: "user",
            parts: [{ text: systemInstruction }]
          }
        ],
        generationConfig: {
          maxOutputTokens: 150,
          temperature: 0.5
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
        if (text) aiCoachRecommendation = text.trim();
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
    generatedDate
  };
}

/**
 * 2. Simulated Push Notification trigger
 */
export function triggerWeeklyNotification() {
  console.log("Triggered Sunday Weekly Assessment report notification successfully.");
}
