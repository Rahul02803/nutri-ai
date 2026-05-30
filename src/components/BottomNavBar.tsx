"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Home, BarChart2, Users, User, Plus } from "lucide-react";

export default function BottomNavBar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Hide nav if user is not logged in, not onboarded, or on onboarding / welcome landing pages
  if (!user || !user.isOnboarded || pathname === "/onboarding" || pathname === "/") {
    return null;
  }

  const navItems = [
    { label: "Home", href: "/dashboard", icon: Home },
    { label: "Progress", href: "/progress", icon: BarChart2 },
    { label: "Groups", href: "/community", icon: Users },
    { label: "Profile", href: "/profile", icon: User },
  ];

  const handlePlusClick = () => {
    // If not on the dashboard, navigate to it first
    if (pathname !== "/dashboard") {
      router.push("/dashboard");
      // Give a tiny timeout for page to mount then trigger
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("open-food-logger"));
      }, 350);
    } else {
      window.dispatchEvent(new CustomEvent("open-food-logger"));
    }
  };

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <div className="w-full max-w-lg bg-white/90 backdrop-blur-xl border border-[#ECECEF] rounded-[36px] px-6 py-2.5 shadow-[0_12px_36px_rgba(0,0,0,0.06)] pointer-events-auto flex items-center justify-between z-40">
        
        {/* Navigation Tabs */}
        <div className="flex items-center justify-around flex-grow mr-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl group transition-all"
              >
                <Icon
                  className={`h-5 w-5 transition-all duration-200 ${
                    isActive ? "text-[#111111] scale-110" : "text-[#8D8D92] group-hover:text-[#111111]"
                  }`}
                />
                <span className={`text-[9px] mt-1 font-bold tracking-tight uppercase ${isActive ? "text-[#111111]" : "text-[#8D8D92]"}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Dynamic Black Floating Plus Button (Far Right) */}
        <button
          onClick={handlePlusClick}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#111115] hover:bg-slate-800 text-white shadow-lg border-2 border-white transition-all duration-200 outline-none hover:scale-105 active:scale-95 shrink-0"
        >
          <Plus className="h-5.5 w-5.5 text-white" />
        </button>

      </div>
    </div>
  );
}
