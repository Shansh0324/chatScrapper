"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export function OpeningAnimation() {
  const container = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const logoWrapper = useRef<HTMLDivElement>(null);
  
  const [isVisible, setIsVisible] = useState(true);

  useGSAP(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        setIsVisible(false);
      }
    });

    // Initial state
    gsap.set(logoWrapper.current, { scale: 0, rotation: -90, opacity: 0 });

    // 1. Logo aggressively spins and scales in
    tl.to(logoWrapper.current, {
      scale: 1,
      rotation: -6,
      opacity: 1,
      duration: 1.2,
      ease: "expo.out"
    });

    // 2. Pause for impact
    tl.to({}, { duration: 0.5 });

    // 3. Logo scales massively towards the user
    tl.to(logoWrapper.current, {
      scale: 40,
      opacity: 0,
      duration: 1.0,
      ease: "power4.in"
    });

    // 4. Fade out the black background as the logo rushes past the camera
    tl.to(bgRef.current, {
      opacity: 0,
      duration: 0.6,
      ease: "power2.out"
    }, "-=0.6");

    // 5. Hide container
    tl.set(container.current, { display: "none" });

  }, { scope: container });

  if (!isVisible) return null;

  return (
    <div ref={container} className="fixed inset-0 z-[9999] overflow-hidden flex items-center justify-center pointer-events-none">
      
      {/* Black Background */}
      <div ref={bgRef} className="absolute inset-0 bg-black pointer-events-auto" />
      
      {/* Centered Logo */}
      <div className="relative z-10 flex items-center justify-center">
        <div ref={logoWrapper} className="w-40 h-40 sm:w-56 sm:h-56 relative brutal-border bg-white shadow-[12px_12px_0_rgba(255,0,255,1)] transform -rotate-6">
          <Image 
            src="/logo.png" 
            alt="ChatNotes Logo" 
            fill 
            className="object-cover p-3"
            priority
          />
        </div>
      </div>
      
    </div>
  );
}
