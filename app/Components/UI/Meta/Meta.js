"use client";

import { useLayoutEffect, useRef } from "react";
import Status from "../Status/Status";
import Time from "../Time/Time";
import { gsap, interactionEase } from "../../../lib/animation";
import styles from "./meta.module.css";

export default function Meta({ className = "" }) {
  const metaRef = useRef(null);
  const classes = [styles.meta, className].filter(Boolean).join(" ");

  useLayoutEffect(() => {
    const meta = metaRef.current;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const context = gsap.context(() => {
      if (reduceMotion) {
        gsap.set(meta, { yPercent: 0, autoAlpha: 1 });
        return;
      }

      gsap.fromTo(
        meta,
        {
          yPercent: 100,
          autoAlpha: 0,
        },
        {
          yPercent: 0,
          autoAlpha: 1,
          duration: 0.9,
          delay: 0.3,
          ease: interactionEase,
          clearProps: "transform",
        },
      );
    }, meta);

    return () => context.revert();
  }, []);

  return (
    <div
      ref={metaRef}
      className={classes}
      style={{ opacity: 0, visibility: "hidden" }}
    >
      <Status />
      <Time />
    </div>
  );
}
