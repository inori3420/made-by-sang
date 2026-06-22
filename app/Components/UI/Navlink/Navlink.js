"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { gsap, interactionEase } from "../../../lib/animation";
import styles from "./navlink.module.css";

export default function Navlink({
  children,
  className = "",
  href,
  onBlur,
  onFocus,
  onMouseEnter,
  onMouseLeave,
  ...props
}) {
  const pathname = usePathname();
  const isActive = pathname === href;
  const linkRef = useRef(null);
  const shapeRef = useRef(null);
  const reduceMotionRef = useRef(false);

  const classes = [styles.navLink, isActive && styles.active, className]
    .filter(Boolean)
    .join(" ");

  useEffect(() => {
    const shape = shapeRef.current;

    const context = gsap.context(() => {
      reduceMotionRef.current = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      gsap.set(shape, {
        scaleX: isActive ? 1 : 0,
        transformOrigin: "left center",
      });
    }, linkRef);

    return () => {
      gsap.killTweensOf(shape);
      context.revert();
    };
  }, [isActive]);

  function showShape() {
    gsap.killTweensOf(shapeRef.current);
    gsap.set(shapeRef.current, { transformOrigin: "left center" });
    gsap.to(shapeRef.current, {
      scaleX: 1,
      duration: reduceMotionRef.current ? 0 : 0.42,
      ease: interactionEase,
      overwrite: "auto",
    });
  }

  function hideShape() {
    if (!isActive) {
      gsap.killTweensOf(shapeRef.current);
      gsap.set(shapeRef.current, { transformOrigin: "right center" });
      gsap.to(shapeRef.current, {
        scaleX: 0,
        duration: reduceMotionRef.current ? 0 : 0.42,
        ease: interactionEase,
        overwrite: "auto",
      });
    }
  }

  return (
    <Link
      ref={linkRef}
      href={href}
      className={classes}
      aria-current={isActive ? "page" : undefined}
      onMouseEnter={(event) => {
        showShape();
        onMouseEnter?.(event);
      }}
      onMouseLeave={(event) => {
        hideShape();
        onMouseLeave?.(event);
      }}
      onFocus={(event) => {
        showShape();
        onFocus?.(event);
      }}
      onBlur={(event) => {
        hideShape();
        onBlur?.(event);
      }}
      {...props}
    >
      <span ref={shapeRef} className={styles.shape} aria-hidden="true" />
      <span className={styles.label}>{children}</span>
    </Link>
  );
}
