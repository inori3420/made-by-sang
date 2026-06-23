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
  const leadingSlotRef = useRef(null);
  const trailingSlotRef = useRef(null);
  const reduceMotionRef = useRef(false);
  const interactionRef = useRef(null);
  const classes = [styles.button, className].filter(Boolean).join(" ");

  useLayoutEffect(() => {
    const button = buttonRef.current;
    const leadingSlot = leadingSlotRef.current;
    const trailingSlot = trailingSlotRef.current;

    const context = gsap.context(() => {
      reduceMotionRef.current = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (icon) {
        gsap.set(leadingSlot, {
          width: 0,
          marginRight: "calc(var(--space-md) * -1)",
          scale: 0,
          transformOrigin: "center",
        });
        gsap.set(trailingSlot, {
          width: "2.5rem",
          marginLeft: 0,
          scale: 1,
          transformOrigin: "center",
        });
      }
    }, button);

    return () => {
      interactionRef.current?.kill();
      gsap.killTweensOf([leadingSlot, trailingSlot]);
      context.revert();
    };
  }, [icon]);

  function showInteraction() {
    interactionRef.current?.kill();
    gsap.killTweensOf([
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
        .to(
          leadingSlotRef.current,
          {
            width: "2.5rem",
            marginRight: 0,
            scale: 1,
          },
          0,
        )
        .to(
          trailingSlotRef.current,
          {
            width: 0,
            marginLeft: "calc(var(--space-md) * -1)",
            scale: 0,
          },
          0,
        );
    }

    interactionRef.current = timeline;
  }

  function hideInteraction() {
    interactionRef.current?.kill();
    gsap.killTweensOf([
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
        .to(
          leadingSlotRef.current,
          {
            width: 0,
            marginRight: "calc(var(--space-md) * -1)",
            scale: 0,
          },
          0,
        )
        .to(
          trailingSlotRef.current,
          {
            width: "2.5rem",
            marginLeft: 0,
            scale: 1,
          },
          0,
        );
    }

    interactionRef.current = timeline;
  }

  const content = (
    <span className={styles.content}>
      {icon && (
        <span
          ref={leadingSlotRef}
          className={`${styles.iconSlot} ${styles.leadingIconSlot}`}
          aria-hidden="true"
        >
          <Icon size={18} />
        </span>
      )}
      <span className={`${styles.tile} ${styles.label}`}>{children}</span>
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
