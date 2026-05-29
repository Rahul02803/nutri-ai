"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Home, LineChart, Camera, MessageSquare, Settings } from "lucide-react";

export default function BottomNavBar() {
  const { user } = useAuth();
  const pathname = usePathname();

  // Hide nav if user is not logged in, not onboarded, or on the onboarding wizard
  if (!user || !user.isOnboarded || pathname === "/onboarding" || pathname === "/") {
    return null;
  }

  const navItems = [
    { label: "Home", href: "/dashboard", icon: Home },
    { label: "Analytics", href: "/progress", icon: LineChart },
    { label: "Scan", href: "/scanner", icon: Camera, isFab: true },
    { label: "Coach", href: "/chatbot", icon: MessageSquare },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <nav className="flex items-center justify-between w-full max-w-md bg-white/75 backdrop-blur-xl border border-white/20 rounded-[32px] px-6 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.06)] pointer-events-auto transition-transform duration-300 active:scale-[0.99]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          if (item.isFab) {
            return (
              <Link
                key={item.label}
                href={item.href}
                className="relative -top-8 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-sky-400 via-indigo-400 to-purple-400 text-white shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 border-4 border-[#F8F8FA] group"
              >
                <Icon className="h-6 w-6 transition-transform duration-300 group-hover:rotate-12" />
                <span className="absolute -bottom-6 text-[10px] font-medium text-[#8D8D92] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 group"
            >
              <Icon
                className={`h-5.5 w-5.5 transition-all duration-200 ${
                  isActive
                    ? "text-[#111111] scale-110"
                    : "text-[#8D8D92] group-hover:text-[#111111]"
                }`}
              />
              <span
                className={`text-[10px] mt-1 font-medium transition-colors duration-200 ${
                  isActive ? "text-[#111111]" : "text-[#8D8D92] group-hover:text-[#111111]"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
