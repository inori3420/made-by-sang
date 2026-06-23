"use client";

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
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
  LeadingIcon = Icon,
  TrailingIcon = Icon,
  active,
  activeLabel,
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
  const labelStackRef = useRef(null);
  const leadingSlotRef = useRef(null);
  const trailingSlotRef = useRef(null);
  const reduceMotionRef = useRef(false);
  const interactionRef = useRef(null);
  const initializedRef = useRef(false);
  const initialActiveRef = useRef(Boolean(active));
  const isControlled = active !== undefined;
  const classes = [styles.button, className].filter(Boolean).join(" ");

  useLayoutEffect(() => {
    const button = buttonRef.current;
    const label = labelRef.current;
    const labelStack = labelStackRef.current;
    const leadingSlot = leadingSlotRef.current;
    const trailingSlot = trailingSlotRef.current;
    const initialActive = initialActiveRef.current;

    const context = gsap.context(() => {
      reduceMotionRef.current = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (icon) {
        gsap.set(leadingSlot, {
          scale: initialActive ? 1 : 0,
          rotation: initialActive ? 0 : -90,
          transformOrigin: "center",
        });
        gsap.set(trailingSlot, {
          scale: initialActive ? 0 : 1,
          rotation: initialActive ? 90 : 0,
          transformOrigin: "center",
        });
        gsap.set(label, {
          x: initialActive
            ? leadingSlot.offsetWidth +
              (Number.parseFloat(
                getComputedStyle(contentRef.current).columnGap,
              ) || 0)
            : 0,
        });
        gsap.set(labelStack, { yPercent: initialActive ? -50 : 0 });
      }

      initializedRef.current = true;
    }, button);

    return () => {
      interactionRef.current?.kill();
      gsap.killTweensOf([label, labelStack, leadingSlot, trailingSlot]);
      context.revert();
    };
  }, [icon]);

  const showInteraction = useCallback(() => {
    const content = contentRef.current;
    const iconWidth = leadingSlotRef.current.offsetWidth;
    const gap = Number.parseFloat(getComputedStyle(content).columnGap) || 0;

    interactionRef.current?.kill();
    gsap.killTweensOf([
      labelRef.current,
      labelStackRef.current,
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
        .to(leadingSlotRef.current, { scale: 1, rotation: 0 }, 0)
        .to(trailingSlotRef.current, { scale: 0, rotation: 90 }, 0)
        .to(labelStackRef.current, { yPercent: -50 }, 0)
        .to(labelRef.current, { x: iconWidth + gap }, 0);
    }

    interactionRef.current = timeline;
  }, [icon]);

  const hideInteraction = useCallback(() => {
    interactionRef.current?.kill();
    gsap.killTweensOf([
      labelRef.current,
      labelStackRef.current,
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
        .to(leadingSlotRef.current, { scale: 0, rotation: -90 }, 0)
        .to(trailingSlotRef.current, { scale: 1, rotation: 0 }, 0)
        .to(labelStackRef.current, { yPercent: 0 }, 0)
        .to(labelRef.current, { x: 0 }, 0);
    }

    interactionRef.current = timeline;
  }, [icon]);

  useEffect(() => {
    if (!isControlled || !initializedRef.current) return;

    if (active) {
      showInteraction();
    } else {
      hideInteraction();
    }
  }, [active, hideInteraction, isControlled, showInteraction]);

  const content = (
    <span ref={contentRef} className={styles.content}>
      {icon && (
        <span
          ref={leadingSlotRef}
          className={`${styles.iconSlot} ${styles.leadingIconSlot}`}
          aria-hidden="true"
        >
          <LeadingIcon size={18} />
        </span>
      )}
      <span ref={labelRef} className={`${styles.tile} ${styles.label}`}>
        {icon ? (
          <span className={styles.labelViewport}>
            <span ref={labelStackRef} className={styles.labelStack}>
              <span>{children}</span>
              <span aria-hidden="true">{activeLabel ?? children}</span>
            </span>
          </span>
        ) : (
          children
        )}
      </span>
      {icon && (
        <span
          ref={trailingSlotRef}
          className={`${styles.iconSlot} ${styles.trailingIconSlot}`}
          aria-hidden="true"
        >
          <TrailingIcon size={18} />
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
          if (!isControlled) showInteraction();
          onMouseEnter?.(event);
        }}
        onMouseLeave={(event) => {
          if (!isControlled) hideInteraction();
          onMouseLeave?.(event);
        }}
        onFocus={(event) => {
          if (!isControlled) showInteraction();
          onFocus?.(event);
        }}
        onBlur={(event) => {
          if (!isControlled) hideInteraction();
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
        if (!isControlled) showInteraction();
        onMouseEnter?.(event);
      }}
      onMouseLeave={(event) => {
        if (!isControlled) hideInteraction();
        onMouseLeave?.(event);
      }}
      onFocus={(event) => {
        if (!isControlled) showInteraction();
        onFocus?.(event);
      }}
      onBlur={(event) => {
        if (!isControlled) hideInteraction();
        onBlur?.(event);
      }}
      {...props}
    >
      {content}
    </button>
  );
}
