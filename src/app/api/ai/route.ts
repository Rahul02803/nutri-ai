import { NextResponse } from "next/server";
import { GeminiService, UserContext } from "@/services/geminiService";

export async function POST(req: Request) {
  let userContext: UserContext | null = null;
  
  try {
    const { prompt, userContext: incomingContext, clientApiKey } = await req.json();
    userContext = incomingContext;

    if (!userContext) {
      return NextResponse.json({ error: "Missing userContext in request payload." }, { status: 400 });
    }

    const apiKey = clientApiKey || process.env.GEMINI_API_KEY;
    const name = userContext.name || "ZenLog Member";
    const loggedCalories = userContext.loggedCalories || 0;
    const loggedProtein = userContext.loggedProtein || 0;

    console.log(`[ZenZi API] Request received for: ${name}. Prompt: "${prompt}"`);

    // Verify key configuration (Step 1)
    if (!apiKey) {
      console.warn("[ZenZi API] GEMINI_API_KEY is not defined. Triggering local fallback system.");
      const fallbackData = GeminiService.getFallbackResponse(userContext, "Missing API Key configuration.");
      
      const formattedReply = `🤖 **ZenZi Local Advisor** (Offline Fallback)

${fallbackData.summary}

**Daily Targets:**
• Calorie Recommendation: **${fallbackData.caloriesRecommendation} kcal** (Logged: ${loggedCalories} kcal)
• Protein Recommendation: **${fallbackData.proteinRecommendation}g** (Logged: ${loggedProtein}g)

**Advice:**
${fallbackData.advice.map((item) => `• ${item}`).join("\n")}

**Warnings:**
${fallbackData.warnings.map((item) => `⚠️ ${item}`).join("\n")}

**Next Steps:**
${fallbackData.nextSteps.map((item) => `👉 ${item}`).join("\n")}`;

      return NextResponse.json({
        reply: formattedReply,
        ...fallbackData
      });
    }

    // Call production API service (Step 4 & 5)
    try {
      const result = await GeminiService.generateCoaching(prompt, userContext, apiKey);
      
      const formattedReply = `🤖 **ZenZi Coach Insights**

${result.summary}

**Daily Targets:**
• Calorie Recommendation: **${result.caloriesRecommendation} kcal** (Logged: ${loggedCalories} kcal)
• Protein Recommendation: **${result.proteinRecommendation}g** (Logged: ${loggedProtein}g)

**Advice:**
${result.advice.map((item) => `• ${item}`).join("\n")}

**Warnings:**
${result.warnings.map((item) => `⚠️ ${item}`).join("\n")}

**Next Steps:**
${result.nextSteps.map((item) => `👉 ${item}`).join("\n")}`;

      return NextResponse.json({
        reply: formattedReply,
        ...result
      });

    } catch (apiErr: any) {
      console.error("[ZenZi API] Gemini API interaction failed, falling back:", apiErr.message);
      
      // Automatic local fallback fallback system (Step 11)
      const fallbackData = GeminiService.getFallbackResponse(userContext, apiErr.message);
      
      const formattedReply = `🤖 **ZenZi Local Advisor** (API Fallback)

${fallbackData.summary}

**Daily Targets:**
• Calorie Recommendation: **${fallbackData.caloriesRecommendation} kcal** (Logged: ${loggedCalories} kcal)
• Protein Recommendation: **${fallbackData.proteinRecommendation}g** (Logged: ${loggedProtein}g)

**Advice:**
${fallbackData.advice.map((item) => `• ${item}`).join("\n")}

**Warnings:**
${fallbackData.warnings.map((item) => `⚠️ ${item}`).join("\n")}

**Next Steps:**
${fallbackData.nextSteps.map((item) => `👉 ${item}`).join("\n")}`;

      return NextResponse.json({
        reply: formattedReply,
        ...fallbackData
      });
    }

  } catch (error: any) {
    console.error("[ZenZi API] Fatal exception in API route:", error);
    
    // Safety guard to never return raw server crash or JSON parsing crashes
    if (userContext) {
      const fallbackData = GeminiService.getFallbackResponse(userContext, error?.message || "Unknown error");
      const formattedReply = `🤖 **ZenZi Local Advisor** (System Guard Fallback)\n\nAn unexpected error occurred while analyzing your logs: ${error?.message || "Unknown error"}`;
      return NextResponse.json({
        reply: formattedReply,
        ...fallbackData
      });
    }
    
    return NextResponse.json(
      { error: "ZenZi Coach failed to trigger analysis. Please check context structure." },
      { status: 500 }
    );
  }
}
