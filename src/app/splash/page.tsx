"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";

export default function SplashPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Incremental progress simulation for visual loading state
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 4;
      });
    }, 80);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress === 100 && !loading) {
      if (!user) {
        router.push("/login");
      } else if (!user.isOnboarded) {
        router.push("/onboarding");
      } else {
        router.push("/dashboard");
      }
    }
  }, [progress, user, loading, router]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-between bg-white p-8 text-black select-none relative overflow-hidden">
      
      <div /> {/* Top spacer */}

      {/* Center Logo Block */}
      <div className="flex flex-col items-center space-y-6 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex h-20 w-20 items-center justify-center rounded-[28px] border border-slate-100 bg-white p-4 shadow-[0_8px_30px_rgba(0,0,0,0.015)]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="ZenLog Logo" className="h-14 w-14 object-contain" />
        </motion.div>

        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="space-y-1.5"
        >
          <h1 className="font-outfit text-3xl font-black tracking-tight text-black uppercase">
            ZENLOG
          </h1>
          <p className="text-[10px] font-bold tracking-widest text-[#8D8D92] uppercase font-mono">
            Physique & Nutrition Intelligence
          </p>
        </motion.div>
      </div>

      {/* Bottom Loading Progress Bar */}
      <div className="w-full max-w-[180px] space-y-3 flex flex-col items-center pb-8">
        <div className="h-[3px] w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-black transition-all duration-75"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-[9px] font-mono tracking-widest text-[#8D8D92] uppercase animate-pulse">
          INITIALIZING... {progress}%
        </span>
      </div>

    </div>
  );
}
