"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { gsap } from "../../../lib/animation";
import styles from "./signalLandscape.module.css";

const maxRenderPixelRatio = 1.35;
const columns = 190;
const rows = 72;

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform vec2 uResolution;
  uniform float uReducedMotion;
  uniform float uReveal;

  attribute float aSeed;

  varying float vStrength;
  varying float vDepth;
  varying float vSeed;
  varying float vIgnite;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);

    float a = hash(i + vec2(0.0, 0.0));
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));

    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  void main() {
    vec3 pos = position;
    vec2 uv = vec2((position.x + 1.0) * 0.5, (position.y + 1.0) * 0.5);
    float time = mix(uTime, 0.0, uReducedMotion);

    float slowTerrain = noise(vec2(uv.x * 4.2 + time * 0.035, 0.8));
    float midTerrain = noise(vec2(uv.x * 9.0 - time * 0.055, 3.4));
    float highTerrain = noise(vec2(uv.x * 17.0 + time * 0.075, 7.0));
    float terrain = slowTerrain * 0.5 + midTerrain * 0.35 + highTerrain * 0.15;
    float skyline = 0.22 + terrain * 0.46;

    float normalizedHeight = smoothstep(skyline + 0.04, skyline - 0.18, uv.y);
    float baseFade = smoothstep(0.02, 0.4, 1.0 - uv.y);
    float topFade = 1.0 - smoothstep(0.72, 0.98, uv.y);
    float sparkle = noise(vec2(uv.x * 80.0 + time * 0.6, uv.y * 38.0 - time * 0.2));
    float revealProgress = mix(clamp(uReveal, 0.0, 1.0), 1.0, uReducedMotion);
    float flameNoise = (noise(vec2(uv.x * 11.0 + time * 0.18, 15.0)) * 2.0 - 1.0) * 0.09;
    float flameLick = pow(noise(vec2(uv.x * 29.0 - time * 0.28, revealProgress * 3.2)), 2.0) * 0.07;
    float flameEdge = revealProgress * 1.16 - 0.08 + flameNoise + flameLick;
    float revealMask = smoothstep(uv.y - 0.08, uv.y + 0.1, flameEdge);

    vStrength = normalizedHeight * baseFade * topFade * mix(0.78, 1.22, sparkle) * revealMask;
    vDepth = 1.0 - uv.y;
    vSeed = aSeed;
    vIgnite = revealMask * (1.0 - smoothstep(0.0, 0.16, abs(flameEdge - uv.y)));

    float aspect = uResolution.x / max(uResolution.y, 1.0);
    float pointScale = mix(5.0, 11.0, vStrength) * min(aspect, 1.9);
    pointScale *= mix(0.68, 1.0, revealMask) + vIgnite * 0.42;

    gl_Position = vec4(pos, 1.0);
    gl_PointSize = pointScale;
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;

  varying float vStrength;
  varying float vDepth;
  varying float vSeed;
  varying float vIgnite;

  void main() {
    vec2 point = gl_PointCoord - vec2(0.5);
    float distanceFromCenter = length(point);
    float circle = smoothstep(0.5, 0.34, distanceFromCenter);

    if (circle <= 0.01 || vStrength <= 0.015) {
      discard;
    }

    vec3 deepGreen = vec3(0.0, 0.58, 0.07);
    vec3 electricGreen = vec3(0.18, 1.0, 0.04);
    vec3 acidYellow = vec3(0.86, 1.0, 0.05);
    vec3 amber = vec3(1.0, 0.55, 0.0);

    vec3 color = mix(deepGreen, electricGreen, smoothstep(0.18, 0.72, vStrength));
    color = mix(color, acidYellow, smoothstep(0.52, 1.0, vDepth) * 0.5);
    color = mix(color, amber, smoothstep(0.55, 0.98, vSeed) * smoothstep(0.35, 0.9, vStrength) * 0.22);
    color = mix(color, acidYellow, vIgnite * 0.5);
    color = mix(color, amber, vIgnite * 0.28);

    float glow = smoothstep(0.5, 0.0, distanceFromCenter) * 0.55;
    float alpha = circle * min(vStrength + vIgnite * 0.45, 1.0);

    gl_FragColor = vec4(color + glow * color, alpha);
  }
`;

function getRenderPixelRatio() {
  return Math.min(window.devicePixelRatio || 1, maxRenderPixelRatio);
}

function createGeometry() {
  const total = columns * rows;
  const positions = new Float32Array(total * 3);
  const seeds = new Float32Array(total);
  let index = 0;

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const x = columns === 1 ? 0 : (column / (columns - 1)) * 2 - 1;
      const y = rows === 1 ? 0 : (row / (rows - 1)) * 2 - 1;
      const seed = Math.sin((row + 1) * 37.21 + (column + 1) * 17.17);

      positions[index * 3] = x;
      positions[index * 3 + 1] = y;
      positions[index * 3 + 2] = 0;
      seeds[index] = seed - Math.floor(seed);
      index += 1;
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));

  return geometry;
}

export default function SignalLandscape({
  as: Component = "section",
  className = "",
  decorative = false,
  navbarTheme = "inverse",
}) {
  const sectionRef = useRef(null);
  const visualRef = useRef(null);
  const overlayRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const visual = visualRef.current;
    const overlay = overlayRef.current;
    const canvas = canvasRef.current;
    if (!section || !visual || !overlay || !canvas) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let isVisible = false;
    let frameId;
    let resizeFrameId;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    });
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const uniforms = {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uReducedMotion: { value: reduceMotion ? 1 : 0 },
      uReveal: { value: reduceMotion ? 1 : 0 },
    };
    const geometry = createGeometry();
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    });
    const points = new THREE.Points(geometry, material);
    scene.add(points);

    function resize() {
      const rect = section.getBoundingClientRect();
      const width = Math.max(1, Math.round(rect.width));
      const height = Math.max(1, Math.round(rect.height));

      renderer.setPixelRatio(getRenderPixelRatio());
      renderer.setSize(width, height, false);
      uniforms.uResolution.value.set(width, height);
      renderer.render(scene, camera);
    }

    function requestResize() {
      cancelAnimationFrame(resizeFrameId);
      resizeFrameId = requestAnimationFrame(resize);
    }

    function render(time = 0) {
      uniforms.uTime.value = time * 0.001;
      renderer.render(scene, camera);

      if (isVisible && !reduceMotion) {
        frameId = requestAnimationFrame(render);
      }
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        cancelAnimationFrame(frameId);

        if (isVisible && !reduceMotion) {
          frameId = requestAnimationFrame(render);
        } else {
          render();
        }
      },
      { rootMargin: "20% 0px" },
    );

    resize();
    render();
    observer.observe(section);
    window.addEventListener("resize", requestResize);

    const context = gsap.context(() => {
      gsap.set(visual, {
        scale: reduceMotion ? 1 : 1.2,
        transformOrigin: "50% 50%",
      });
      gsap.set(overlay, {
        opacity: reduceMotion ? 0 : 0.5,
      });
      gsap.set(uniforms.uReveal, {
        value: reduceMotion ? 1 : 0,
      });

      if (reduceMotion) return;

      gsap
        .timeline({
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "top top",
            scrub: true,
            invalidateOnRefresh: true,
          },
        })
        .to(
          uniforms.uReveal,
          {
            value: 1,
            ease: "none",
          },
          0,
        )
        .to(
          visual,
          {
            scale: 1,
            ease: "none",
          },
          0,
        )
        .to(
          overlay,
          {
            opacity: 0,
            ease: "none",
          },
          0,
        );
    }, section);

    return () => {
      context.revert();
      cancelAnimationFrame(frameId);
      cancelAnimationFrame(resizeFrameId);
      window.removeEventListener("resize", requestResize);
      observer.disconnect();
      scene.remove(points);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <Component
      ref={sectionRef}
      className={`${styles.signalLandscape} ${className}`}
      data-navbar-theme={navbarTheme || undefined}
      aria-label={decorative ? undefined : "Signal landscape"}
      aria-hidden={decorative ? "true" : undefined}
    >
      <div ref={visualRef} className={styles.visual} aria-hidden="true">
        <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
      </div>
      <div ref={overlayRef} className={styles.revealOverlay} aria-hidden="true" />
    </Component>
  );
}
