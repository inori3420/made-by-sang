"use client";

import { useCallback, useLayoutEffect, useMemo, useRef } from "react";
import { gsap } from "../../../lib/animation";
import styles from "./gridTransition.module.css";

export default function GridTransition({
  className = "",
  color = "var(--bg-inverse)",
  columns = 16,
  rows = 9,
  start = "top bottom",
  end = "bottom top",
  scrub = true,
  trigger,
  direction = "random",
  navbarTheme,
}) {
  const rootRef = useRef(null);
  const columnCount = Math.max(1, Math.round(columns));
  const rowCount = Math.max(1, Math.round(rows));
  const totalCells = columnCount * rowCount;
  const cells = useMemo(
    () => Array.from({ length: totalCells }, (_, index) => index),
    [totalCells],
  );
  const getCellOrder = useCallback(
    (cell) => {
      const row = Math.floor(cell / columnCount);
      const column = cell % columnCount;
      const rowFromBottom = rowCount - 1 - row;
      const randomOrder =
        Math.abs(Math.sin((cell + 1) * 12.9898) * 43758.5453) % 1;

      if (direction === "fully-random") return randomOrder * totalCells;

      if (direction === "random") {
        return rowFromBottom * columnCount + randomOrder * columnCount;
      }

      if (direction === "top-to-bottom") return row * columnCount + column;

      return rowFromBottom * columnCount + column;
    },
    [columnCount, direction, rowCount, totalCells],
  );

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let clearNavbarTheme = () => {};

    const context = gsap.context(() => {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const cells = gsap.utils.toArray("[data-grid-transition-cell]", root);
      const triggerElement =
        typeof trigger === "string"
          ? document.querySelector(trigger)
          : trigger || root;
      const dispatchNavbarTheme = (active) => {
        if (!navbarTheme) return;

        window.dispatchEvent(
          new CustomEvent("navbar-theme-override", {
            detail: {
              active,
              theme: navbarTheme,
              source: root,
            },
          }),
        );
      };
      const syncNavbarTheme = (progress) => {
        dispatchNavbarTheme(progress >= 0.999);
      };
      clearNavbarTheme = () => dispatchNavbarTheme(false);

      gsap.set(cells, { autoAlpha: prefersReducedMotion ? 1 : 0 });

      if (prefersReducedMotion) {
        dispatchNavbarTheme(true);
        return;
      }

      gsap.to(cells, {
        autoAlpha: 1,
        ease: "none",
        stagger: (index) => getCellOrder(index) * 0.01,
        scrollTrigger: {
          trigger: triggerElement,
          start,
          end,
          invalidateOnRefresh: true,
          scrub,
          onUpdate: (self) => syncNavbarTheme(self.progress),
          onLeave: () => dispatchNavbarTheme(true),
          onLeaveBack: () => dispatchNavbarTheme(false),
        },
      });
    }, root);

    return () => {
      clearNavbarTheme();
      context.revert();
    };
  }, [end, getCellOrder, navbarTheme, scrub, start, trigger]);

  return (
    <div
      ref={rootRef}
      className={`${styles.gridTransition} ${className}`}
      style={{
        "--grid-transition-color": color,
        "--grid-transition-columns": String(columnCount),
        "--grid-transition-rows": String(rowCount),
      }}
      aria-hidden="true"
    >
      {cells.map((cell) => (
        <span
          className={styles.cell}
          data-grid-transition-cell
          key={cell}
        />
      ))}
    </div>
  );
}
