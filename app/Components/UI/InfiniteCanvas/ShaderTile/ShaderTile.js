"use client";

import { useEffect, useRef } from "react";

// ── Vertex shader ──────────────────────────────────────────────────────────────
const VERT = `#version 300 es
precision highp float;

in vec2 aPosition;
in vec2 aUv;

uniform float uVelocityX;
uniform float uVelocityY;
uniform vec2  uQuadSize;
uniform vec2  uTextureSize;

out vec2 vUv;
out vec2 vUvCover;

const float PI = 3.141592653589793;

vec2 getCoverUv(vec2 uv, vec2 texSize, vec2 quadSize) {
  vec2 ratio = vec2(
    min((quadSize.x / quadSize.y) / (texSize.x / texSize.y), 1.0),
    min((quadSize.y / quadSize.x) / (texSize.y / texSize.x), 1.0)
  );
  return vec2(
    uv.x * ratio.x + (1.0 - ratio.x) * 0.5,
    uv.y * ratio.y + (1.0 - ratio.y) * 0.5
  );
}

void main() {
  vUv      = aUv;
  vUvCover = getCoverUv(aUv, uTextureSize, uQuadSize);

  vec3 pos = vec3(aPosition, 0.0);

  // Vertical drag → bow arc along X axis
  float velY = min(abs(uVelocityY), 5.0) * sign(uVelocityY);
  pos.y -= sin(aUv.x * PI) * velY * -0.01;

  // Horizontal drag → bow arc along Y axis
  float velX = min(abs(uVelocityX), 5.0) * sign(uVelocityX);
  pos.x -= sin(aUv.y * PI) * velX * -0.01;

  gl_Position = vec4(pos, 1.0);
}`;

// ── Fragment shader ────────────────────────────────────────────────────────────
const FRAG = `#version 300 es
precision highp float;

uniform sampler2D uTexture;
uniform float     uVelocityX;
uniform float     uVelocityY;
uniform float     uMouseEnter;
uniform vec2      uMouseOverPos;
uniform vec2      uQuadSize;

in vec2 vUv;
in vec2 vUvCover;

out vec4 outColor;

vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }

float snoise(vec2 v) {
  const vec4 C = vec4(
     0.211324865405187,
     0.366025403784439,
    -0.577350269189626,
     0.024390243902439
  );
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1  = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy  -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(
    permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0)
  );
  vec3 m = max(
    0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)),
    0.0
  );
  m = m * m * m * m;
  vec3 x  = 2.0 * fract(p * C.www) - 1.0;
  vec3 h  = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x  = a0.x  * x0.x   + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
  vec2 texCoords = vUvCover;

  float aspectRatio = uQuadSize.y / uQuadSize.x;

  // Circle mask that follows cursor over the card
  float circle = 1.0 - distance(
    vec2(uMouseOverPos.x, (1.0 - uMouseOverPos.y) * aspectRatio),
    vec2(vUv.x,           vUv.y * aspectRatio)
  ) * 15.0;

  float noise = snoise(gl_FragCoord.xy);

  // Combined speed from both axes
  float speed   = length(vec2(uVelocityX, uVelocityY));
  float blend   = uMouseEnter + speed * 0.1;

  // Smear grain in the actual direction of drag
  vec2 dragDir = speed > 0.001
    ? normalize(vec2(uVelocityX, uVelocityY))
    : vec2(0.0);

  texCoords += mix(vec2(0.0), dragDir * circle * noise * 0.01, blend);

  outColor = vec4(texture(uTexture, texCoords).rgb, 1.0);
}`;

// ── WebGL helpers ──────────────────────────────────────────────────────────────
function compileShader(gl, type, src) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader));
  }
  return shader;
}

function buildProgram(gl) {
  const prog = gl.createProgram();
  gl.attachShader(prog, compileShader(gl, gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compileShader(gl, gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(prog));
  }
  return prog;
}

function loadTexture(gl, img) {
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return tex;
}

// Full-screen quad — two triangles covering clip space
const POSITIONS = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
const UVS = new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]);

