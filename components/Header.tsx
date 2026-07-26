"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLenis } from "@studio-freight/react-lenis";

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const lenis = useLenis();

  const handleHashClick = (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
    if (pathname === "/") {
      e.preventDefault();
      setIsMobileMenuOpen(false);
      lenis?.scrollTo(hash, { offset: -50 });
      window.history.replaceState(null, "", hash);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      setIsCheckingAuth(true);
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        setIsAuthenticated(data.authenticated);
      } catch (err) {
        setIsAuthenticated(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    checkAuth();
  }, [pathname]);

  return (
    <header className="w-full pt-8 px-6 sm:px-12 flex items-center justify-between gap-6 relative z-10">
      <Link href="/" className="text-5xl sm:text-6xl logo-text drop-shadow-[6px_6px_0_rgba(0,0,0,1)] flex items-center relative z-50">
          <span className="logo-chat">Chat</span>
          <span className="logo-notes">Notes</span>
      </Link>
      
      {/* Desktop Nav */}
      <nav className="hidden lg:flex items-center gap-4">
        <Link href="/" className="px-5 py-3 brutal-border brutal-shadow-sm-static bg-white text-lg font-black uppercase whitespace-nowrap hover:bg-gray-50 transition-transform active:translate-y-1 active:translate-x-1 active:shadow-none">Home</Link>
        <Link href="/#how-it-works" onClick={(e) => handleHashClick(e, "#how-it-works")} className="px-5 py-3 brutal-border brutal-shadow-sm-static bg-white text-lg font-black uppercase whitespace-nowrap hover:bg-gray-50 transition-transform active:translate-y-1 active:translate-x-1 active:shadow-none">How it Works</Link>
        <Link href="/#pricing" onClick={(e) => handleHashClick(e, "#pricing")} className="px-5 py-3 brutal-border brutal-shadow-sm-static bg-white text-lg font-black uppercase whitespace-nowrap hover:bg-gray-50 transition-transform active:translate-y-1 active:translate-x-1 active:shadow-none">Pricing</Link>
        
        {isCheckingAuth ? (
          <>
            <div className="w-[100px] h-[52px] bg-gray-100 brutal-border brutal-shadow-sm-static animate-pulse"></div>
            <div className="w-[140px] h-[52px] bg-gray-200 brutal-border brutal-shadow-sm-static animate-pulse"></div>
          </>
        ) : (
          <>
            {!isAuthenticated && (
              <Link href="/login" className="px-5 py-3 brutal-border brutal-shadow-sm-static bg-white text-lg font-black uppercase whitespace-nowrap hover:bg-gray-50 transition-transform active:translate-y-1 active:translate-x-1 active:shadow-none">Log In</Link>
            )}
            
            <Link href={isAuthenticated ? "/workspace" : "/login"} className="px-6 py-3 brutal-border brutal-shadow-sm-static bg-[#ff00ff] text-lg font-black uppercase whitespace-nowrap hover:bg-[#e600e6] transition-transform active:translate-y-1 active:translate-x-1 active:shadow-none">
              {isAuthenticated ? "Workspace" : "Get Started"}
            </Link>
          </>
        )}
      </nav>

      {/* Mobile Menu Button */}
      <button 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden p-3 brutal-border brutal-shadow-sm-static bg-white relative z-50 hover:bg-gray-50 transition-colors"
      >
        {isMobileMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
      </button>

      {/* Mobile Nav Overlay */}
      <div 
        className={`fixed inset-0 bg-[#ff00ff] z-40 flex flex-col justify-center items-center transition-transform duration-300 ease-out border-b-[12px] border-black ${isMobileMenuOpen ? "translate-y-0" : "-translate-y-full"}`}
        style={{ transitionTimingFunction: "cubic-bezier(0, 1, 0, 1)" }}
      >
        <nav className="flex flex-col items-center gap-6 mt-16 w-full px-8">
          <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="w-full max-w-sm px-6 py-5 brutal-border brutal-shadow-sm-static bg-white text-3xl font-black uppercase hover:bg-gray-50 active:translate-y-1 active:translate-x-1 active:shadow-none text-center">Home</Link>
          <Link href="/#how-it-works" onClick={(e) => handleHashClick(e, "#how-it-works")} className="w-full max-w-sm px-6 py-5 brutal-border brutal-shadow-sm-static bg-white text-3xl font-black uppercase hover:bg-gray-50 active:translate-y-1 active:translate-x-1 active:shadow-none text-center">How it Works</Link>
          <Link href="/#pricing" onClick={(e) => handleHashClick(e, "#pricing")} className="w-full max-w-sm px-6 py-5 brutal-border brutal-shadow-sm-static bg-white text-3xl font-black uppercase hover:bg-gray-50 active:translate-y-1 active:translate-x-1 active:shadow-none text-center">Pricing</Link>
          
          {isCheckingAuth ? (
            <>
              <div className="w-full max-w-sm h-[76px] bg-gray-100 brutal-border brutal-shadow-sm-static animate-pulse"></div>
              <div className="w-full max-w-sm h-[76px] bg-gray-200 brutal-border brutal-shadow-sm-static animate-pulse"></div>
            </>
          ) : (
            <>
              {!isAuthenticated && (
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full max-w-sm px-6 py-5 brutal-border brutal-shadow-sm-static bg-white text-3xl font-black uppercase hover:bg-gray-50 active:translate-y-1 active:translate-x-1 active:shadow-none text-center">Log In</Link>
              )}
              
              <Link href={isAuthenticated ? "/workspace" : "/login"} onClick={() => setIsMobileMenuOpen(false)} className="w-full max-w-sm px-6 py-5 brutal-border brutal-shadow-sm-static bg-black text-white text-3xl font-black uppercase hover:bg-gray-800 active:translate-y-1 active:translate-x-1 active:shadow-none text-center">
                {isAuthenticated ? "Workspace" : "Get Started"}
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
