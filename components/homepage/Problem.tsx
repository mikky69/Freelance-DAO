'use client';

import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import SplitText from "gsap/SplitText";

const Problem = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger, SplitText);

    const ctx = gsap.context(() => {
      if (!textRef.current || !containerRef.current) return;

      const split = new SplitText(textRef.current, {
        type: "chars"
        
      });
      

      const chars = split.chars;
         split.chars.forEach((char: Element) => {
      (char as HTMLElement).style.backgroundImage =
        "linear-gradient(45deg, #FF068D, #AE16A7, #FA5F04)";
      (char as HTMLElement).style.webkitBackgroundClip = "text";
      (char as HTMLElement).style.webkitTextFillColor = "transparent";
    });

      gsap.set(chars, {
        y: () => gsap.utils.random(-80, 80),
        rotation: () => gsap.utils.random(-20, 20),
        opacity: 0,
      });

      gsap.to(chars, {
        y: 0,
        rotation: 0,
        opacity: 1,
        stagger: 0.02,
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=1200",
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        }
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="bg-white min-h-[100vh] flex justify-center items-center relative overflow-hidden"
    >
      <h1
        ref={textRef}
        className="text-black font-nunito md:text-[4.125rem] lg:text-[5.125rem] xl:text-[8.125rem] text-[1.7rem] font-bold whitespace-nowrap"
        style={{
          backgroundImage: "linear-gradient(45deg, #FF068D, #AE16A7, #FA5F04)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        The Old Way Is Broken
      </h1>
    </section>
  );
};

export default Problem;