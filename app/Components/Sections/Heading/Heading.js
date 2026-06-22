"use client";

import { useEffect, useRef } from "react";
import styles from "./heading.module.css";
import { gsap, interactionEase } from "../../../lib/animation";
import * as THREE from "three";

export default function Heading() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cleanup;
    let cancelled = false;

    async function loadSaansBold() {
      const fontDescriptor = '700 16px "Saans"';
      const sampleText = "MADEBY©SANG";

      await document.fonts.load(fontDescriptor, sampleText);
      await document.fonts.ready;

      if (document.fonts.check(fontDescriptor, sampleText)) return true;

      const font = new FontFace(
        "Saans",
        'url("/fonts/Saans-TRIAL-Bold.woff2") format("woff2")',
        {
          style: "normal",
          weight: "700",
        },
      );

      const loadedFont = await font.load();
      if (cancelled) return false;

      document.fonts.add(loadedFont);
      await document.fonts.load(fontDescriptor, sampleText);

      return document.fonts.check(fontDescriptor, sampleText);
    }

    async function init() {
      // ─── Load font ───────────────────────────────────────────────────────────
      const isFontReady = await loadSaansBold();
      if (cancelled || !isFontReady) return;

      // ─── Helpers ─────────────────────────────────────────────────────────────
      function getSize() {
        const rect = canvas.getBoundingClientRect();

        return {
          w: Math.max(1, Math.round(rect.width || window.innerWidth)),
          h: Math.max(1, Math.round(rect.height || window.innerHeight)),
        };
      }

      function buildTexture(w, h) {
        const dpr = window.devicePixelRatio || 1;
        const off = document.createElement("canvas");
        const padPx = 20 * dpr;
        const text = "MADEBY©SANG";
        off.width = w * dpr;
        off.height = h * dpr;
        const ctx = off.getContext("2d");

        ctx.fillStyle = "#fafafa";
        ctx.fillRect(0, 0, off.width, off.height);

        const maxW = off.width - padPx * 2;
        const maxH = off.height - padPx * 2;
        let minSize = 10;
        let maxSize = off.height;
        let fontSize = minSize;

        for (let i = 0; i < 24; i++) {
          const nextSize = Math.floor((minSize + maxSize) / 2);
          ctx.font = `700 ${nextSize}px Saans`;
          const metrics = ctx.measureText(text);
          const textH =
            metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

          if (metrics.width <= maxW && textH <= maxH) {
            fontSize = nextSize;
            minSize = nextSize + 1;
          } else {
            maxSize = nextSize - 1;
          }
        }

        ctx.font = `700 ${fontSize}px Saans`;
        while (ctx.measureText(text).width > maxW && fontSize > 10) {
          fontSize -= 1;
          ctx.font = `700 ${fontSize}px Saans`;
        }

        ctx.fillStyle = "#111111";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, off.width / 2, off.height / 2);

        return off;
      }

      function sizePlaneToViewport(
        mesh,
        camera,
        viewportWidth,
        viewportHeight,
      ) {
        const distance = camera.position.z;
        const visibleHeight =
          2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * distance;
        const visibleWidth = visibleHeight * (viewportWidth / viewportHeight);

        mesh.scale.set(visibleWidth / 2, visibleHeight / 2, 1);
      }

      // ─── Shaders ─────────────────────────────────────────────────────────────
      const vertexShader = /* glsl */ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `;

      const fragmentShader = /* glsl */ `
        varying vec2 vUv;
        uniform sampler2D u_texture;
        uniform vec2 u_mouse;
        uniform vec2 u_prevMouse;
        uniform float u_aberrationIntensity;
        uniform float u_reveal;

        float random(vec2 position) {
          return fract(sin(dot(position, vec2(12.9898, 78.233))) * 43758.5453);
        }

        void main() {
          vec2 interactionGrid = vec2(30.0, 30.0);
          vec2 gridUV = floor(vUv * interactionGrid) / interactionGrid;
          vec2 centerOfPixel = gridUV + (0.5 / interactionGrid);

          vec2 mouseDirection = u_mouse - u_prevMouse;

          vec2 pixelToMouseDirection = centerOfPixel - u_mouse;
          float pixelDistanceToMouse = length(pixelToMouseDirection);
          float strength = smoothstep(0.2, 0.0, pixelDistanceToMouse);

          vec2 uvOffset = strength * -mouseDirection * 0.3;
          vec2 revealGrid = vec2(56.0, 22.0);
          vec2 revealCell = floor(vUv * revealGrid);
          vec2 pixelUV = (revealCell + 0.5) / revealGrid;
          float cellNoise = random(revealCell);
          float sweep = (vUv.x + (1.0 - vUv.y)) * 0.15;
          float cellReveal = smoothstep(
            -0.04,
            0.08,
            u_reveal * 1.45 - cellNoise * 0.72 - sweep
          );
          float resolvePixels = smoothstep(0.55, 1.0, u_reveal);
          vec2 sampledUV = mix(pixelUV, vUv, resolvePixels);
          vec2 uv = sampledUV - uvOffset;

          vec4 colorR = texture2D(u_texture, uv + vec2(strength * u_aberrationIntensity * 0.008, 0.0));
          vec4 colorG = texture2D(u_texture, uv);
          vec4 colorB = texture2D(u_texture, uv - vec2(strength * u_aberrationIntensity * 0.008, 0.0));
          vec3 color = vec3(colorR.r, colorG.g, colorB.b);
          vec3 background = vec3(250.0 / 255.0);

          gl_FragColor = vec4(mix(background, color, cellReveal), 1.0);
        }
      `;

      // ─── Scene setup ─────────────────────────────────────────────────────────
      let { w, h } = getSize();

      const texture = new THREE.CanvasTexture(buildTexture(w, h));
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(80, w / h, 0.01, 10);
      camera.position.z = 1;

      const shaderUniforms = {
        u_mouse: { value: new THREE.Vector2() },
        u_prevMouse: { value: new THREE.Vector2() },
        u_aberrationIntensity: { value: 0.0 },
        u_reveal: { value: 0.0 },
        u_texture: { value: texture },
      };

      const planeMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(2, 2),
        new THREE.ShaderMaterial({
          uniforms: shaderUniforms,
          vertexShader,
          fragmentShader,
        }),
      );
      scene.add(planeMesh);
      sizePlaneToViewport(planeMesh, camera, w, h);

      // Pass canvas directly — no size args so Three.js won't override CSS
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
      renderer.setPixelRatio(window.devicePixelRatio || 1);
      renderer.setSize(w, h, false); // false = don't override CSS width/height

      // ─── GSAP entrance ───────────────────────────────────────────────────────
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      const gsapContext = gsap.context(() => {
        if (prefersReducedMotion) {
          shaderUniforms.u_reveal.value = 1;
          return;
        }

        gsap.to(shaderUniforms.u_reveal, {
          value: 1,
          duration: 1.65,
          delay: 0.15,
          ease: interactionEase,
        });
      }, canvas);

      // ─── State ───────────────────────────────────────────────────────────────
      let easeFactor = 0.02;
      let mousePosition = { x: 0.5, y: 0.5 };
      let targetMousePosition = { x: 0.5, y: 0.5 };
      let prevPosition = { x: 0.5, y: 0.5 };
      let aberrationIntensity = 0.0;
      let animFrameId;

      // ─── Render loop ─────────────────────────────────────────────────────────
      function animate() {
        animFrameId = requestAnimationFrame(animate);

        mousePosition.x +=
          (targetMousePosition.x - mousePosition.x) * easeFactor;
        mousePosition.y +=
          (targetMousePosition.y - mousePosition.y) * easeFactor;

        shaderUniforms.u_mouse.value.set(
          mousePosition.x,
          1.0 - mousePosition.y,
        );
        shaderUniforms.u_prevMouse.value.set(
          prevPosition.x,
          1.0 - prevPosition.y,
        );

        aberrationIntensity = Math.max(0.0, aberrationIntensity - 0.04);
        shaderUniforms.u_aberrationIntensity.value = aberrationIntensity;

        renderer.render(scene, camera);
      }
      animate();

      // ─── Resize ──────────────────────────────────────────────────────────────
      function onResize() {
        const s = getSize();
        w = s.w;
        h = s.h;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        sizePlaneToViewport(planeMesh, camera, w, h);
        renderer.setSize(w, h, false);
        const newTex = new THREE.CanvasTexture(buildTexture(w, h));
        shaderUniforms.u_texture.value.dispose();
        shaderUniforms.u_texture.value = newTex;
      }
      window.addEventListener("resize", onResize);

      // ─── Mouse events ────────────────────────────────────────────────────────
      function onMouseMove(e) {
        easeFactor = 0.02;
        const rect = canvas.getBoundingClientRect();
        prevPosition = { ...targetMousePosition };
        targetMousePosition.x = (e.clientX - rect.left) / rect.width;
        targetMousePosition.y = (e.clientY - rect.top) / rect.height;
        aberrationIntensity = 1;
      }

      function onMouseEnter(e) {
        easeFactor = 0.02;
        const rect = canvas.getBoundingClientRect();
        mousePosition.x = targetMousePosition.x =
          (e.clientX - rect.left) / rect.width;
        mousePosition.y = targetMousePosition.y =
          (e.clientY - rect.top) / rect.height;
      }

      function onMouseLeave() {
        easeFactor = 0.05;
        targetMousePosition = { ...prevPosition };
      }

      canvas.addEventListener("mousemove", onMouseMove);
      canvas.addEventListener("mouseenter", onMouseEnter);
      canvas.addEventListener("mouseleave", onMouseLeave);

      // ─── Cleanup ─────────────────────────────────────────────────────────────
      cleanup = () => {
        cancelAnimationFrame(animFrameId);
        window.removeEventListener("resize", onResize);
        canvas.removeEventListener("mousemove", onMouseMove);
        canvas.removeEventListener("mouseenter", onMouseEnter);
        canvas.removeEventListener("mouseleave", onMouseLeave);
        gsapContext.revert();
        renderer.dispose();
        shaderUniforms.u_texture.value.dispose();
      };
    }

    init().catch((error) => {
      if (!cancelled) {
        console.error("Unable to initialize Heading:", error);
      }
    });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.canvas} />;
}
