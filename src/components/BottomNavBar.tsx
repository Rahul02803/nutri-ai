"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Home, BarChart2, Camera, User } from "lucide-react";

export default function BottomNavBar() {
  const { user } = useAuth();
  const pathname = usePathname();

  // Hide nav if user is not logged in, not onboarded, or on onboarding / welcome landing pages
  if (!user || !user.isOnboarded || pathname === "/onboarding" || pathname === "/") {
    return null;
  }

  const navItems = [
    { label: "Home", href: "/dashboard", icon: Home },
    { label: "Progress", href: "/progress", icon: BarChart2 },
    { label: "Scan", href: "/scanner", icon: Camera },
    { label: "Profile", href: "/profile", icon: User },
  ];

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-xl border border-[#ECECEF] rounded-[36px] px-6 py-2.5 shadow-[0_12px_36px_rgba(0,0,0,0.06)] pointer-events-auto flex items-center justify-between z-40">
        
        {/* Navigation Tabs (Exactly 4 Tabs: Home, Progress, Scan, Profile) */}
        <div className="flex items-center justify-around w-full">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex flex-col items-center justify-center py-1 px-3 rounded-2xl group transition-all"
              >
                <Icon
                  className={`h-5.5 w-5.5 transition-all duration-200 ${
                    isActive ? "text-[#111827] scale-110" : "text-[#8D8D92] group-hover:text-[#111827]"
                  }`}
                />
                <span className={`text-[9px] mt-1 font-bold tracking-tight uppercase ${isActive ? "text-[#111827]" : "text-[#8D8D92]"}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>

      </div>
    </div>
  );
}
