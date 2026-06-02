"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";
import { ArrowLeft, Send, Sparkles, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "model";
  text: string;
  timestamp: Date;
}

export default function ChatbotPage() {
  const { user } = useAuth();
  const { meals, weightLogs, targets, onboardingData } = useApp();
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

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

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Trigger initial report on load if empty
  useEffect(() => {
    if (user && messages.length === 0) {
      triggerInitialAssessment();
    }
  }, [user]);

  const triggerInitialAssessment = async () => {
    if (!user) return;
    setLoading(true);
    setApiError(null);

    const assessmentPrompt = "Please analyze my user profile, food logs, and weight progress, and output: 1. Calorie Recommendations, 2. Protein Recommendations, 3. Meal Suggestions, and 4. Weight Loss / Fitness Advice. Keep it concise and format under 150 words.";

    try {
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
        dietPreference: onboardingData?.dietPreference || "vegetarian",
        weightProgress: weightLogs,
        foodLogs: meals
      };

      const clientApiKey = typeof window !== "undefined" 
        ? localStorage.getItem("zenlog_client_gemini_api_key") 
        : null;

      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: assessmentPrompt,
          userContext,
          clientApiKey: clientApiKey || undefined
        })
      });

      const resData = await response.json();
      
      if (!response.ok) {
        throw new Error(resData.error || "Failed to load assessment.");
      }

      if (resData.reply) {
        setMessages([
          {
            role: "model",
            text: resData.reply,
            timestamp: new Date()
          }
        ]);
      }
    } catch (e: any) {
      console.error(e);
      setApiError("Failed to trigger AI analysis. Tap retry below.");
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

    // Append user message
    const updatedMessages = [
      ...messages,
      { role: "user" as const, text: userText, timestamp: new Date() }
    ];
    setMessages(updatedMessages);
    setLoading(true);

    try {
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
        dietPreference: onboardingData?.dietPreference || "vegetarian",
        weightProgress: weightLogs,
        foodLogs: meals
      };

      const clientApiKey = typeof window !== "undefined" 
        ? localStorage.getItem("zenlog_client_gemini_api_key") 
        : null;

      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userText,
          userContext,
          clientApiKey: clientApiKey || undefined
        })
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || "Failed to communicate with AI.");
      }

      if (resData.reply) {
        setMessages((prev) => [
          ...prev,
          {
            role: "model",
            text: resData.reply,
            timestamp: new Date()
          }
        ]);
      }
    } catch (e: any) {
      console.error(e);
      setApiError("Connection timed out. Please try sending again.");
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
            <span className="text-[10px] tracking-widest font-black uppercase text-slate-400 font-mono">ZenLog Coach</span>
            <h1 className="text-xl font-black tracking-tight font-outfit mt-0.5 text-black">
              AI Nutrition & Fitness
            </h1>
          </div>
        </div>

        {/* Online dynamic badge */}
        <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100 text-[10px] font-black text-black">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
          </span>
          <span>COACH ACTIVE</span>
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
              Analyzing physical logs...
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
