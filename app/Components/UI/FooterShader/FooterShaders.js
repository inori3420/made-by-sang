"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import styles from "./footerShaders.module.css";
import { gsap, interactionEase } from "../../../lib/animation";

/**
 * FooterShaders
 *
 * Inverse decorative background layer that replaces SignalLandscape behind Footer.
 * Renders flowing neon-green aurora ribbons over black with a halftone dot-grid
 * overlay, matching the project's footer reference art.
 *
 * Lightweight per project conventions: one fullscreen plane geometry, one shader
 * material, no image textures, capped renderer pixel ratio. It animates only while
 * in/near the viewport (IntersectionObserver) and renders a single static frame for
 * reduced-motion users. Renderer, geometry, material, listeners, and frames are all
 * disposed on cleanup.
 *
 * Props:
 *  - as:          element tag for the root. "section" (default) for semantic use,
 *                 or "div" when used as the decorative layer behind Footer.
 *  - decorative:  when true, marks the canvas wrapper aria-hidden and skips section
 *                 semantics. Footer should pass decorative.
 *  - className:   extra class names for the root.
 *  - navbarTheme: navbar theme token to expose via data-navbar-theme. Defaults to
 *                 "inverse" so the fixed navbar switches to inverse colors over it.
 */
export default function FooterShaders({
  as,
  decorative = false,
  className = "",
  navbarTheme = "inverse",
}) {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const root = rootRef.current;
    if (!canvas || !root) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // Cap DPR to avoid oversized GPU memory on high-DPR displays.
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: false,
      powerPreference: "low-power",
    });
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0x000000, 1);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const geometry = new THREE.PlaneGeometry(2, 2);

    const uniforms = {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uHold: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uCanvasSize: { value: new THREE.Vector2(1, 1) },
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      depthTest: false,
      depthWrite: false,
      vertexShader: /* glsl */ `
    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = vec4(position.xy, 0.0, 1.0);
    }
  `,
      fragmentShader: /* glsl */ `
    precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2  uResolution;
uniform float uHold;
uniform vec2  uMouse;
uniform vec2  uCanvasSize;

float softLight(float b, float s) {
  if (s <= 0.5) return b - (1.0 - 2.0 * s) * b * (1.0 - b);
  float d = (b <= 0.25) ? ((16.0 * b - 12.0) * b + 4.0) * b : sqrt(b);
  return b + (2.0 * s - 1.0) * (d - b);
}
vec3 softLight(vec3 b, vec3 s) {
  return vec3(softLight(b.r,s.r), softLight(b.g,s.g), softLight(b.b,s.b));
}

// Rounded rectangle SDF
float sdRoundedBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

void main() {
  vec2 uv = vUv;
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vec2((uv.x - 0.5) * aspect, uv.y - 0.5) * 0.8;

  float speedBoost = mix(1.0, 1.8, uHold);
  float t  = uTime * 0.83 * speedBoost;
  float t2 = uTime * 0.56 * speedBoost;
  float t3 = uTime * 0.75 * speedBoost;

  //------------------------------------------------------------
  // Corner mask — rounds in from canvas edges on hold
  //------------------------------------------------------------

  vec2 pixelSize = 1.0 / uResolution;
  float padX = 20.0 * pixelSize.x;
  float padY = 20.0 * pixelSize.y;

  vec2 uvCenter = uv - 0.5;
  vec2 uvAspect = vec2(uvCenter.x * aspect, uvCenter.y);
  vec2 halfSize = vec2(0.5 * aspect - padX * aspect, 0.5 - padY);
  float cr = mix(0.0, min(halfSize.x, halfSize.y), uHold);
  float sdf = sdRoundedBox(uvAspect, halfSize, cr);

  float pillMask = smoothstep(0.008, -0.008, sdf);
  float edgeGlow = smoothstep(0.04, 0.0, abs(sdf)) * uHold;

  //------------------------------------------------------------
  // Waves
  //------------------------------------------------------------

  float cx = cos(-t * 0.4) * 0.08 + cos(-t2 * 0.3) * 0.04;
  float cy = sin(-t * 0.4) * 0.08 + sin(-t3 * 0.25) * 0.04;

  float w1 = sin((p.x + cx * 0.7) * 4.2 + t  * 1.1 + 1.3);
  float w2 = sin((p.y + cy * 0.4) * 3.7 - t2 * 0.9 + w1 * 1.8 + 4.7);
  float w3 = sin((p.x + cy * 0.95 - p.y + cx * 0.15) * 3.1 + t3 * 0.7 + w2 * 2.0 + 2.1);
  float w4 = sin((p.x + cx * 0.23 + p.y - cy * 0.2) * 2.8 - t  * 1.3 + w3 * 1.6 + 5.8);
  float w5 = sin((p.x - cx * 0.68) * 2.1 - (p.y + cy * 0.2) * 3.3 + t2 * 0.5 + w4 * 1.4 + 3.4);

  float v     = (w1 + w2 + w3 + w4 + w5) / 3.0;
  float field = pow(max(v * 0.5 + 0.5, 0.0), 2.6);

  //------------------------------------------------------------
  // Colors
  //------------------------------------------------------------

  vec3 colorA = vec3(0.3,  0.7,  1.0);
  vec3 colorB = vec3(0.7,  0.4,  1.0);
  vec3 colorC = vec3(1.0,  0.85, 0.5);
  vec3 colorD = vec3(0.3,  0.95, 0.8);
  vec3 colorE = vec3(0.65, 1.0,  0.0);

  float m1 = sin(p.x * 3.1 + p.y * 1.7 + t  * 0.91) * 0.5 + 0.5;
  float m2 = sin(p.y * 2.4 - p.x * 2.2 + t2 * 0.73) * 0.5 + 0.5;
  float m3 = sin(p.x * 1.8 + p.y * 3.3 - t3 * 0.67) * 0.5 + 0.5;
  float m4 = sin(p.x * 4.1 - p.y * 1.5 + t  * 0.53) * 0.5 + 0.5;
  float m5 = sin(p.y * 3.7 + p.x * 0.9 - t2 * 0.81) * 0.5 + 0.5;

  vec3 iridescent  = colorA * m1 + colorB * m2 + colorC * m3
                   + colorD * m4 + colorE * m5;
  iridescent /= (m1 + m2 + m3 + m4 + m5);

  vec3 gray = vec3(dot(iridescent, vec3(0.299, 0.587, 0.114)));
  iridescent = mix(gray, iridescent, 1.8);

  float brightness = smoothstep(0.0, 0.6, field);

  // Edge-only band — waves concentrate at the pill boundary, black in center
  float distToEdge = smoothstep(0.0, 0.18, abs(sdf + 0.05));
  float edgeBand = mix(brightness, 0.0, distToEdge * uHold);
  float edgeBrightness = edgeBand + edgeGlow * 1.2;

  vec3 wavePill = iridescent * edgeBrightness;
  vec3 col = wavePill * pillMask;
  col = clamp(col, 0.0, 1.0);

  //------------------------------------------------------------
  // Halftone
  //------------------------------------------------------------

  float angle    = 0.45;
  float scale    = 12.0;
  float radius   = 0.5;
  float softness = 0.723;

  float ca = cos(angle);
  float sa = sin(angle);
  vec2 g   = gl_FragCoord.xy;
  g = vec2(g.x * ca - g.y * sa, g.x * sa + g.y * ca) / scale;
  vec2 cell = fract(g) - 0.5;
  float dist = length(cell);
  float dot  = smoothstep(radius, radius - softness, dist);

  // Edge mask follows the pill boundary on hold, global edge otherwise
  float edgeMask = mix(
    smoothstep(0.0, 0.2, field) * (1.0 - smoothstep(0.25, 0.5, field)),
    smoothstep(0.0, 0.06, abs(sdf)) * pillMask,
    uHold
  );

  vec3 blend = vec3(mix(0.1, 0.9, dot));
  col = mix(col, softLight(col, blend), edgeMask);

  gl_FragColor = vec4(col, 1.0);
}
  `,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    let width = 1;
    let height = 1;
    let resizeFrame = 0;

    const applySize = () => {
      const rect = root.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      renderer.setSize(width, height, false);
      uniforms.uResolution.value.set(width * dpr, height * dpr);
      uniforms.uCanvasSize.value.set(width, height);
    };

    // Hold interaction
    let holdTween = null;

    const onPointerDown = (e) => {
      console.log("down", uniforms.uHold.value);
      const rect = root.getBoundingClientRect();
      uniforms.uMouse.value.set(
        (e.clientX - rect.left) / rect.width,
        1 - (e.clientY - rect.top) / rect.height,
      );
      holdTween?.kill();
      holdTween = gsap.to(uniforms.uHold, {
        value: 1,
        duration: 0.8,
        ease: interactionEase,
      });
    };

    const onPointerUp = () => {
      holdTween?.kill();
      holdTween = gsap.to(uniforms.uHold, {
        value: 0,
        duration: 0.6,
        ease: interactionEase,
      });
    };

    root.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);

    const onResize = () => {
      if (resizeFrame) cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(applySize);
    };

    applySize();

    let frame = 0;
    let last = performance.now();
    let running = false;

    const renderFrame = (now) => {
      const delta = (now - last) / 1000;
      last = now;
      uniforms.uTime.value += delta;
      renderer.render(scene, camera);
      frame = requestAnimationFrame(renderFrame);
    };

    const start = () => {
      if (running || prefersReducedMotion) return;
      running = true;
      last = performance.now();
      frame = requestAnimationFrame(renderFrame);
    };

    const stop = () => {
      if (!running) return;
      running = false;
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };

    // Animate only while in/near the viewport; static single frame otherwise.
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting) start();
        else stop();
      },
      { rootMargin: "20% 0px 20% 0px" },
    );
    observer.observe(root);

    // Reduced-motion users get exactly one rendered frame.
    if (prefersReducedMotion) {
      uniforms.uTime.value = 12.0;
      renderer.render(scene, camera);
    }

    window.addEventListener("resize", onResize);

    return () => {
      stop();
      observer.disconnect();
      window.removeEventListener("resize", onResize);
      root.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      holdTween?.kill();
      if (resizeFrame) cancelAnimationFrame(resizeFrame);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  const Tag = as || (decorative ? "div" : "section");

  return (
    <Tag
      ref={rootRef}
      className={`${styles.root} ${className}`.trim()}
      data-navbar-theme={navbarTheme}
      {...(decorative ? { "aria-hidden": "true" } : {})}
    >
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
    </Tag>
  );
}
