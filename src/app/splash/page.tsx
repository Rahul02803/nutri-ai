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
    <div className="flex h-screen w-full flex-col items-center justify-between bg-[#0A0A0A] p-8 text-white select-none relative overflow-hidden">
      
      {/* Background ambient purple spark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[350px] w-[350px] rounded-full bg-[#8B5CF6]/5 blur-[80px] pointer-events-none -z-10" />

      <div /> {/* Top spacer */}

      {/* Center Logo Block */}
      <div className="flex flex-col items-center space-y-6 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex h-20 w-20 items-center justify-center rounded-[24px] border border-white/[0.08] bg-[#161616] p-4 shadow-lg shadow-black/40"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="ZenLog Logo" className="h-14 w-14 object-contain" />
        </motion.div>

        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="space-y-1"
        >
          <h1 className="font-outfit text-3xl font-black tracking-tight text-white uppercase">
            ZENLOG
          </h1>
          <p className="text-[10px] font-bold tracking-widest text-[#A1A1AA] uppercase">
            Physique & Nutrition Intelligence
          </p>
        </motion.div>
      </div>

      {/* Bottom Loading Progress Bar */}
      <div className="w-full max-w-[180px] space-y-2.5 flex flex-col items-center pb-6">
        <div className="h-[3px] w-full bg-white/[0.08] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#8B5CF6] transition-all duration-75"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-[9px] font-mono tracking-widest text-[#52525B] uppercase animate-pulse">
          INITIALIZING... {progress}%
        </span>
      </div>

    </div>
  );
}
