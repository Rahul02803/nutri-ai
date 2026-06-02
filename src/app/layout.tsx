import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { AppProvider } from "@/context/AppContext";
import NavigationHeader from "@/components/NavigationHeader";
import BottomNavBar from "@/components/BottomNavBar";

const outfit = Outfit({ 
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600", "700", "800"]
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600"]
});

export const metadata: Metadata = {
  title: "ZenLog - Premium AI Fitness & Nutrition Tracker",
  description: "Track calories, scan meals with AI, monitor intermittent fasting, steps, and log strength workouts in a beautiful ultra-minimal modern canvas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body className="antialiased min-h-screen bg-[#F4F4F6] text-[#111111] flex items-stretch justify-center">
        <AuthProvider>
          <AppProvider>
            {/* Native Mobile Viewport Container Shell */}
            <div className="w-full max-w-md min-h-screen bg-[#FFFFFF] flex flex-col relative shadow-[0_0_60px_rgba(0,0,0,0.05)] border-x border-[#ECECEF] overflow-x-hidden">
              <main className="flex-grow">
                {children}
              </main>
              <BottomNavBar />
            </div>
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
