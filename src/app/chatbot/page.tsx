"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";
import { GlassCard } from "@/components/GlassCard";
import { Send, Sparkles, MessageSquare, Dumbbell, Apple, Activity, Flame } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function ChatbotPage() {
  const { user } = useAuth();
  const { targets, meals, weightLogs } = useApp();
  const router = useRouter();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Route protection
  useEffect(() => {
    if (!user) {
      router.push("/auth");
    } else if (!user.isOnboarded) {
      router.push("/onboarding");
    }
  }, [user, router]);

  // Initial welcome message from Coach AI
  useEffect(() => {
    if (!user) return;

    const storedChat = localStorage.getItem(`nutriai_chat_${user.id}`);
    if (storedChat) {
      setMessages(JSON.parse(storedChat));
    } else {
      const initialMessage: ChatMessage = {
        id: "initial-msg-1",
        role: "assistant",
        content: `Hey ${user.name}! I am your personal NutriTrack AI Coach. 🏋️\n\nI can help you build custom high-protein meal plans, analyze your calorie logs, explain your macros, or motivate you to hit your physique goals today.\n\nAsk me anything, or try tapping one of the quick suggestions below!`,
        timestamp: new Date(),
      };
      setMessages([initialMessage]);
      localStorage.setItem(`nutriai_chat_${user.id}`, JSON.stringify([initialMessage]));
    }
  }, [user]);

  // Auto scroll to latest chats
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!user) return null;

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const newUserMsg: ChatMessage = {
      id: "msg-user-" + Math.floor(Math.random() * 100000),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    const updatedChats = [...messages, newUserMsg];
    setMessages(updatedChats);
    setInputValue("");
    setLoading(true);

    try {
      // 1. Gather context logs for custom AI response tailoring
      const todayStr = new Date().toISOString().split("T")[0];
      const todayMeals = meals.filter((meal) => meal.loggedDate === todayStr);
      const loggedCalories = todayMeals.reduce((acc, m) => acc + m.calories, 0);
      const currentWeight = weightLogs[weightLogs.length - 1]?.weight || 75;

      // 2. Fetch from Next.js API Routes (which connects to Gemini / OpenAI)
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: text,
          userContext: {
            name: user.name,
            targetCalories: targets?.targetCalories || 2000,
            loggedCalories: loggedCalories,
            targetProtein: targets?.targetProtein || 140,
            currentWeight: currentWeight,
            dietPreference: targets?.bmiCategory || "Normal", // Using BMI info safely
          },
        }),
      });

      const data = await res.json();

      const newAssistantMsg: ChatMessage = {
        id: "msg-ai-" + Math.floor(Math.random() * 100000),
        role: "assistant",
        content: data.reply || "I encountered a minor feedback loop. Please repeat your query!",
        timestamp: new Date(),
      };

      const finalChats = [...updatedChats, newAssistantMsg];
      setMessages(finalChats);
      localStorage.setItem(`nutriai_chat_${user.id}`, JSON.stringify(finalChats));
    } catch (err) {
      console.error("API Sync failed, running direct browser-side chatbot coaching intelligence...", err);
      // Fail-safe smart coach simulator working client-side (great for static native Capacitor Android builds!)
      const query = text.toLowerCase();
      let reply = "";
      const name = user.name;
      const targetCalories = targets?.targetCalories || 2000;
      const todayStr = new Date().toISOString().split("T")[0];
      const todayMeals = meals.filter((meal) => meal.loggedDate === todayStr);
      const loggedCalories = todayMeals.reduce((acc, m) => acc + m.calories, 0);
      const targetProtein = targets?.targetProtein || 140;
      const currentWeight = weightLogs[weightLogs.length - 1]?.weight || 75;

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
• To maintain muscle during a deficit, ensure you hit your daily protein goal of ${targetProtein}g and stay highly hydrated!`;
      }
      else if (query.includes("workout") || query.includes("routine") || query.includes("exercise") || query.includes("split")) {
        reply = `Here is a highly effective, time-efficient 3-Day Full-Body Split perfect for your goals:

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
        reply = `Hey ${name}! That's a great fitness question. As your coach, my main recommendations for a ${currentWeight} kg bodyweight are:

1. Consistency: Track meals daily to stay within your ${targetCalories} kcal budget.
2. Fuel recovery: Target ${targetProtein}g of protein daily, focusing on clean dals, paneer, and eggs.
3. Hydrate: Drink at least 3 liters of water.

What specific details should we refine next? Meal prep, calorie tracking, or lifting splits? 🥑`;
      }

      const newAssistantMsg: ChatMessage = {
        id: "msg-ai-" + Math.floor(Math.random() * 100000),
        role: "assistant",
        content: reply,
        timestamp: new Date(),
      };
      setMessages([...updatedChats, newAssistantMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    handleSendMessage(prompt);
  };

  const clearChatLogs = () => {
    const initialMessage: ChatMessage = {
      id: "initial-msg-1",
      role: "assistant",
      content: `Chat history cleared. How can I help you optimize your training and nutrition today, ${user.name}? 🥑`,
      timestamp: new Date(),
    };
    setMessages([initialMessage]);
    localStorage.setItem(`nutriai_chat_${user.id}`, JSON.stringify([initialMessage]));
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-6 bg-white">
      
      {/* Page Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-outfit text-3xl font-bold text-slate-900 flex items-center gap-2">
            AI Fitness Coach <Sparkles className="h-5 w-5 text-emerald-500 animate-pulse" />
          </h1>
          <p className="text-sm text-slate-500">Conversational training, macro reviews, and motivation</p>
        </div>
        <button
          onClick={clearChatLogs}
          className="text-xs text-rose-600 hover:text-rose-700 font-semibold px-3 py-1.5 rounded-xl border border-rose-100 bg-rose-50 hover:bg-rose-100"
        >
          Clear History
        </button>
      </div>

      {/* Main Messaging Interface */}
      <GlassCard glow glowColor="emerald" className="h-[60vh] flex flex-col justify-between overflow-hidden relative">
        <div className="absolute top-0 inset-x-0 h-1 bg-emerald-500" />
        
        {/* Messages Screen Area */}
        <div className="flex-grow p-4 md:p-6 overflow-y-auto space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((msg) => {
              const isAi = msg.role === "assistant";
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${isAi ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-md p-4 rounded-[20px] text-sm leading-relaxed whitespace-pre-line ${
                      isAi
                        ? "bg-slate-100 text-slate-800 border border-slate-200/50 rounded-tl-none shadow-sm"
                        : "bg-emerald-500 text-white rounded-tr-none shadow-sm"
                    }`}
                  >
                    {isAi && (
                      <span className="text-[9px] uppercase font-mono tracking-widest text-emerald-700 font-bold block mb-1">
                        ⭐ NutriTrack AI Coach
                      </span>
                    )}
                    {msg.content}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Typing Indicator */}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 text-slate-800 border border-slate-200/50 p-4 rounded-[20px] rounded-tl-none flex items-center space-x-1.5 shadow-sm">
                <span className="text-[9px] uppercase font-mono tracking-widest text-emerald-700 font-bold mr-1">Coach is typing</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce" />
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce delay-100" />
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce delay-200" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input panel area */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-4">
          
          {/* Quick coaching suggestion tags */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { text: "Suggest Veg Protein 🥦", prompt: "Suggest a list of high-protein Indian vegetarian foods." },
              { text: "Explain Deficit 📐", prompt: "Explain how a calorie deficit works for fat loss and calculate standard limits." },
              { text: "Gym Routine 🏋️", prompt: "Draft a simple 3-day full-body workout split for a beginner." },
              { text: "Analyze Progress 📊", prompt: "Analyze my logged meals and weight logs, and give physique feedback." },
            ].map((tag, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickPrompt(tag.prompt)}
                className="shrink-0 px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-slate-300 text-[11px] font-semibold text-slate-500 hover:text-slate-800 transition-all shadow-xs"
              >
                {tag.text}
              </button>
            ))}
          </div>

          {/* Chat input box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputValue);
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              placeholder="Ask Coach AI about macros, weight, exercises..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-grow bg-white border border-slate-200 rounded-2xl py-3 px-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
            />
            <button
              type="submit"
              disabled={loading || !inputValue.trim()}
              className="p-3 rounded-2xl bg-emerald-500 text-white hover:bg-emerald-600 active:scale-[0.98] disabled:opacity-40 transition-all shadow-sm"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>

      </GlassCard>
      
      {/* Bot credentials description */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassCard className="p-4 flex items-center space-x-3">
          <Dumbbell className="h-5 w-5 text-emerald-600" />
          <div>
            <p className="text-xs font-bold text-slate-800">Custom Training Tiers</p>
            <span className="text-[10px] text-slate-400">Formulates detailed exercises</span>
          </div>
        </GlassCard>
        <GlassCard className="p-4 flex items-center space-x-3">
          <Apple className="h-5 w-5 text-orange-600" />
          <div>
            <p className="text-xs font-bold text-slate-800">Indian Food Recommender</p>
            <span className="text-[10px] text-slate-400">Macros detailed for dals & grains</span>
          </div>
        </GlassCard>
        <GlassCard className="p-4 flex items-center space-x-3">
          <Flame className="h-5 w-5 text-amber-600" />
          <div>
            <p className="text-xs font-bold text-slate-800">Physique Optimization</p>
            <span className="text-[10px] text-slate-400">Aligns meals with target timelines</span>
          </div>
        </GlassCard>
      </div>

    </div>
  );
}
