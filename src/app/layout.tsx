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
      <body className="antialiased min-h-screen bg-[#F8F8FA] text-[#111111] flex flex-col">
        <AuthProvider>
          <AppProvider>
            <NavigationHeader />
            <main className="flex-grow pt-16 pb-32">
              {children}
            </main>
            <BottomNavBar />
            <footer className="py-8 text-center text-xs text-[#8D8D92] border-t border-slate-100 bg-[#F8F8FA]">
              <p>© {new Date().getFullYear()} ZenLog. Cal AI Premium Nutrition. All rights reserved.</p>
            </footer>
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
