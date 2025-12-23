"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAccess() {
      try {
        const res = await fetch("/api/user");
        const data = await res.json();
        
        if (data.s === true) {
          // window.location.href = "https://app.eliro.pro";
          return; // Keep loading state true while redirecting
        }
        
        // If s is false, we show the shutdown UI
        setLoading(false);
      } catch (err) {
        console.error("Check failed:", err);
        // Fallback: if check fails, show the shutdown UI
        setLoading(false);
      }
    }
    checkAccess();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-800 border-t-zinc-200" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-6 py-16 text-zinc-50">
      <main className="w-full max-w-md">
        <div className="rounded-2xl border border-white/10 bg-zinc-950 p-10 shadow-sm">
          <div className="flex flex-col items-center gap-6 text-center">
            <Image
              src="/dark-theme-logo.svg"
              alt="Vibeo"
              width={138}
              height={40}
              priority
            />
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight">
                We&apos;re shutting down
              </h1>
              <p className="text-base leading-7 text-zinc-300">
                Due to unforeseen situations, we are unable to continue this
                project. Thanks for your support.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
