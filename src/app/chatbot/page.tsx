"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";
import { ArrowLeft, Send, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "model";
  text: string;
  timestamp: Date;
}

interface StructuredResponse {
  summary: string;
  caloriesRecommendation: number;
  proteinRecommendation: number;
  advice: string[];
  warnings: string[];
  nextSteps: string[];
}

export default function ChatbotPage() {
  const { user } = useAuth();
  const { meals, weightLogs, targets, onboardingData } = useApp();
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentWeight = weightLogs.length > 0 
    ? weightLogs[weightLogs.length - 1].weight 
    : (onboardingData?.currentWeight || 70);

  const loggedCalories = meals
    .filter((m) => m.loggedDate === new Date().toISOString().split("T")[0])
    .reduce((sum, m) => sum + (m.calories * m.servings), 0);

  const loggedProtein = meals
    .filter((m) => m.loggedDate === new Date().toISOString().split("T")[0])
    .reduce((sum, m) => sum + (m.protein * m.servings), 0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Offline detection
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsOffline(!navigator.onLine);
      const handleOnline = () => setIsOffline(false);
      const handleOffline = () => setIsOffline(true);
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, []);

  // Load cached chat history
  useEffect(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("zenlog_coach_chat_history_v3");
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          const mapped = parsed.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp)
          }));
          setMessages(mapped);
        } catch (e) {
          console.error("Failed to parse cached chat history", e);
        }
      }
    }
  }, []);

  // Save chat history
  useEffect(() => {
    if (messages.length > 0 && typeof window !== "undefined") {
      localStorage.setItem("zenlog_coach_chat_history_v3", JSON.stringify(messages));
    }
  }, [messages]);

  // Trigger initial report on load if empty
  useEffect(() => {
    if (user && messages.length === 0) {
      triggerInitialAssessment();
    }
  }, [user]);

  /**
   * Helper to generate a local fallback response
   */
  const getLocalFallback = (context: any, reason: string): StructuredResponse => {
    console.warn(`[ZenZi Local Fallback] Triggered: ${reason}`);
    
    const name = context.name || "ZenLog Member";
    const goal = context.goal?.toLowerCase() || "maintain";
    const targetCalories = context.targetCalories || 2000;
    const targetProtein = context.targetProtein || 140;

    let summary = `Hi ${name}, I am generating your daily report using my local backup engine. We are currently focusing on your ${goal.toUpperCase()} phase.`;
    
    let advice = [
      "Prioritize high-fiber Indian meals like dal, roasted chana, and vegetables to keep satiety levels high.",
      "Stay hydrated by consuming at least 3-4 liters of water throughout the day.",
      "Ensure you hit 7-8 hours of sleep to keep cortisol levels low and aid recovery."
    ];
    
    let warnings = [];
    if (loggedCalories > targetCalories + 200) {
      warnings.push("You have exceeded your target calorie budget for today. Focus on light activity like walking to balance it.");
    }
    if (loggedCalories > 0 && loggedProtein < (targetProtein * 0.5)) {
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
  };

  /**
   * Directly queries the Gemini API client-side to bypass static Next.js export constraints
   */
  const callGeminiDirectly = async (promptText: string, context: any): Promise<StructuredResponse> => {
    const clientApiKey = typeof window !== "undefined" 
      ? localStorage.getItem("zenlog_client_gemini_api_key") 
      : null;

    // NEXT_PUBLIC_ variables can be compiled directly in the bundle
    const apiKey = clientApiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
    
    if (!apiKey) {
      throw new Error("Missing API Key configuration. Using offline fallback.");
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const systemPrompt = `You are ZenZi, an elite AI nutrition and fitness coach.
You analyze the user's logs and goals to provide structured advice.
User Context:
- Name: ${context.name}
- Current Weight: ${context.currentWeight} kg (Target: ${context.targetWeight} kg)
- Goal: ${context.goal.toUpperCase()}
- Calorie Budget: ${context.targetCalories} kcal (Consumed: ${context.loggedCalories} kcal)
- Protein Goal: ${context.targetProtein}g (Consumed: ${context.loggedProtein}g)
- Diet Preference: ${context.dietPreference}
- Activity Level: ${context.activityLevel}

You MUST return a response that is strictly valid JSON matching this exact structure:
{
  "summary": "Concise summary of progress and status.",
  "caloriesRecommendation": ${context.targetCalories},
  "proteinRecommendation": ${context.targetProtein},
  "advice": ["Advice 1", "Advice 2", "Advice 3"],
  "warnings": ["Warning 1 if any, otherwise positive note"],
  "nextSteps": ["Next step 1", "Next step 2"]
}

Do NOT use markdown backticks like \`\`\`json or \`\`\`. Return ONLY raw JSON.`;

    const payload = {
      contents: [
        {
          role: "user",
          parts: [{ text: `${systemPrompt}\n\nUser Message/Request: ${promptText}` }]
        }
      ],
      generationConfig: {
        maxOutputTokens: 600,
        temperature: 0.2,
        responseMimeType: "application/json"
      }
    };

    // Safe fetch with 6s timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Google API returned status ${response.status}`);
    }

    const resData = await response.json();
    const replyText = resData?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!replyText) {
      throw new Error("Empty candidates returned from Gemini.");
    }

    return JSON.parse(replyText.trim());
  };

  const triggerInitialAssessment = async () => {
    if (!user) return;
    setLoading(true);
    setApiError(null);

    const userContext = {
      name: user.name || "ZenLog Member",
      currentWeight: currentWeight,
      targetWeight: onboardingData?.targetWeight || currentWeight,
      goal: onboardingData?.goal || "maintain",
      targetCalories: targets?.targetCalories || 2000,
      loggedCalories: loggedCalories,
      targetProtein: targets?.targetProtein || 140,
      loggedProtein: loggedProtein,
      activityLevel: onboardingData?.activityLevel || "moderate",
      dietPreference: onboardingData?.dietPreference || "vegetarian"
    };

    const assessmentPrompt = "Please analyze my user profile, food logs, and weight progress, and output: 1. Calorie Recommendations, 2. Protein Recommendations, 3. Meal Suggestions, and 4. Weight Loss / Fitness Advice. Keep it concise and format under 150 words.";

    try {
      const result = await callGeminiDirectly(assessmentPrompt, userContext);
      
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

      setMessages([
        {
          role: "model",
          text: formattedReply,
          timestamp: new Date()
        }
      ]);
    } catch (e: any) {
      console.warn("[ZenZi Client] Falling back to local coach simulation:", e.message);
      
      // Fallback
      const fallback = getLocalFallback(userContext, e.message);
      
      const formattedReply = `🤖 **ZenZi Local Advisor** (Fallback Engine Active)

${fallback.summary}

**Daily Targets:**
• Calorie Recommendation: **${fallback.caloriesRecommendation} kcal** (Logged: ${loggedCalories} kcal)
• Protein Recommendation: **${fallback.proteinRecommendation}g** (Logged: ${loggedProtein}g)

**Advice:**
${fallback.advice.map((item) => `• ${item}`).join("\n")}

**Warnings:**
${fallback.warnings.map((item) => `⚠️ ${item}`).join("\n")}

**Next Steps:**
${fallback.nextSteps.map((item) => `👉 ${item}`).join("\n")}`;

      setMessages([
        {
          role: "model",
          text: formattedReply,
          timestamp: new Date()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || loading || !user) return;

    const userText = inputVal.trim();
    setInputVal("");
    setApiError(null);

    const updatedMessages = [
      ...messages,
      { role: "user" as const, text: userText, timestamp: new Date() }
    ];
    setMessages(updatedMessages);
    setLoading(true);

    const userContext = {
      name: user.name || "ZenLog Member",
      currentWeight: currentWeight,
      targetWeight: onboardingData?.targetWeight || currentWeight,
      goal: onboardingData?.goal || "maintain",
      targetCalories: targets?.targetCalories || 2000,
      loggedCalories: loggedCalories,
      targetProtein: targets?.targetProtein || 140,
      loggedProtein: loggedProtein,
      activityLevel: onboardingData?.activityLevel || "moderate",
      dietPreference: onboardingData?.dietPreference || "vegetarian"
    };

    try {
      const result = await callGeminiDirectly(userText, userContext);
      
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

      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: formattedReply,
          timestamp: new Date()
        }
      ]);
    } catch (e: any) {
      console.warn("[ZenZi Client Send] Falling back to local responder:", e.message);
      
      const fallback = getLocalFallback(userContext, e.message);
      const query = userText.toLowerCase();
      let replyText = "";

      if (query.includes("veg") || query.includes("vegetary") || query.includes("vegetarian")) {
        replyText = `Hey ${userContext.name}! For high-quality Indian vegetarian protein, here are the absolute best staples to hit your ${fallback.proteinRecommendation}g target:
• Raw Paneer: 18g protein per 100g
• Roasted Chana: 20g protein per 100g
• Soya Chunks: 52g protein per 100g
• Moong Dal Cheela: 7g protein per cheela`;
      } else if (query.includes("deficit") || query.includes("fat loss") || query.includes("lose")) {
        replyText = `To lose weight, you should consume fewer calories than your TDEE. Your daily target calorie is set to ${fallback.caloriesRecommendation} kcal. To maintain muscle, hit your protein goal of ${fallback.proteinRecommendation}g!`;
      } else {
        replyText = `Hey! Here is my top coaching recommendation for your ${userContext.currentWeight} kg bodyweight:
1. Track your meals daily to stay within your ${fallback.caloriesRecommendation} kcal budget.
2. Fuel recovery by aiming for ${fallback.proteinRecommendation}g of protein daily.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: `🤖 **ZenZi Local Advisor** (Fallback Mode)\n\n${replyText}`,
          timestamp: new Date()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="mx-auto max-w-lg px-6 py-8 flex flex-col justify-between h-screen text-black bg-[#FFFFFF] font-inter selection:bg-black/10 select-none overflow-hidden relative">
      
      {/* 1. TOP NAVIGATION HEADER */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-100 shrink-0">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => router.push("/dashboard")}
            className="p-2 rounded-xl text-slate-400 hover:text-black hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <span className="text-[10px] tracking-widest font-black uppercase text-slate-400 font-mono">ZenZi Coach</span>
            <h1 className="text-xl font-black tracking-tight font-outfit mt-0.5 text-black">
              AI Nutrition & Fitness
            </h1>
          </div>
        </div>

        {/* Online/Offline Badge */}
        <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full border text-[10px] font-black ${
          isOffline 
            ? "bg-rose-50 border-rose-100 text-rose-800" 
            : "bg-slate-50 border-slate-100 text-black"
        }`}>
          <span className="relative flex h-1.5 w-1.5">
            {!isOffline && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
            <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${isOffline ? "bg-rose-500" : "bg-emerald-500"}`}></span>
          </span>
          <span>{isOffline ? "LOCAL ADVISOR" : "COACH ACTIVE"}</span>
        </div>
      </div>

      {/* 2. CHAT MESSAGE SCROLL WINDOW */}
      <div className="flex-grow overflow-y-auto space-y-4 py-6 pr-1 scrollbar-none flex flex-col">
        {messages.length === 0 && loading && (
          <div className="flex flex-col items-center justify-center space-y-3 h-full my-auto">
            <div className="h-10 w-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center animate-pulse">
              <Sparkles className="h-5 w-5 text-black" />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono animate-pulse">
              ZenZi is analyzing your nutrition...
            </p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => {
            const isModel = msg.role === "model";
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex w-full ${isModel ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-[85%] rounded-[24px] px-4.5 py-3.5 text-xs font-bold leading-relaxed whitespace-pre-line shadow-[0_4px_18px_rgba(0,0,0,0.01)] ${
                    isModel
                      ? "bg-[#F4F4F5] text-black border border-slate-100 rounded-tl-none text-left"
                      : "bg-black text-white rounded-tr-none text-left"
                  }`}
                >
                  <p>{msg.text}</p>
                  <span
                    className={`text-[8px] font-black uppercase mt-2.5 block text-right font-mono tracking-wider ${
                      isModel ? "text-slate-400" : "text-neutral-500"
                    }`}
                  >
                    {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {loading && messages.length > 0 && (
          <div className="flex justify-start">
            <div className="bg-[#F4F4F5] border border-slate-100 rounded-[24px] rounded-tl-none px-5 py-3.5 flex items-center space-x-1.5">
              <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}

        {apiError && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4 text-[10px] text-left text-rose-800 space-y-2 shrink-0">
            <p className="font-extrabold">{apiError}</p>
            <button
              onClick={triggerInitialAssessment}
              className="px-3.5 py-1.5 bg-rose-100 hover:bg-rose-200 font-black text-rose-900 rounded-lg uppercase tracking-wider font-mono text-[9px]"
            >
              Retry Connection
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. INPUT FORM SUBMISSION BOX */}
      <form
        onSubmit={handleSendMessage}
        className="flex items-center space-x-2 border-t border-slate-100 pt-4 pb-2 shrink-0 bg-white"
      >
        <input
          type="text"
          placeholder="Ask Coach: 'Suggest a high-protein Indian snack'..."
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          disabled={loading}
          className="flex-grow bg-[#F4F4F5] border border-transparent rounded-[20px] py-4.5 px-5 focus:outline-none focus:border-slate-300 font-bold text-xs text-black"
        />
        <button
          type="submit"
          disabled={loading || !inputVal.trim()}
          className="p-4 bg-black text-white hover:bg-slate-900 rounded-[20px] transition-all disabled:opacity-40 disabled:scale-100 active:scale-95 shrink-0"
        >
          <Send className="h-4.5 w-4.5" />
        </button>
      </form>

    </div>
  );
}
