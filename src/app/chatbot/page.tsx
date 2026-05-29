"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ChatbotRedirectPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white text-slate-500 font-mono text-xs">
      Redirecting to BCA Project Dashboard...
    </div>
  );
}
