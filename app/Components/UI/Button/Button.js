"use client";

import { useLayoutEffect, useRef } from "react";
import Link from "next/link";
import { gsap, interactionEase } from "../../../lib/animation";
import styles from "./button.module.css";

const pixels = Array.from({ length: 24 });

export default function Button({
  children,
  className = "",
  href,
  onBlur,
  onFocus,
  onMouseEnter,
  onMouseLeave,
  type = "button",
  ...props
}) {
  const buttonRef = useRef(null);
  const gridRef = useRef(null);
  const reduceMotionRef = useRef(false);
  const classes = [styles.button, className].filter(Boolean).join(" ");

  useLayoutEffect(() => {
    const button = buttonRef.current;
    const tiles = gridRef.current.children;

    const context = gsap.context(() => {
      reduceMotionRef.current = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      gsap.set(tiles, { scale: 0, transformOrigin: "center" });
    }, button);

    return () => context.revert();
  }, []);

  function showPixels() {
    const tiles = gridRef.current.children;

    gsap.killTweensOf(tiles);
    gsap.to(tiles, {
      scale: 1.06,
      duration: reduceMotionRef.current ? 0 : 0.32,
      ease: interactionEase,
      stagger: {
        amount: reduceMotionRef.current ? 0 : 0.18,
        grid: [3, 8],
        axis: "x",
        from: "start",
      },
      overwrite: "auto",
    });
  }

  function hidePixels() {
    const tiles = gridRef.current.children;

    gsap.killTweensOf(tiles);
    gsap.to(tiles, {
      scale: 0,
      duration: reduceMotionRef.current ? 0 : 0.28,
      ease: interactionEase,
      stagger: {
        amount: reduceMotionRef.current ? 0 : 0.14,
        grid: [3, 8],
        axis: "x",
        from: "start",
      },
      overwrite: "auto",
    });
  }

  const content = (
    <>
      <span ref={gridRef} className={styles.pixelGrid} aria-hidden="true">
        {pixels.map((_, index) => (
          <span className={styles.pixel} key={index} />
        ))}
      </span>
      <span className={styles.label}>{children}</span>
    </>
  );

  if (href) {
    return (
      <Link
        ref={buttonRef}
        href={href}
        className={classes}
        onMouseEnter={(event) => {
          showPixels();
          onMouseEnter?.(event);
        }}
        onMouseLeave={(event) => {
          hidePixels();
          onMouseLeave?.(event);
        }}
        onFocus={(event) => {
          showPixels();
          onFocus?.(event);
        }}
        onBlur={(event) => {
          hidePixels();
          onBlur?.(event);
        }}
        {...props}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      ref={buttonRef}
      type={type}
      className={classes}
      onMouseEnter={(event) => {
        showPixels();
        onMouseEnter?.(event);
      }}
      onMouseLeave={(event) => {
        hidePixels();
        onMouseLeave?.(event);
      }}
      onFocus={(event) => {
        showPixels();
        onFocus?.(event);
      }}
      onBlur={(event) => {
        hidePixels();
        onBlur?.(event);
      }}
      {...props}
    >
      {content}
    </button>
  );
}
