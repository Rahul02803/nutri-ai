"use client";

import React from "react";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();

  // Hide the footer on the landing page and onboarding page
  if (pathname === "/" || pathname === "/onboarding") {
    return null;
  }

  return (
    <footer className="py-6 text-center text-xs text-slate-400 border-t border-slate-100 bg-slate-50/50">
      <p>© {new Date().getFullYear()} ZenLog. Premium AI Nutrition & Fitness Coach. Always Free.</p>
    </footer>
  );
}
