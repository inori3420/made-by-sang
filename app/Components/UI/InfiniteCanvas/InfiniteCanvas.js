"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./infiniteCanvas.module.css";

const GRID_COLUMNS = 7;
const GRID_GAP = 16;
const ROW_OVERSCAN = 2;
const COLUMN_OVERSCAN = 1;
const MIN_ZOOM = 0.72;
const MAX_ZOOM = 1.35;
const DEFAULT_CAMERA = {
  x: 0,
  y: 110,
  zoom: 1,
  skewX: 0,
  skewY: 0,
  rotateX: 0,
  rotateY: 0,
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function modulo(value, length) {
  return ((value % length) + length) % length;
}

function seededRandom(seed) {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

function hashCell(column, row) {
  return column * 73856093 + row * 19349663;
}

function buildTiles({ x, y, zoom }, viewport, imageCount) {
  if (!viewport.width || !viewport.height || imageCount === 0) return [];

  const cellSize = viewport.width / GRID_COLUMNS;
  const visibleWidth = viewport.width / zoom;
  const visibleHeight = viewport.height / zoom;
  const startColumn = Math.floor(x / cellSize) - COLUMN_OVERSCAN;
  const endColumn = Math.ceil((x + visibleWidth) / cellSize) + COLUMN_OVERSCAN;
  const startRow = Math.floor(y / cellSize) - ROW_OVERSCAN;
  const endRow = Math.ceil((y + visibleHeight) / cellSize) + ROW_OVERSCAN;
  const tiles = [];

  for (let row = startRow; row <= endRow; row += 1) {
    for (let column = startColumn; column <= endColumn; column += 1) {
      const seed = hashCell(column, row);

      tiles.push({
        id: `${column}:${row}`,
        imageIndex: modulo(Math.floor(seed), imageCount),
        worldX: column * cellSize,
        worldY: row * cellSize,
        size: cellSize,
        objectPosition: `${Math.round(seededRandom(seed + 4) * 100)}% ${Math.round(
          seededRandom(seed + 5) * 100,
        )}%`,
      });
    }
  }

  return tiles;
}

function getMotionSkew(state) {
  const screenVelocityX = state.velocityX * state.zoom;
  const screenVelocityY = state.velocityY * state.zoom;

  return {
    skewX: clamp(-screenVelocityX * 0.035, -7, 7),
    skewY: clamp(-screenVelocityY * 0.022, -4, 4),
    rotateX: clamp(screenVelocityY * 0.025, -4.5, 4.5),
    rotateY: clamp(-screenVelocityX * 0.025, -4.5, 4.5),
  };
}

export default function InfiniteCanvas({
  images = [],
  eyebrow = "Works",
  title = "Infinite Works Canvas",
  description = "Drag the field, wheel to zoom, and let momentum carry the archive.",
}) {
  const rootRef = useRef(null);
  const frameRef = useRef(null);
  const reduceMotionRef = useRef(false);
  const cameraRef = useRef({
    ...DEFAULT_CAMERA,
    targetX: DEFAULT_CAMERA.x,
    targetY: DEFAULT_CAMERA.y,
    targetZoom: DEFAULT_CAMERA.zoom,
    velocityX: 0,
    velocityY: 0,
  });
  const dragRef = useRef({
    active: false,
    pointerId: null,
    startX: 0,
    startY: 0,
    cameraX: DEFAULT_CAMERA.x,
    cameraY: DEFAULT_CAMERA.y,
    lastX: 0,
    lastY: 0,
    lastTime: 0,
  });

  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const [camera, setCamera] = useState(DEFAULT_CAMERA);
  const [isDragging, setIsDragging] = useState(false);

  const hasImages = images.length > 0;
  const tiles = useMemo(
    () =>
      buildTiles(
        {
          x: camera.x,
          y: camera.y,
          zoom: camera.zoom,
        },
        viewport,
        images.length,
      ),
    [camera.x, camera.y, camera.zoom, viewport, images.length],
  );

  const measure = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;

    const rect = root.getBoundingClientRect();
    setViewport({
      width: rect.width,
      height: rect.height,
    });
  }, []);

  useEffect(() => {
    reduceMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    measure();

    const observer = new ResizeObserver(measure);
    const root = rootRef.current;

    if (root) observer.observe(root);

    return () => observer.disconnect();
  }, [measure]);

  useEffect(() => {
    let mounted = true;

    function tick() {
      const state = cameraRef.current;
      const reduceMotion = reduceMotionRef.current;
      const damping = reduceMotion ? 0 : 0.9;
      const easing = reduceMotion ? 1 : 0.16;

      if (!dragRef.current.active) {
        state.targetX += state.velocityX;
        state.targetY += state.velocityY;
        state.velocityX *= damping;
        state.velocityY *= damping;

        if (Math.abs(state.velocityX) < 0.01) state.velocityX = 0;
        if (Math.abs(state.velocityY) < 0.01) state.velocityY = 0;
      }

      state.x += (state.targetX - state.x) * easing;
      state.y += (state.targetY - state.y) * easing;
      state.zoom += (state.targetZoom - state.zoom) * easing;

      const skew = reduceMotion
        ? { skewX: 0, skewY: 0, rotateX: 0, rotateY: 0 }
        : getMotionSkew(state);

      if (mounted) {
        setCamera({
          x: state.x,
          y: state.y,
          zoom: state.zoom,
          skewX: skew.skewX,
          skewY: skew.skewY,
          rotateX: skew.rotateX,
          rotateY: skew.rotateY,
        });
      }

      frameRef.current = window.requestAnimationFrame(tick);
    }

    frameRef.current = window.requestAnimationFrame(tick);

    return () => {
      mounted = false;
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  const handlePointerDown = useCallback((event) => {
    if (event.button !== 0 && event.pointerType === "mouse") return;

    const state = cameraRef.current;
    dragRef.current = {
      active: true,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      cameraX: state.targetX,
      cameraY: state.targetY,
      lastX: event.clientX,
      lastY: event.clientY,
      lastTime: performance.now(),
    };

    state.velocityX = 0;
    state.velocityY = 0;
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
  }, []);

  const handlePointerMove = useCallback((event) => {
    const drag = dragRef.current;

    if (!drag.active || drag.pointerId !== event.pointerId) return;

    const state = cameraRef.current;
    const now = performance.now();
    const elapsed = Math.max(now - drag.lastTime, 16);
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    const frameDx = event.clientX - drag.lastX;
    const frameDy = event.clientY - drag.lastY;

    state.targetX = drag.cameraX - dx / state.targetZoom;
    state.targetY = drag.cameraY - dy / state.targetZoom;
    state.velocityX = -(frameDx / state.targetZoom) * (16 / elapsed);
    state.velocityY = -(frameDy / state.targetZoom) * (16 / elapsed);

    drag.lastX = event.clientX;
    drag.lastY = event.clientY;
    drag.lastTime = now;
  }, []);

  const handlePointerUp = useCallback((event) => {
    const drag = dragRef.current;

    if (!drag.active || drag.pointerId !== event.pointerId) return;

    drag.active = false;
    drag.pointerId = null;
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((event) => {
    event.preventDefault();

    const root = rootRef.current;
    if (!root) return;

    const rect = root.getBoundingClientRect();
    const state = cameraRef.current;

    if (event.ctrlKey || event.metaKey) {
      const pointerX = event.clientX - rect.left;
      const pointerY = event.clientY - rect.top;
      const beforeX = state.targetX + pointerX / state.targetZoom;
      const beforeY = state.targetY + pointerY / state.targetZoom;
      const nextZoom = clamp(
        state.targetZoom * Math.exp(-event.deltaY * 0.001),
        MIN_ZOOM,
        MAX_ZOOM,
      );

      state.targetZoom = nextZoom;
      state.targetX = beforeX - pointerX / nextZoom;
      state.targetY = beforeY - pointerY / nextZoom;
    } else {
      state.targetX += event.deltaX / state.targetZoom;
      state.targetY += event.deltaY / state.targetZoom;
    }

    state.velocityX = 0;
    state.velocityY = 0;
  }, []);

  const handleKeyDown = useCallback((event) => {
    const state = cameraRef.current;
    const panStep = 140 / state.targetZoom;

    if (event.key === "ArrowUp") {
      state.targetY -= panStep;
    } else if (event.key === "ArrowDown") {
      state.targetY += panStep;
    } else if (event.key === "ArrowLeft") {
      state.targetX -= panStep;
    } else if (event.key === "ArrowRight") {
      state.targetX += panStep;
    } else if (event.key === "+" || event.key === "=") {
      state.targetZoom = clamp(state.targetZoom * 1.08, MIN_ZOOM, MAX_ZOOM);
    } else if (event.key === "-") {
      state.targetZoom = clamp(state.targetZoom / 1.08, MIN_ZOOM, MAX_ZOOM);
    } else {
      return;
    }

    event.preventDefault();
  }, []);

  return (
    <section
      ref={rootRef}
      className={styles.root}
      data-navbar-theme="default"
      aria-label={title}
      aria-describedby="infinite-canvas-description"
      data-dragging={isDragging ? "true" : "false"}
    >
      <p id="infinite-canvas-description" className={styles.srOnly}>
        {description}
      </p>

      <div className={styles.hud} aria-hidden="true">
        <span className={styles.kicker}>
          <span className={styles.dot} />
          {eyebrow}
        </span>
        <span className={styles.zoom}>{Math.round(camera.zoom * 100)}%</span>
      </div>

      <div
        className={styles.canvas}
        data-lenis-prevent
        role="application"
        aria-label="Draggable infinite works canvas"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        <div
          className={styles.world}
          style={{
            "--world-scale": isDragging ? 0.955 : 1,
            "--world-skew-x": `${camera.skewX}deg`,
            "--world-skew-y": `${camera.skewY}deg`,
            "--world-rotate-x": `${camera.rotateX}deg`,
            "--world-rotate-y": `${camera.rotateY}deg`,
          }}
        >
          {hasImages ? (
            tiles.map((tile) => {
              const image = images[tile.imageIndex];
              const screenX = (tile.worldX - camera.x) * camera.zoom;
              const screenY = (tile.worldY - camera.y) * camera.zoom;
              const tileSize = Math.ceil(tile.size * camera.zoom);

              return (
                <div
                  key={tile.id}
                  className={styles.tile}
                  style={{
                    "--tile-x": `${screenX}px`,
                    "--tile-y": `${screenY}px`,
                    "--tile-size": `${tileSize}px`,
                    "--tile-gap": `${GRID_GAP}px`,
                    "--tile-position": tile.objectPosition,
                  }}
                >
                  <Image
                    src={image.src}
                    alt=""
                    fill
                    sizes={`calc(100vw / ${GRID_COLUMNS})`}
                  />
                </div>
              );
            })
          ) : (
            <p className={styles.empty}>Add project images to begin.</p>
          )}
        </div>
      </div>
    </section>
  );
}
