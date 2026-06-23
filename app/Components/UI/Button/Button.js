"use client";

import { useLayoutEffect, useRef } from "react";
import Link from "next/link";
import { RiCornerDownRightLine } from "@remixicon/react";
import { gsap, interactionEase } from "../../../lib/animation";
import styles from "./button.module.css";

export default function Button({
  children,
  className = "",
  href,
  icon = true,
  Icon = RiCornerDownRightLine,
  onBlur,
  onFocus,
  onMouseEnter,
  onMouseLeave,
  type = "button",
  ...props
}) {
  const buttonRef = useRef(null);
  const contentRef = useRef(null);
  const labelRef = useRef(null);
  const leadingSlotRef = useRef(null);
  const trailingSlotRef = useRef(null);
  const reduceMotionRef = useRef(false);
  const interactionRef = useRef(null);
  const classes = [styles.button, className].filter(Boolean).join(" ");

  useLayoutEffect(() => {
    const button = buttonRef.current;
    const label = labelRef.current;
    const leadingSlot = leadingSlotRef.current;
    const trailingSlot = trailingSlotRef.current;

    const context = gsap.context(() => {
      reduceMotionRef.current = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (icon) {
        gsap.set(leadingSlot, {
          scale: 0,
          transformOrigin: "center",
        });
        gsap.set(trailingSlot, {
          scale: 1,
          transformOrigin: "center",
        });
        gsap.set(label, { x: 0 });
      }
    }, button);

    return () => {
      interactionRef.current?.kill();
      gsap.killTweensOf([label, leadingSlot, trailingSlot]);
      context.revert();
    };
  }, [icon]);

  function showInteraction() {
    const content = contentRef.current;
    const iconWidth = leadingSlotRef.current.offsetWidth;
    const gap = Number.parseFloat(getComputedStyle(content).columnGap) || 0;

    interactionRef.current?.kill();
    gsap.killTweensOf([
      labelRef.current,
      leadingSlotRef.current,
      trailingSlotRef.current,
    ]);

    const timeline = gsap.timeline({
      defaults: {
        duration: reduceMotionRef.current ? 0 : 0.36,
        ease: interactionEase,
        overwrite: "auto",
      },
      onComplete: () => {
        interactionRef.current = null;
      },
    });

    if (icon) {
      timeline
        .to(leadingSlotRef.current, { scale: 1 }, 0)
        .to(trailingSlotRef.current, { scale: 0 }, 0)
        .to(
          labelRef.current,
          { x: iconWidth + gap },
          0,
        );
    }

    interactionRef.current = timeline;
  }

  function hideInteraction() {
    interactionRef.current?.kill();
    gsap.killTweensOf([
      labelRef.current,
      leadingSlotRef.current,
      trailingSlotRef.current,
    ]);

    const timeline = gsap.timeline({
      defaults: {
        duration: reduceMotionRef.current ? 0 : 0.32,
        ease: interactionEase,
        overwrite: "auto",
      },
      onComplete: () => {
        interactionRef.current = null;
      },
    });

    if (icon) {
      timeline
        .to(leadingSlotRef.current, { scale: 0 }, 0)
        .to(trailingSlotRef.current, { scale: 1 }, 0)
        .to(labelRef.current, { x: 0 }, 0);
    }

    interactionRef.current = timeline;
  }

  const content = (
    <span ref={contentRef} className={styles.content}>
      {icon && (
        <span
          ref={leadingSlotRef}
          className={`${styles.iconSlot} ${styles.leadingIconSlot}`}
          aria-hidden="true"
        >
          <Icon size={18} />
        </span>
      )}
      <span ref={labelRef} className={`${styles.tile} ${styles.label}`}>
        {children}
      </span>
      {icon && (
        <span
          ref={trailingSlotRef}
          className={`${styles.iconSlot} ${styles.trailingIconSlot}`}
          aria-hidden="true"
        >
          <Icon size={18} />
        </span>
      )}
    </span>
  );

  if (href) {
    return (
      <Link
        ref={buttonRef}
        href={href}
        className={classes}
        onMouseEnter={(event) => {
          showInteraction();
          onMouseEnter?.(event);
        }}
        onMouseLeave={(event) => {
          hideInteraction();
          onMouseLeave?.(event);
        }}
        onFocus={(event) => {
          showInteraction();
          onFocus?.(event);
        }}
        onBlur={(event) => {
          hideInteraction();
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
        showInteraction();
        onMouseEnter?.(event);
      }}
      onMouseLeave={(event) => {
        hideInteraction();
        onMouseLeave?.(event);
      }}
      onFocus={(event) => {
        showInteraction();
        onFocus?.(event);
      }}
      onBlur={(event) => {
        hideInteraction();
        onBlur?.(event);
      }}
      {...props}
    >
      {content}
    </button>
  );
}
