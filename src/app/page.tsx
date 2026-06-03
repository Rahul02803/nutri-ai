"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const faqs = [
    {
      q: "What is ZenLog Premium Mod APK?",
      a: "ZenLog is an AI-powered fitness and nutrition assistant. This Premium Mod APK gives you full, unrestricted access to the premium AI photo scanner, barcode scanner, customized coaching, and weekly auto-calibration without requiring a subscription."
    },
    {
      q: "How do I install the APK on Android?",
      a: "1. Download the APK file by clicking the button above.\n2. Open the downloaded file from your browser or file manager.\n3. If prompted, enable \"Install from Unknown Sources\" in your Android settings.\n4. Follow the installation prompts and launch ZenLog!"
    },
    {
      q: "Is this safe to download and use?",
      a: "Absolutely. The APK is built directly from our verified clean source code and is fully safe for daily use on any Android device running Android 8.0 or higher."
    }
  ];

  return (
    <div className="bg-[#000000] text-[#ffffff] min-h-screen font-sans overflow-x-hidden relative selection:bg-white selection:text-black">
      {/* Styles for custom scanner line animation */}
      <style jsx global>{`
        @keyframes scan {
          0%, 100% { top: 10%; }
          50% { top: 90%; }
        }
        .scanner-line-anim {
          animation: scan 3s infinite ease-in-out;
        }
      `}</style>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-black/75 backdrop-blur-xl border-b border-white/[0.08]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="#" className="flex items-center gap-2 text-xl font-bold tracking-tight text-white hover:opacity-90 transition-opacity">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#30d158]">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="currentColor"/>
            </svg>
            <span className="font-extrabold letter-spacing-[-0.5px]">zenlog</span>
          </Link>
          <div className="flex items-center gap-6">
            <a href="#features" className="text-sm font-medium text-[#8e8e93] hover:text-white transition-colors">Features</a>
            <a href="#faq" className="text-sm font-medium text-[#8e8e93] hover:text-white transition-colors">FAQ</a>
            <a href="https://github.com/Rahul02803/ZenLog/releases/latest/download/ZenLog.apk" className="bg-white text-black text-xs font-bold px-4 py-2 rounded-full hover:bg-white/90 transition-all transform active:scale-95">
              Download APK
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-36 pb-20 px-6 flex flex-col items-center text-center bg-[radial-gradient(circle_at_center_top,rgba(255,255,255,0.03)_0%,transparent_60%)]">
        <div className="max-w-3xl flex flex-col items-center">
          <div className="bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full text-[10px] font-bold tracking-widest text-[#8e8e93] mb-8 uppercase">
            ZENLOG PREMIUM MOD APK
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05] mb-6 bg-gradient-to-b from-white to-[#8e8e93] bg-clip-text text-transparent">
            Scan your food.<br />Hit your goals.
          </h1>
          
          <p className="text-base md:text-lg text-[#8e8e93] max-w-lg mb-10 leading-relaxed font-light">
            The ultimate AI nutrition tracker, completely unlocked. Snap a photo of your plate, auto-calibrate your macros weekly, and chat with your adaptive AI coach.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
            <a href="https://github.com/Rahul02803/ZenLog/releases/latest/download/ZenLog.apk" className="flex flex-col items-center justify-center bg-white text-black px-10 py-3.5 rounded-full font-extrabold text-sm hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_10px_30px_rgba(255,255,255,0.1)]">
              <span>Download Premium APK</span>
              <span className="text-[9px] opacity-60 font-semibold mt-0.5">v1.2.0 • 71.4 MB</span>
            </a>
            <a href="#features" className="border border-white/10 text-white px-10 py-4.5 rounded-full font-bold text-sm hover:bg-white/5 hover:border-white/20 transition-all">
              Explore Features
            </a>
          </div>

          {/* App Preview Container */}
          <div className="relative w-full max-w-2xl mx-auto">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 h-4/5 bg-[radial-gradient(circle,rgba(48,209,88,0.06)_0%,transparent_70%)] -z-10 pointer-events-none"></div>
            <div className="relative bg-[#0a0a0c] border border-white/10 rounded-3xl p-1.5 shadow-[0_30px_60px_rgba(0,0,0,0.8),inset_0_0_1px_rgba(255,255,255,0.15)] overflow-hidden">
              <img src="/zenlog_dashboard.png" alt="ZenLog App Preview" className="block w-full h-auto rounded-[18px] opacity-90 hover:opacity-100 transition-opacity duration-300" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section id="features" className="max-w-5xl mx-auto py-24 px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">Everything you need. Zero limits.</h2>
          <p className="text-[#8e8e93] text-sm md:text-base max-w-md mx-auto">No subscriptions, no lockouts. Just pure, intelligence-driven health logging.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bento Card 1: AI Scanner */}
          <div className="md:col-span-2 relative bg-[#0a0a0c] border border-white/[0.08] rounded-[24px] p-8 flex flex-col justify-between hover:border-white/20 transition-colors">
            <div className="mb-8">
              <div className="text-3xl mb-4">📸</div>
              <h3 className="text-xl font-bold mb-2">AI Photo Scanner</h3>
              <p className="text-sm text-[#8e8e93] leading-relaxed">Take a picture of any meal. Our advanced AI instantly estimates portion sizes, weights, calories, and macros. No manual searching required.</p>
            </div>
            
            <div className="relative h-[130px] bg-white/[0.02] border border-white/[0.08] rounded-xl overflow-hidden flex items-center justify-center gap-2">
              <div className="scanner-line-anim absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-[#30d158] to-transparent"></div>
              <div className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-[10px] font-bold text-[#30d158] border-[#30d158]/30">420 kcal</div>
              <div className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-[10px] font-bold text-[#0a84ff] border-[#0a84ff]/30">32g Protein</div>
              <div className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-[10px] font-bold text-[#ff9f0a] border-[#ff9f0a]/30">45g Carbs</div>
            </div>
          </div>

          {/* Bento Card 2: Adaptive Coach */}
          <div className="bg-[#0a0a0c] border border-white/[0.08] rounded-[24px] p-8 flex flex-col justify-between hover:border-white/20 transition-colors">
            <div>
              <div className="text-3xl mb-4">🤖</div>
              <h3 className="text-xl font-bold mb-2">AI Health Coach</h3>
              <p className="text-sm text-[#8e8e93] leading-relaxed">A smart, conversational coach powered by Gemini. Ask questions, receive tailored meal suggestions, and stay motivated 24/7.</p>
            </div>
          </div>

          {/* Bento Card 3: Auto-Calibration */}
          <div className="bg-[#0a0a0c] border border-white/[0.08] rounded-[24px] p-8 flex flex-col justify-between hover:border-white/20 transition-colors">
            <div>
              <div className="text-3xl mb-4">⚖️</div>
              <h3 className="text-xl font-bold mb-2">Auto-Calibration</h3>
              <p className="text-sm text-[#8e8e93] leading-relaxed">The system adapts to you. It automatically reviews your weight fluctuations and updates your targets every week to keep you on course.</p>
            </div>
          </div>

          {/* Bento Card 4: Premium Unlocked */}
          <div className="md:col-span-2 relative bg-[#0a0a0c] border border-white/[0.08] rounded-[24px] p-8 flex flex-col justify-between hover:border-white/20 transition-colors">
            <div className="mb-8">
              <div className="text-3xl mb-4">🔓</div>
              <h3 className="text-xl font-bold mb-2">Premium Mod APK Unlocked</h3>
              <p className="text-sm text-[#8e8e93] leading-relaxed">Get full access to all premium features, offline logging, barcodes scanning, and deep historical analytics without spending a dime.</p>
            </div>
            
            <div className="relative h-[130px] bg-white/[0.02] border border-white/[0.08] rounded-xl overflow-hidden flex items-center justify-center">
              <div className="flex items-center gap-2 bg-[#30d158]/10 border border-[#30d158] px-5 py-3 rounded-full text-[#30d158] font-bold text-sm shadow-[0_4px_20px_rgba(48,209,88,0.15)]">
                <span>🔓</span>
                <span className="tracking-wide">PRO UNLOCKED</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="max-w-2xl mx-auto py-20 px-6 border-t border-white/[0.08]">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold tracking-tight">Frequently Asked Questions</h2>
        </div>
        
        <div className="flex flex-col gap-4">
          {faqs.map((faq, idx) => {
            const isActive = openFaq === idx;
            return (
              <div key={idx} className="border border-white/[0.08] rounded-2xl bg-[#0a0a0c] overflow-hidden transition-colors hover:border-white/20">
                <button 
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex justify-between items-center px-6 py-5 text-left font-bold text-sm text-[#ffffff] select-none"
                >
                  <span>{faq.q}</span>
                  <span className={`text-[#8e8e93] text-lg transition-transform duration-300 ${isActive ? "rotate-45" : ""}`}>+</span>
                </button>
                <div 
                  className="transition-all duration-300 overflow-hidden" 
                  style={{ maxHeight: isActive ? "200px" : "0px" }}
                >
                  <p className="px-6 pb-5 text-xs text-[#8e8e93] leading-relaxed border-t border-white/[0.02] pt-3 whitespace-pre-line">
                    {faq.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-28 px-6 text-center bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0%,transparent_70%)] border-t border-white/[0.08]">
        <div className="max-w-xl mx-auto flex flex-col items-center">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight">Ready to transform your health?</h2>
          <p className="text-[#8e8e93] text-sm md:text-base mb-8">Download ZenLog Premium today and experience tracking with zero limits.</p>
          <a href="https://github.com/Rahul02803/ZenLog/releases/latest/download/ZenLog.apk" className="flex flex-col items-center justify-center bg-white text-black px-10 py-3.5 rounded-full font-extrabold text-sm hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] transition-all">
            <span>Download Premium APK</span>
            <span className="text-[9px] opacity-60 font-semibold mt-0.5">Free Download</span>
          </a>
        </div>
      </section>
    </div>
  );
}
