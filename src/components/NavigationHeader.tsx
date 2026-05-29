"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Activity, LogOut, Sparkles, LineChart, User as UserIcon } from "lucide-react";

export default function NavigationHeader() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Hide nav on onboarding page to keep user focused
  if (pathname === "/onboarding") return null;

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const isActive = (path: string) => pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-[#ECECEF] bg-white/75 backdrop-blur-xl transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo Section */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 transition-transform duration-300 group-hover:scale-105">
              <Sparkles className="h-5 w-5 text-emerald-600 animate-pulse" />
            </div>
            <span className="font-outfit text-xl font-bold tracking-tight text-[#111111] transition-colors duration-300">
              NutriTrack <span className="bg-gradient-to-tr from-sky-400 to-emerald-500 bg-clip-text text-transparent">AI</span>
            </span>
          </Link>
 
          {/* Navigation Links (Visible when logged in) */}
          <nav className="hidden md:flex items-center space-x-1.5">
            {user && user.isOnboarded && (
              <>
                <Link
                  href="/dashboard"
                  className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                    isActive("/dashboard")
                      ? "bg-[#111111] border-[#111111] text-white"
                      : "text-[#8D8D92] hover:text-[#111111] hover:bg-slate-50 border-transparent"
                  }`}
                >
                  <Activity className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>

                <Link
                  href="/progress"
                  className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                    isActive("/progress")
                      ? "bg-[#111111] border-[#111111] text-white"
                      : "text-[#8D8D92] hover:text-[#111111] hover:bg-slate-50 border-transparent"
                  }`}
                >
                  <LineChart className="h-4 w-4" />
                  <span>Reports & Charts</span>
                </Link>
              </>
            )}
          </nav>
 
          {/* Auth & User Info Section */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-semibold text-[#111111]">{user.name}</span>
                  <span className="text-[9px] text-[#8D8D92] font-mono capitalize">
                    🎓 BCA Final Project
                  </span>
                </div>
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-[#F8F8FA] border border-[#ECECEF]">
                  <UserIcon className="h-4 w-4 text-[#111111]" />
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all duration-200"
                  title="Logout Session"
                >
                  <LogOut className="h-4.5 w-4.5" />
                </button>
              </div>
            ) : (
              <Link
                href="/auth"
                className="flex items-center space-x-1.5 px-5 py-2.5 rounded-2xl bg-[#111111] text-xs font-bold text-white shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                Get Started
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
