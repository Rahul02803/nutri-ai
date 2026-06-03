"use client";

import React from "react";
import { usePathname } from "next/navigation";
import NavigationHeader from "./NavigationHeader";
import BottomNavBar from "./BottomNavBar";

export default function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  if (isLanding) {
    // Full width layout for landing page (Cal AI Style)
    return (
      <div className="w-full min-h-screen bg-[#000000] flex flex-col">
        <main className="flex-grow flex flex-col">
          {children}
        </main>
      </div>
    );
  }

  // Mobile viewport container shell for app pages
  return (
    <div className="w-full max-w-md min-h-screen bg-[#FFFFFF] flex flex-col relative shadow-[0_0_60px_rgba(0,0,0,0.05)] border-x border-[#ECECEF] overflow-x-hidden">
      <NavigationHeader />
      <main className="flex-grow pt-16">
        {children}
      </main>
      <BottomNavBar />
    </div>
  );
}
