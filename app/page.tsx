"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { auth } from "./lib/firebase";
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/menu");
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleGoogleSignIn = async () => {
    setSigningIn(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push("/menu");
    } catch (error) {
      console.error("Error signing in:", error);
      setSigningIn(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#259B37] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-2 text-[#F3C623]">💎</div>
          <p className="text-white/80">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#259B37] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm text-center relative overflow-hidden">
        {/* Decorative diamond accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-[#F3C623] rotate-45 shadow-lg" />
        
        {/* Logo */}
        <div className="relative mb-6 mt-4">
          <div className="w-24 h-24 mx-auto relative">
            <Image
              src="/logo.png"
              alt="Snack Ordering App"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Title with shadow effect */}
        <h1 
          className="text-3xl font-extrabold text-white mb-2"
          style={{ 
            textShadow: "2px 2px 0px #C00A14, -1px -1px 0px #C00A14, 1px -1px 0px #C00A14, -1px 1px 0px #C00A14",
            WebkitTextStroke: "1px #C00A14"
          }}
        >
          Welcome
        </h1>
        <p className="text-gray-600 mb-8 font-medium">Order delicious snacks online</p>

        <button
          onClick={handleGoogleSignIn}
          disabled={signingIn}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 hover:border-[#F3C623] text-gray-700 font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          {signingIn ? "Signing in..." : "Sign in with Google"}
        </button>

        <a
          href="/admin"
          className="block mt-6 text-sm text-[#259B37] hover:text-[#F3C623] font-semibold transition-colors"
        >
          Admin Access →
        </a>
      </div>
    </main>
  );
}
