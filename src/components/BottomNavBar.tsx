"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Home, LineChart, Plus, User, Camera, Pencil, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function BottomNavBar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Menu toggles
  const [showMenu, setShowMenu] = useState(false);

  // Hide nav if user is not logged in, not onboarded, or on onboarding / welcome landing pages
  if (!user || !user.isOnboarded || pathname === "/onboarding" || pathname === "/") {
    return null;
  }

  const navItems = [
    { label: "Home", href: "/dashboard", icon: Home },
    { label: "Progress", href: "/progress", icon: LineChart },
    { label: "Profile", href: "/profile", icon: User },
  ];

  return (
    <>
      <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
        <div className="relative w-full max-w-md flex justify-center">
          
          {/* Popover Action Menu */}
          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.95 }}
                className="absolute bottom-20 bg-white/90 backdrop-blur-xl border border-[#ECECEF] rounded-[28px] p-4 w-[280px] shadow-[0_12px_36px_rgba(0,0,0,0.08)] pointer-events-auto flex flex-col gap-2.5 z-50 animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="flex justify-between items-center px-2 pb-2 border-b border-[#F1F1F4]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8D8D92]">Quick Logs Menu</span>
                  <button onClick={() => setShowMenu(false)} className="text-slate-400 hover:text-slate-700">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* 1. Scan meal photo */}
                <button
                  onClick={() => {
                    setShowMenu(false);
                    router.push("/scanner");
                  }}
                  className="flex items-center space-x-3 p-2.5 rounded-xl hover:bg-slate-50 text-left transition-all text-xs font-bold text-[#111111]"
                >
                  <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Camera className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p>AI Meal Scan</p>
                    <span className="text-[9px] text-[#8D8D92] block font-normal">Detect macros with camera</span>
                  </div>
                </button>

                {/* 2. Manual Food Log */}
                <button
                  onClick={() => {
                    setShowMenu(false);
                    router.push("/dashboard");
                  }}
                  className="flex items-center space-x-3 p-2.5 rounded-xl hover:bg-slate-50 text-left transition-all text-xs font-bold text-[#111111]"
                >
                  <div className="h-8 w-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                    <Pencil className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p>Log Manually</p>
                    <span className="text-[9px] text-[#8D8D92] block font-normal">Type and search database</span>
                  </div>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Bar */}
          <nav className="flex items-center justify-between w-full bg-white/75 backdrop-blur-xl border border-white/20 rounded-[32px] px-6 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.06)] pointer-events-auto transition-transform duration-300 active:scale-[0.99] z-40">
            {/* Left Nav items */}
            <div className="flex space-x-8">
              {navItems.slice(0, 2).map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl group"
                  >
                    <Icon
                      className={`h-5 w-5 transition-all duration-200 ${
                        isActive ? "text-[#111111] scale-110" : "text-[#8D8D92] group-hover:text-[#111111]"
                      }`}
                    />
                    <span className={`text-[10px] mt-1 font-semibold ${isActive ? "text-[#111111]" : "text-[#8D8D92]"}`}>
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>

            {/* Central Floating Action Trigger Button */}
            <div className="absolute left-1/2 transform -translate-x-1/2 -top-6">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className={`flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-sky-400 via-indigo-400 to-purple-400 text-white shadow-lg border-4 border-[#F8F8FA] transition-all duration-300 outline-none hover:scale-105 active:scale-95 ${
                  showMenu ? "rotate-45" : "rotate-0"
                }`}
              >
                <Plus className="h-6 w-6 text-white" />
              </button>
            </div>

            {/* Right Nav items */}
            <div className="flex justify-end pr-2">
              {navItems.slice(2, 3).map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl group"
                  >
                    <Icon
                      className={`h-5 w-5 transition-all duration-200 ${
                        isActive ? "text-[#111111] scale-110" : "text-[#8D8D92] group-hover:text-[#111111]"
                      }`}
                    />
                    <span className={`text-[10px] mt-1 font-semibold ${isActive ? "text-[#111111]" : "text-[#8D8D92]"}`}>
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
