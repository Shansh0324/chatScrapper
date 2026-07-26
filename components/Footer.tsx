"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLenis } from "lenis/react";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();
  const lenis = useLenis();

  const handleHashClick = (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
    if (pathname === "/") {
      e.preventDefault();
      lenis?.scrollTo(hash, { offset: -50 });
      window.history.replaceState(null, "", hash);
    }
  };

  return (
    <footer className="w-full border-t-[8px] border-black bg-white pt-16 pb-8 px-6 sm:px-12 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
        
        {/* Branding Section */}
        <div className="flex flex-col gap-6 max-w-sm">
          <Link href="/" className="text-4xl sm:text-5xl logo-text drop-shadow-[4px_4px_0_rgba(0,0,0,1)]">
            <span className="logo-chat">Chat</span>
            <span className="logo-notes">Notes</span>
          </Link>
          <p className="text-xl font-bold leading-snug">
            Turn any web page or video into structured, summarized notes instantly.
          </p>
        </div>

        {/* Links Section */}
        <div className="flex gap-16 md:gap-24 flex-wrap">
          <div className="flex flex-col gap-4">
            <h4 className="text-2xl font-black uppercase mb-2">Product</h4>
            <Link href="/#how-it-works" onClick={(e) => handleHashClick(e, "#how-it-works")} className="text-xl font-bold uppercase hover:text-[#ff00ff] hover:underline decoration-4 underline-offset-4 transition-colors">How it works</Link>
            <Link href="/#pricing" onClick={(e) => handleHashClick(e, "#pricing")} className="text-xl font-bold uppercase hover:text-[#ff00ff] hover:underline decoration-4 underline-offset-4 transition-colors">Pricing</Link>
            <Link href="/login" className="text-xl font-bold uppercase hover:text-[#ff00ff] hover:underline decoration-4 underline-offset-4 transition-colors">Log In</Link>
          </div>
          
          <div className="flex flex-col gap-4">
            <h4 className="text-2xl font-black uppercase mb-2">Legal</h4>
            <Link href="/terms" className="text-xl font-bold uppercase hover:text-[#ff00ff] hover:underline decoration-4 underline-offset-4 transition-colors">Terms</Link>
            <Link href="/privacy" className="text-xl font-bold uppercase hover:text-[#ff00ff] hover:underline decoration-4 underline-offset-4 transition-colors">Privacy</Link>
            <Link href="/contact" className="text-xl font-bold uppercase hover:text-[#ff00ff] hover:underline decoration-4 underline-offset-4 transition-colors">Contact</Link>
          </div>
        </div>
      </div>
      
      {/* Copyright */}
      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t-[4px] border-black flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-lg font-black uppercase">
          &copy; {currentYear} CHATNOTES. ALL RIGHTS RESERVED.
        </p>
        <p className="text-lg font-black uppercase">
          DESIGNED WITH <span className="text-[#ff00ff]">BRUTALISM</span>
        </p>
      </div>
    </footer>
  );
}
