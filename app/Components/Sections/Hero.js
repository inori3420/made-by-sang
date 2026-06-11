"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function Hero() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cleanup;

    async function init() {
      // ─── Load font ───────────────────────────────────────────────────────────
      const font = new FontFace("Saans", "url(/fonts/Saans-TRIAL-Bold.woff2)");
      await font.load();
      document.fonts.add(font);

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
          ctx.font = `900 ${nextSize}px Saans`;
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

        ctx.font = `900 ${fontSize}px Saans`;
        while (ctx.measureText(text).width > maxW && fontSize > 10) {
          fontSize -= 1;
          ctx.font = `900 ${fontSize}px Saans`;
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

        void main() {
          vec2 gridUV = floor(vUv * vec2(30.0, 30.0)) / vec2(30.0, 30.0);
          vec2 centerOfPixel = gridUV + vec2(1.0/30.0, 1.0/30.0);

          vec2 mouseDirection = u_mouse - u_prevMouse;

          vec2 pixelToMouseDirection = centerOfPixel - u_mouse;
          float pixelDistanceToMouse = length(pixelToMouseDirection);
          float strength = smoothstep(0.2, 0.0, pixelDistanceToMouse);

          vec2 uvOffset = strength * -mouseDirection * 0.3;
          vec2 uv = vUv - uvOffset;

          vec4 colorR = texture2D(u_texture, uv + vec2(strength * u_aberrationIntensity * 0.008, 0.0));
          vec4 colorG = texture2D(u_texture, uv);
          vec4 colorB = texture2D(u_texture, uv - vec2(strength * u_aberrationIntensity * 0.008, 0.0));

          gl_FragColor = vec4(colorR.r, colorG.g, colorB.b, 1.0);
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
        renderer.dispose();
        shaderUniforms.u_texture.value.dispose();
      };
    }

    init();

    return () => cleanup?.();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100dvh",
        display: "block",
        background: "#fafafa",
      }}
    />
  );
}
