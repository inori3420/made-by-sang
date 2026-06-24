"use client";

import { useCallback, useRef } from "react";
import { TransitionRouter } from "next-transition-router";
import { gsap, interactionEase } from "../../lib/animation";

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export default function TransitionProviders({ children }) {
  const pageRef = useRef(null);

  const leave = useCallback((next) => {
    const page = pageRef.current;

    if (!page || prefersReducedMotion()) {
      next();
      return undefined;
    }

    const tween = gsap.to(page, {
      autoAlpha: 0,
      y: "-1.5rem",
      duration: 0.35,
      ease: interactionEase,
      overwrite: "auto",
      onComplete: next,
    });

    return () => {
      tween.kill();
    };
  }, []);

  const enter = useCallback((next) => {
    const page = pageRef.current;

    if (!page || prefersReducedMotion()) {
      next();
      return undefined;
    }

    const tween = gsap.fromTo(
      page,
      {
        autoAlpha: 0,
        y: "1.5rem",
      },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.45,
        ease: interactionEase,
        overwrite: "auto",
        clearProps: "opacity,visibility,transform",
        onComplete: next,
      },
    );

    return () => {
      tween.kill();
    };
  }, []);

  return (
    <TransitionRouter auto leave={leave} enter={enter}>
      <main
        ref={pageRef}
        data-main
        data-page-transition
        className="min-h-full flex flex-col"
      >
        {children}
      </main>
    </TransitionRouter>
  );
}
