"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { ScrollTrigger } from "../../../lib/animation";

const STOP_EVENT = "locomotive-scroll:stop";
const START_EVENT = "locomotive-scroll:start";

export default function SmoothScroll() {
  const pathname = usePathname();
  const scrollRef = useRef(null);

  useLayoutEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration;

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    return () => {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = previousScrollRestoration;
      }
    };
  }, []);

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduceMotion) return;

    let cancelled = false;
    let isStopped = false;

    function stopScroll() {
      isStopped = true;
      scrollRef.current?.stop();
    }

    function startScroll() {
      isStopped = false;
      scrollRef.current?.start();
    }

    window.addEventListener(STOP_EVENT, stopScroll);
    window.addEventListener(START_EVENT, startScroll);

    async function init() {
      const { default: LocomotiveScroll } = await import("locomotive-scroll");

      if (cancelled) return;

      const scroll = new LocomotiveScroll({
        autoStart: false,
        scrollCallback: ScrollTrigger.update,
        lenisOptions: {
          autoResize: true,
          lerp: 0.1,
          smoothWheel: true,
          stopInertiaOnNavigate: true,
        },
      });

      scrollRef.current = scroll;

      if (!isStopped) {
        scroll.start();
      }
    }

    init();

    return () => {
      cancelled = true;
      window.removeEventListener(STOP_EVENT, stopScroll);
      window.removeEventListener(START_EVENT, startScroll);
      scrollRef.current?.destroy();
      scrollRef.current = null;
    };
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      scrollRef.current?.resize();
      ScrollTrigger.refresh();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  return null;
}
