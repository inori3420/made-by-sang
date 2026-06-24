"use client";

import Image from "next/image";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "../../../lib/animation";
import styles from "./dissolveImageStack.module.css";

const defaultImages = [
  "/images/how/placeholder-1.png",
  "/images/how/placeholder-2.png",
  "/images/how/placeholder-3.png",
  "/images/how/placeholder-4.png",
  "/images/how/placeholder-5.png",
];

const characters = "MADEBY©SANG";

function getRandomCharacter(index) {
  return characters[index % characters.length];
}

function hashFromPosition(row, column, seed) {
  const raw = Math.sin(row * seed + column * (seed * 2.45)) * 43758.5453;
  return raw - Math.floor(raw);
}

export default function DissolveImageStack({
  images = defaultImages,
  className = "",
  color = "var(--brand-400)",
  textColor = "var(--text-primary)",
  cellSize = 16,
  as: Component = "section",
  imageSizes = "100vw",
  navbarTheme = "inverse",
  pin = true,
  pinSpacing = true,
  trigger,
  start = "top top",
  end,
  height = "100svh",
  minHeight = height,
  segmentHoldRatio = 0,
}) {
  const rootRef = useRef(null);
  const gridRef = useRef(null);
  const imageRefs = useRef([]);
  const [gridSize, setGridSize] = useState({ columns: 0, rows: 0 });

  const dissolveCells = useMemo(() => {
    const cells = [];

    for (let row = 0; row < gridSize.rows; row += 1) {
      for (let column = 0; column < gridSize.columns; column += 1) {
        cells.push({
          row,
          column,
          normalizedY: (row + 0.5) / gridSize.rows,
          character: getRandomCharacter(row * gridSize.columns + column),
          visibilityRandom: hashFromPosition(row, column, 127.1),
          scatterOffset: (hashFromPosition(row, column, 269.3) - 0.5) * 0.15,
        });
      }
    }

    return cells;
  }, [gridSize.columns, gridSize.rows]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const measureGrid = () => {
      const bounds = root.getBoundingClientRect();

      setGridSize({
        columns: Math.max(1, Math.ceil(bounds.width / cellSize)),
        rows: Math.max(1, Math.ceil(bounds.height / cellSize)),
      });
    };

    measureGrid();
    window.addEventListener("resize", measureGrid);

    return () => {
      window.removeEventListener("resize", measureGrid);
    };
  }, [cellSize]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const grid = gridRef.current;
    const stackedImages = imageRefs.current.filter(Boolean);
    const totalImages = stackedImages.length;
    const totalTransitions = totalImages - 1;

    if (!root || !grid || !dissolveCells.length || totalTransitions <= 0) {
      return;
    }

    const context = gsap.context(() => {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const dissolveCellElements = gsap.utils.toArray(
        "[data-dissolve-cell]",
        grid,
      );
      const spreadAbove = 0.25;
      const spreadBelow = 0.25;
      const solidCoreRadius = 0.025;
      const minScatterAtCenter = 0.3;
      const visibilityThreshold = 0.65;
      const totalTravelRange = 1 + spreadAbove + spreadBelow;
      const transitionStartRatio = gsap.utils.clamp(0, 0.95, segmentHoldRatio);
      const transitionRange = 1 - transitionStartRatio;
      let activeTransitionIndex = 0;

      stackedImages.forEach((image, index) => {
        gsap.set(image, {
          zIndex: totalImages - index,
          clipPath:
            index < totalTransitions
              ? "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)"
              : "none",
        });
      });

      gsap.set(dissolveCellElements, { opacity: 1, visibility: "hidden" });

      const hideAllDissolveCells = () => {
        gsap.set(dissolveCellElements, { visibility: "hidden" });
      };

      const updateImageClipPaths = (scrollProgress) => {
        for (let index = 0; index < totalTransitions; index += 1) {
          const segmentStart = index / totalTransitions;
          const segmentEnd = (index + 1) / totalTransitions;
          const rawSegmentProgress = gsap.utils.clamp(
            0,
            1,
            (scrollProgress - segmentStart) / (segmentEnd - segmentStart),
          );
          const segmentProgress = gsap.utils.clamp(
            0,
            1,
            (rawSegmentProgress - transitionStartRatio) / transitionRange,
          );
          const remappedPosition =
            -spreadAbove + segmentProgress * totalTravelRange;
          const clipPercent = gsap.utils.clamp(0, 100, remappedPosition * 100);

          stackedImages[index].style.clipPath =
            `polygon(0% ${clipPercent}%, 100% ${clipPercent}%, 100% 100%, 0% 100%)`;
        }
      };

      const updateDissolveGrid = (scrollProgress) => {
        const segmentStart = activeTransitionIndex / totalTransitions;
        const segmentEnd = (activeTransitionIndex + 1) / totalTransitions;
        const rawSegmentProgress = gsap.utils.clamp(
          0,
          1,
          (scrollProgress - segmentStart) / (segmentEnd - segmentStart),
        );
        const segmentProgress = gsap.utils.clamp(
          0,
          1,
          (rawSegmentProgress - transitionStartRatio) / transitionRange,
        );
        const bandCenterY = -spreadAbove + segmentProgress * totalTravelRange;

        for (let index = 0; index < dissolveCells.length; index += 1) {
          const cell = dissolveCells[index];
          const rawDistance = Math.abs(cell.normalizedY - bandCenterY);
          const scatterStrength = gsap.utils.clamp(
            minScatterAtCenter,
            1,
            rawDistance / solidCoreRadius,
          );
          const scatteredDistance =
            cell.normalizedY -
            bandCenterY +
            cell.scatterOffset * scatterStrength;
          const normalizedDistance =
            scatteredDistance >= 0
              ? scatteredDistance / spreadBelow
              : Math.abs(scatteredDistance) / spreadAbove;

          if (normalizedDistance >= 1) {
            dissolveCellElements[index].style.visibility = "hidden";
            continue;
          }

          const density = (1 - normalizedDistance) * (1 - normalizedDistance);
          const isVisible =
            density > cell.visibilityRandom * visibilityThreshold;

          dissolveCellElements[index].style.visibility = isVisible
            ? "visible"
            : "hidden";
        }
      };

      hideAllDissolveCells();

      if (prefersReducedMotion) {
        stackedImages.forEach((image, index) => {
          gsap.set(image, {
            autoAlpha: index === 0 ? 1 : 0,
            clearProps: index === 0 ? "clipPath" : "",
          });
        });
        return;
      }

      ScrollTrigger.create({
        trigger:
          typeof trigger === "string"
            ? document.querySelector(trigger)
            : trigger || root,
        start,
        end: end ?? (() => `+=${totalTransitions * window.innerHeight}`),
        pin,
        pinSpacing,
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const scrollProgress = self.progress;
          const rawPosition = scrollProgress * totalTransitions;
          const currentTransition = Math.min(
            Math.floor(rawPosition),
            totalTransitions - 1,
          );
          const transitionProgress = gsap.utils.clamp(
            0,
            1,
            (rawPosition - currentTransition - transitionStartRatio) /
              transitionRange,
          );

          activeTransitionIndex = currentTransition;
          updateImageClipPaths(scrollProgress);

          if (transitionProgress <= 0 || transitionProgress >= 1) {
            hideAllDissolveCells();
            return;
          }

          updateDissolveGrid(scrollProgress);
        },
      });
    }, root);

    return () => {
      context.revert();
    };
  }, [
    dissolveCells,
    end,
    images.length,
    pin,
    pinSpacing,
    segmentHoldRatio,
    start,
    trigger,
  ]);

  return (
    <Component
      ref={rootRef}
      className={`${styles.dissolveImageStack} ${className}`}
      data-navbar-theme={navbarTheme || undefined}
      style={{
        "--dissolve-color": color,
        "--dissolve-text-color": textColor,
        "--dissolve-cell-size": `${cellSize}px`,
        "--dissolve-font-size": `${Math.round(cellSize * 0.7)}px`,
        "--dissolve-height": height,
        "--dissolve-min-height": minHeight,
      }}
    >
      <div className={styles.imageStack} aria-hidden="true">
        {images.map((src, index) => (
          <div
            className={styles.imageLayer}
            key={src}
            ref={(element) => {
              imageRefs.current[index] = element;
            }}
          >
            <Image
              src={src}
              alt=""
              fill
              sizes={imageSizes}
              priority={index === 0}
              className={styles.image}
            />
          </div>
        ))}
      </div>

      <div ref={gridRef} className={styles.dissolveGrid} aria-hidden="true">
        {dissolveCells.map((cell) => (
          <span
            className={styles.dissolveCell}
            data-dissolve-cell
            key={`${cell.row}-${cell.column}`}
            style={{
              left: `${cell.column * cellSize}px`,
              top: `${cell.row * cellSize}px`,
            }}
          >
            {cell.character}
          </span>
        ))}
      </div>
    </Component>
  );
}