// ── ShaderTile component ───────────────────────────────────────────────────────
export default function ShaderTile({ src, alt = "", tileSize, velocityRef }) {
  const canvasRef = useRef(null);
  const glRef = useRef(null);
  const rafRef = useRef(null);
  const mouseRef = useRef({ enter: 0, targetEnter: 0, x: 0.5, y: 0.5 });
  const uniformsRef = useRef({});
  const readyRef = useRef(false); // true once texture is loaded

  // ── Init WebGL once per src ────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2", { alpha: false });
    if (!gl) return;
    glRef.current = gl;

    let cancelled = false;

    // Build shader program
    const prog = buildProgram(gl);
    gl.useProgram(prog);

    // Position buffer
    const posLoc = gl.getAttribLocation(prog, "aPosition");
    const posBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.bufferData(gl.ARRAY_BUFFER, POSITIONS, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    // UV buffer
    const uvLoc = gl.getAttribLocation(prog, "aUv");
    const uvBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf);
    gl.bufferData(gl.ARRAY_BUFFER, UVS, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(uvLoc);
    gl.vertexAttribPointer(uvLoc, 2, gl.FLOAT, false, 0, 0);

    // Cache uniform locations
    const u = {
      uVelocityX: gl.getUniformLocation(prog, "uVelocityX"),
      uVelocityY: gl.getUniformLocation(prog, "uVelocityY"),
      uMouseEnter: gl.getUniformLocation(prog, "uMouseEnter"),
      uMouseOverPos: gl.getUniformLocation(prog, "uMouseOverPos"),
      uQuadSize: gl.getUniformLocation(prog, "uQuadSize"),
      uTextureSize: gl.getUniformLocation(prog, "uTextureSize"),
      uTexture: gl.getUniformLocation(prog, "uTexture"),
    };
    uniformsRef.current = u;

    // Load image as texture
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => {
      if (cancelled) return;
      const tex = loadTexture(gl, img);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.uniform1i(u.uTexture, 0);
      gl.uniform2f(u.uTextureSize, img.naturalWidth, img.naturalHeight);
      readyRef.current = true;
    };

    // Render loop
    function frame() {
      if (cancelled) return;

      if (readyRef.current) {
        const m = mouseRef.current;
        // Smooth hover interpolation
        m.enter += (m.targetEnter - m.enter) * 0.08;

        const rawX = velocityRef?.current?.x ?? 0;
        const rawY = velocityRef?.current?.y ?? 0;
        const velX = Math.sign(rawX) * Math.min(Math.abs(rawX), 5);
        const velY = Math.sign(rawY) * Math.min(Math.abs(rawY), 5);

        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.uniform1f(u.uVelocityX, velX);
        gl.uniform1f(u.uVelocityY, velY);
        gl.uniform1f(u.uMouseEnter, m.enter);
        gl.uniform2f(u.uMouseOverPos, m.x, m.y);
        gl.uniform2f(u.uQuadSize, canvas.width, canvas.height);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }

      rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);

    return () => {
      cancelled = true;
      readyRef.current = false;
      cancelAnimationFrame(rafRef.current);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [src, velocityRef]);

  // ── Sync canvas resolution when tileSize changes ───────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = tileSize;
    canvas.height = tileSize;
  }, [tileSize]);

  // ── Pointer handlers ───────────────────────────────────────────────────────
  const handleMouseEnter = () => {
    mouseRef.current.targetEnter = 1;
  };
  const handleMouseLeave = () => {
    mouseRef.current.targetEnter = 0;
  };
  const handleMouseMove = (e) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseRef.current.x = (e.clientX - rect.left) / rect.width;
    mouseRef.current.y = (e.clientY - rect.top) / rect.height;
  };

  return (
    <canvas
      ref={canvasRef}
      width={tileSize}
      height={tileSize}
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        objectFit: "cover",
      }}
      aria-label={alt}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    />
  );
}
