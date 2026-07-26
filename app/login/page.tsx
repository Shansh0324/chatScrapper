"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      // Successful login/signup -> Redirect to workspace
      router.push("/workspace");
      router.refresh(); // Refresh to update Auth state in components
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex-1 w-[95%] mx-auto pt-16 sm:pt-24 pb-20 max-w-lg">
      <div className="brutal-border brutal-shadow-static bg-white p-8 sm:p-12 relative">
        <div className="absolute -top-6 -left-6 w-12 h-12 bg-[#ff00ff] brutal-border flex items-center justify-center transform -rotate-12">
          <span className="text-white font-black text-2xl">!</span>
        </div>
        
        <h1 className="text-5xl font-black uppercase tracking-tighter leading-none mb-8 text-center">
          {isLogin ? "Log In" : "Sign Up"}
        </h1>

        {error && (
          <div className="bg-red-100 border-4 border-red-600 p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
            <p className="text-red-800 font-bold">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {!isLogin && (
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="text-xl font-black uppercase">Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="JOHN DOE"
                className="w-full px-4 py-4 bg-gray-50 brutal-border text-lg font-bold placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-[#ff00ff]/20"
                required
                disabled={isLoading}
              />
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-xl font-black uppercase">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="YOU@EXAMPLE.COM"
              className="w-full px-4 py-4 bg-gray-50 brutal-border text-lg font-bold placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-[#ff00ff]/20"
              required
              disabled={isLoading}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-xl font-black uppercase">Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-4 pr-12 bg-gray-50 brutal-border text-lg font-bold placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-[#ff00ff]/20"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black transition-colors"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div className="flex items-start gap-3 mt-2">
              <input 
                type="checkbox" 
                id="terms" 
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1 w-5 h-5 border-4 border-black checked:bg-[#ff00ff] checked:border-black rounded-none focus:ring-0 cursor-pointer"
                required
              />
              <label htmlFor="terms" className="text-sm font-bold leading-tight cursor-pointer">
                I AGREE TO THE <Link href="/terms" className="text-[#ff00ff] hover:underline">TERMS OF SERVICE</Link> AND <Link href="/privacy" className="text-[#ff00ff] hover:underline">PRIVACY POLICY</Link>.
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="mt-4 w-full py-4 brutal-border brutal-shadow-sm-static bg-black text-white text-2xl font-black uppercase hover:bg-gray-800 transition-transform active:translate-y-1 active:translate-x-1 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-3"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Processing...
              </>
            ) : (
              isLogin ? "Log In" : "Sign Up"
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
            className="text-lg font-bold text-gray-600 hover:text-black hover:underline uppercase decoration-4 underline-offset-4"
          >
            {isLogin ? "Need an account? Sign Up" : "Already have an account? Log In"}
          </button>
        </div>
      </div>
    </main>
  );
}
