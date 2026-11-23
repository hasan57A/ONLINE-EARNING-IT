import React, { useEffect, useRef } from 'react';

type LonLat = [number, number];

// Geographic continental & major island polygons ([lon, lat]) for seamless 360° Earth rotation
const CONTINENT_POLYGONS: LonLat[][] = [
  // North America & Central America
  [
    [-168, 66], [-162, 71], [-140, 70], [-125, 71], [-105, 72], [-85, 70],
    [-78, 63], [-64, 60], [-55, 52], [-66, 45], [-74, 40], [-81, 31],
    [-80, 25], [-83, 29], [-90, 29], [-97, 26], [-96, 19], [-88, 21],
    [-84, 15], [-83, 9], [-78, 8], [-82, 8], [-86, 11], [-92, 14],
    [-105, 19], [-110, 24], [-114, 31], [-118, 34], [-124, 41], [-125, 49],
    [-136, 58], [-150, 60], [-162, 55], [-166, 61],
  ],
  // Caribbean / Cuba
  [[-85, 22], [-79, 23], [-74, 20], [-77, 19.8], [-83, 21.5]],
  // Greenland
  [
    [-52, 60], [-42, 60], [-32, 68], [-20, 74], [-18, 81], [-35, 83],
    [-58, 81], [-70, 77], [-60, 72], [-53, 66],
  ],
  // Iceland
  [[-24, 65], [-14, 66], [-15, 64], [-22, 63.8]],
  // South America
  [
    [-78, 9], [-72, 12], [-62, 10], [-50, 1], [-35, -6], [-38, -14],
    [-41, -22], [-48, -28], [-53, -34], [-62, -40], [-66, -47], [-68, -54],
    [-74, -53], [-74, -44], [-71, -33], [-70, -19], [-77, -12], [-81, -5],
    [-79, 2],
  ],
  // UK & Ireland
  [[-6, 50], [1, 51], [0, 56], [-4, 59], [-7, 57], [-10, 54], [-9, 51]],
  // Europe & Scandinavia
  [
    [-9, 37], [-9, 43], [-2, 43], [-4, 48], [2, 51], [8, 54], [9, 58],
    [5, 61], [14, 68], [26, 71], [32, 69], [42, 67], [58, 69], [60, 56],
    [48, 46], [38, 45], [29, 41], [26, 39], [22, 37], [18, 40], [16, 38],
    [12, 42], [9, 44], [3, 43], [0, 39], [-5, 36],
  ],
  // Africa
  [
    [-6, 35], [10, 37], [15, 32], [25, 31], [33, 31], [39, 21], [43, 12],
    [51, 12], [47, 4], [41, -2], [40, -11], [35, -24], [28, -33], [18, -35],
    [14, -23], [12, -12], [9, 4], [2, 6], [-8, 5], [-17, 15], [-16, 23],
    [-10, 31],
  ],
  // Madagascar
  [[44, -25], [47, -25], [50, -13], [48, -12], [44, -18]],
  // Asia & Middle East
  [
    [27, 41], [36, 36], [35, 31], [40, 22], [44, 13], [59, 22], [56, 26],
    [50, 29], [58, 25], [68, 23], [73, 19], [77, 8], [81, 16], [88, 22],
    [92, 21], [97, 16], [100, 12], [104, 2], [103, 10], [109, 13], [107, 21],
    [115, 22], [121, 25], [122, 31], [119, 36], [122, 39], [126, 38],
    [129, 35], [130, 42], [138, 46], [142, 54], [155, 59], [163, 56],
    [172, 62], [178, 66], [165, 69], [135, 72], [105, 76], [80, 73],
    [62, 69], [59, 55], [48, 45], [38, 42],
  ],
  // Sri Lanka
  [[79.8, 9.6], [81.8, 7.6], [80.8, 6.0], [79.6, 7.2]],
  // Japan
  [[130, 31], [136, 34], [141, 38], [145, 44], [140, 42], [135, 36], [131, 34]],
  // Sumatra / Borneo / Java / Philippines / New Guinea
  [[95, 5], [104, -1], [106, -6], [102, -5], [97, 1]],
  [[109, 2], [118, 6], [117, -3], [110, -3]],
  [[106, -6], [114, -8], [114, -9], [106, -7]],
  [[121, 14], [124, 18], [126, 7], [122, 7], [120, 14]],
  [[132, -2], [141, -3], [150, -10], [143, -9], [135, -5]],
  // Australia
  [
    [114, -22], [122, -17], [131, -12], [136, -12], [138, -16], [142, -11],
    [146, -18], [153, -27], [150, -37], [144, -38], [136, -35], [129, -32],
    [121, -34], [115, -34], [114, -28],
  ],
  // New Zealand
  [[167, -46], [174, -41], [178, -37], [173, -35], [171, -42], [166, -45]],
  // Antarctica
  [
    [-180, -72], [-120, -74], [-62, -64], [-40, -76], [0, -70], [60, -68],
    [120, -67], [170, -72], [180, -72], [180, -90], [-180, -90],
  ],
];

interface SphereDot {
  ux: number;
  uy: number;
  uz: number;
  tone: number;
  phase: number;
  twinkleAmp: number;
}

interface LogoSquare {
  type: 'gold' | 'blue';
  x: number;
  y: number;
  size: number;
  front?: boolean;
}

// Exact positions & sizes extracted from the original attached logo (352x183 reference frame)
const LEFT_SQUARES: LogoSquare[] = [
  { type: 'gold', x: 91, y: 59, size: 4 },
  { type: 'gold', x: 73, y: 66, size: 6.5 },
  { type: 'blue', x: 103, y: 66, size: 5 },
  { type: 'blue', x: 85, y: 72, size: 11.5 },
  { type: 'blue', x: 102, y: 79, size: 3 },
  { type: 'gold', x: 63, y: 82, size: 7 },
  { type: 'blue', x: 41, y: 87, size: 10.5 },
  { type: 'gold', x: 93, y: 87, size: 10.5 },
  { type: 'blue', x: 77, y: 91, size: 9.5 },
  { type: 'gold', x: 57, y: 101, size: 16 },
  { type: 'blue', x: 99, y: 105, size: 4 },
  { type: 'blue', x: 80, y: 107, size: 13 },
  { type: 'gold', x: 37, y: 113, size: 11 },
  { type: 'gold', x: 96, y: 115, size: 12 },
  { type: 'gold', x: 112, y: 115, size: 6.5, front: true },
  { type: 'blue', x: 74, y: 123, size: 9.5 },
  { type: 'blue', x: 58, y: 128, size: 8.5 },
  { type: 'blue', x: 107, y: 131, size: 7, front: true },
  { type: 'gold', x: 90, y: 132, size: 6.5 },
  { type: 'gold', x: 81, y: 142, size: 5.5 },
];

const DEG = Math.PI / 180;
const REF_CX = 190.5;
const REF_CY = 99.0;
const REF_R = 81.5;

// Golden Orbit Ring exact ellipse parameters in 352x183 reference space
const ORBIT_CX = 186.0;
const ORBIT_CY = 104.0;
const ORBIT_RX = 108.0;
const ORBIT_RY = 38.0;
const ORBIT_ROT = -22 * DEG;
const COS_ORBIT = Math.cos(ORBIT_ROT);
const SIN_ORBIT = Math.sin(ORBIT_ROT);

// Tight viewport centered around the emblem (no black rectangle, crisp scaling)
const CROP_X = 24;
const CROP_Y = -2;
const CROP_W = 280;
const CROP_H = 198;

const TILT_X = 14 * DEG;
const TILT_Z = -9 * DEG;
const COS_TX = Math.cos(TILT_X);
const SIN_TX = Math.sin(TILT_X);
const COS_TZ = Math.cos(TILT_Z);
const SIN_TZ = Math.sin(TILT_Z);
const START_LON = 28 * DEG;
const ROTATION_PERIOD_MS = 11500;

// Upper-right natural directional light
const LIGHT_RAW_X = 0.54;
const LIGHT_RAW_Y = 0.58;
const LIGHT_RAW_Z = 0.61;
const LIGHT_LEN = Math.hypot(LIGHT_RAW_X, LIGHT_RAW_Y, LIGHT_RAW_Z);
const LX = LIGHT_RAW_X / LIGHT_LEN;
const LY = LIGHT_RAW_Y / LIGHT_LEN;
const LZ = LIGHT_RAW_Z / LIGHT_LEN;

// Exact Blue / Cyan / Electric Blue pixel palette from original logo
const PIXEL_PALETTE: [number, number, number][] = Array.from({ length: 16 }, (_, i) => {
  const t = i / 15;
  if (t < 0.45) {
    const k = t / 0.45;
    return [
      Math.round(8 + k * 28),
      Math.round(86 + k * 66),
      Math.round(182 + k * 48),
    ];
  }
  if (t < 0.82) {
    const k = (t - 0.45) / 0.37;
    return [
      Math.round(36 + k * 46),
      Math.round(152 + k * 54),
      Math.round(230 + k * 18),
    ];
  }
  const k = (t - 0.82) / 0.18;
  return [
    Math.round(82 + k * 108),
    Math.round(206 + k * 44),
    Math.round(248 + k * 7),
  ];
});

let cachedDots: SphereDot[] | null = null;

function getSphereDots(): SphereDot[] {
  if (cachedDots) return cachedDots;

  const w = 512;
  const h = 256;
  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = w;
  maskCanvas.height = h;
  const ctx = maskCanvas.getContext('2d');
  if (!ctx) return [];

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#fff';

  for (const poly of CONTINENT_POLYGONS) {
    ctx.beginPath();
    for (let i = 0; i < poly.length; i++) {
      const [lon, lat] = poly[i];
      const px = ((lon + 180) / 360) * w;
      const py = ((90 - lat) / 180) * h;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }

  const data = ctx.getImageData(0, 0, w, h).data;
  const dots: SphereDot[] = [];

  for (let latDeg = -76; latDeg <= 80; latDeg += 2.4) {
    const latRad = latDeg * DEG;
    const cosLat = Math.cos(latRad);
    const sinLat = Math.sin(latRad);
    const lonStep = 2.5 / Math.max(0.32, cosLat);
    const py = Math.min(h - 1, Math.max(0, Math.round(((90 - latDeg) / 180) * h)));

    for (let lonDeg = -180; lonDeg < 180; lonDeg += lonStep) {
      const px = Math.min(w - 1, Math.max(0, Math.round(((lonDeg + 180) / 360) * w)));
      const idx = (py * w + px) * 4;
      if (data[idx] > 128) {
        const lonRad = lonDeg * DEG;
        const hash = Math.abs(Math.sin(lonDeg * 12.9898 + latDeg * 78.233) * 43758.5453) % 1;
        dots.push({
          ux: cosLat * Math.sin(lonRad),
          uy: sinLat,
          uz: cosLat * Math.cos(lonRad),
          tone: 0.9 + hash * 0.22,
          phase: hash * Math.PI * 2,
          twinkleAmp: hash > 0.68 ? 0.22 : 0.06,
        });
      }
    }
  }

  cachedDots = dots;
  return dots;
}

function orbitPoint(theta: number, rOffset: number, scale: number): [number, number] {
  const rx = ORBIT_RX + rOffset;
  const ry = ORBIT_RY + rOffset * 0.62;
  const ux = rx * Math.cos(theta);
  const vy = ry * Math.sin(theta);
  const px = ORBIT_CX + ux * COS_ORBIT - vy * SIN_ORBIT;
  const py = ORBIT_CY + ux * SIN_ORBIT + vy * COS_ORBIT;
  return [(px - CROP_X) * scale, (py - CROP_Y) * scale];
}

function buildOrbitRibbonPath(
  ctx: CanvasRenderingContext2D,
  startRad: number,
  endRad: number,
  scale: number,
  halfWidthAt: (t: number) => number,
) {
  const steps = 64;
  ctx.beginPath();
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const theta = startRad + (endRad - startRad) * t;
    const hw = halfWidthAt(t);
    const [x, y] = orbitPoint(theta, hw, scale);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  for (let i = steps; i >= 0; i--) {
    const t = i / steps;
    const theta = startRad + (endRad - startRad) * t;
    const hw = halfWidthAt(t);
    const [x, y] = orbitPoint(theta, -hw, scale);
    ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function drawCrispSquare(
  ctx: CanvasRenderingContext2D,
  sq: LogoSquare,
  scale: number,
  elapsedSec: number,
  index: number,
) {
  const phase = index * 0.78 + sq.x * 0.03;
  const floatX = Math.sin(elapsedSec * 1.45 + phase) * 2.1;
  const floatY = Math.cos(elapsedSec * 1.25 + phase * 1.15) * 2.3;
  const breath = 1 + 0.065 * Math.sin(elapsedSec * 1.85 + phase * 0.9);

  const s = sq.size * scale * breath;
  const x = (sq.x - CROP_X + floatX) * scale - (s - sq.size * scale) * 0.5;
  const y = (sq.y - CROP_Y + floatY) * scale - (s - sq.size * scale) * 0.5;
  const rad = Math.min(s * 0.25, Math.max(0.5, s * 0.08));

  const glint = 0.5 + 0.5 * Math.sin(elapsedSec * 2.2 + phase);

  const grad = ctx.createLinearGradient(x, y, x + s, y + s);
  if (sq.type === 'gold') {
    grad.addColorStop(0, glint > 0.65 ? '#fff5b8' : '#ffe885');
    grad.addColorStop(0.38, '#f0b634');
    grad.addColorStop(0.82, '#c87e0a');
    grad.addColorStop(1, '#8c5004');
  } else {
    grad.addColorStop(0, glint > 0.65 ? '#9ee8ff' : '#6bd4ff');
    grad.addColorStop(0.42, '#1e88ff');
    grad.addColorStop(0.85, '#074bc4');
    grad.addColorStop(1, '#042c7a');
  }

  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, s, s, rad);
  } else {
    ctx.rect(x, y, s, s);
  }
  ctx.fillStyle = grad;
  ctx.fill();

  // Razor-sharp inner top-left highlight bevel with subtle sequential glint
  ctx.lineWidth = Math.max(0.6, scale * 0.32);
  ctx.strokeStyle =
    sq.type === 'gold'
      ? `rgba(255, 246, 198, ${(0.45 + glint * 0.4).toFixed(2)})`
      : `rgba(165, 232, 255, ${(0.42 + glint * 0.42).toFixed(2)})`;
  ctx.stroke();
}

function drawGoldenOrbitBackArc(
  ctx: CanvasRenderingContext2D,
  scale: number,
  elapsedSec: number,
) {
  const swayY = Math.sin(elapsedSec * 1.1) * 1.1 * scale;
  // Back segment emerging behind top-right of sphere around theta = -42deg .. +14deg
  ctx.save();
  ctx.translate(0, swayY);
  buildOrbitRibbonPath(
    ctx,
    -42 * DEG,
    14 * DEG,
    scale,
    (t) => 0.65 + Math.sin(t * Math.PI * 0.82) * 1.9,
  );
  const [x0, y0] = orbitPoint(-42 * DEG, 0, scale);
  const [x1, y1] = orbitPoint(14 * DEG, 0, scale);
  const grad = ctx.createLinearGradient(x0, y0, x1, y1);
  grad.addColorStop(0, '#fff3b8');
  grad.addColorStop(0.35, '#eab134');
  grad.addColorStop(1, '#9f5e05');
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.restore();
}

function drawGoldenOrbitFrontArc(
  ctx: CanvasRenderingContext2D,
  scale: number,
  elapsedSec: number,
) {
  const swayY = Math.sin(elapsedSec * 1.1) * 1.1 * scale;

  // 1. Subtle shadow cast on the sphere beneath the front golden ribbon
  ctx.save();
  ctx.beginPath();
  const cx = (REF_CX - CROP_X) * scale;
  const cy = (REF_CY - CROP_Y) * scale;
  const R = REF_R * scale;
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.clip();

  ctx.translate(0, swayY);
  buildOrbitRibbonPath(
    ctx,
    8 * DEG,
    196 * DEG,
    scale,
    (t) => 1.5 + Math.sin(t * Math.PI) * 3.8,
  );
  ctx.fillStyle = 'rgba(2, 6, 20, 0.42)';
  ctx.fill();
  ctx.restore();

  // 2. Crisp 24K Metallic Gold Front Orbit Ribbon with travelling specular sweep
  ctx.save();
  ctx.translate(0, swayY);
  buildOrbitRibbonPath(
    ctx,
    6 * DEG,
    204 * DEG,
    scale,
    (t) => {
      const arch = Math.sin(t * Math.PI);
      return 0.75 + arch * 3.45;
    },
  );

  const [gx0, gy0] = orbitPoint(12 * DEG, 0, scale);
  const [gx1, gy1] = orbitPoint(190 * DEG, 0, scale);
  const shinePos = ((elapsedSec * 0.28) % 1.4) - 0.2;
  const s0 = Math.max(0.05, Math.min(0.95, shinePos - 0.14));
  const s1 = Math.max(0.06, Math.min(0.96, shinePos));
  const s2 = Math.max(0.07, Math.min(0.97, shinePos + 0.14));

  const goldGrad = ctx.createLinearGradient(gx0, gy0, gx1, gy1);
  goldGrad.addColorStop(0, '#a86708');
  if (s0 > 0.08 && s2 < 0.92) {
    goldGrad.addColorStop(s0, '#e39e1c');
    goldGrad.addColorStop(s1, '#fff6c4');
    goldGrad.addColorStop(s2, '#e39e1c');
  } else {
    goldGrad.addColorStop(0.28, '#f7cb4f');
    goldGrad.addColorStop(0.5, '#ffe98a');
    goldGrad.addColorStop(0.75, '#c9800c');
  }
  goldGrad.addColorStop(1, '#784203');
  ctx.fillStyle = goldGrad;
  ctx.fill();

  // Sharp bronze-gold lower/outer contour rim
  ctx.lineWidth = Math.max(0.7, scale * 0.42);
  ctx.strokeStyle = 'rgba(116, 62, 4, 0.85)';
  ctx.stroke();

  // Crisp bright champagne-gold top highlight edge along the inner upper face
  ctx.beginPath();
  for (let i = 4; i <= 58; i++) {
    const t = i / 64;
    const theta = (6 + 198 * t) * DEG;
    const hw = 0.75 + Math.sin(t * Math.PI) * 3.45;
    const [px, py] = orbitPoint(theta, -hw * 0.62, scale);
    if (i === 4) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.lineWidth = Math.max(0.8, scale * 0.55);
  ctx.strokeStyle = 'rgba(255, 245, 196, 0.9)';
  ctx.lineCap = 'round';
  ctx.stroke();

  // Travelling bright golden orb glint riding along the orbit arc
  const travelT = (elapsedSec * 0.24) % 1;
  const travelTheta = (6 + 194 * travelT) * DEG;
  const [tx, ty] = orbitPoint(travelTheta, 0, scale);
  const travelFade = Math.sin(travelT * Math.PI);
  if (travelFade > 0.05) {
    const sparkR = scale * 6.5;
    const sparkGrad = ctx.createRadialGradient(tx, ty, 0, tx, ty, sparkR);
    sparkGrad.addColorStop(0, `rgba(255, 252, 230, ${(0.92 * travelFade).toFixed(2)})`);
    sparkGrad.addColorStop(0.35, `rgba(253, 224, 118, ${(0.55 * travelFade).toFixed(2)})`);
    sparkGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = sparkGrad;
    ctx.beginPath();
    ctx.arc(tx, ty, sparkR, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // 3. Animated upper-right 4-point optical gold star flare where back arc clears the Earth edge
  const [fx, fy] = orbitPoint(-36 * DEG, 0, scale);
  const pulse = 0.8 + 0.28 * Math.sin(elapsedSec * 2.6);
  const flareR = scale * 10.5 * pulse;

  ctx.save();
  ctx.translate(fx, fy + swayY);

  const flare = ctx.createRadialGradient(0, 0, 0, 0, 0, flareR);
  flare.addColorStop(0, 'rgba(255, 252, 232, 0.98)');
  flare.addColorStop(0.28, 'rgba(253, 217, 108, 0.72)');
  flare.addColorStop(0.65, 'rgba(245, 158, 11, 0.16)');
  flare.addColorStop(1, 'rgba(245, 158, 11, 0)');
  ctx.fillStyle = flare;
  ctx.beginPath();
  ctx.arc(0, 0, flareR, 0, Math.PI * 2);
  ctx.fill();

  // Twinkling 4-point optical cross rays
  ctx.rotate(elapsedSec * 0.35);
  const rayLen = scale * 8.5 * pulse;
  const rayGrad = ctx.createLinearGradient(-rayLen, 0, rayLen, 0);
  rayGrad.addColorStop(0, 'rgba(255, 248, 210, 0)');
  rayGrad.addColorStop(0.5, 'rgba(255, 252, 235, 0.92)');
  rayGrad.addColorStop(1, 'rgba(255, 248, 210, 0)');
  ctx.strokeStyle = rayGrad;
  ctx.lineWidth = Math.max(0.7, scale * 0.55);
  ctx.beginPath();
  ctx.moveTo(-rayLen, 0);
  ctx.lineTo(rayLen, 0);
  ctx.stroke();

  const rayGradV = ctx.createLinearGradient(0, -rayLen, 0, rayLen);
  rayGradV.addColorStop(0, 'rgba(255, 248, 210, 0)');
  rayGradV.addColorStop(0.5, 'rgba(255, 252, 235, 0.92)');
  rayGradV.addColorStop(1, 'rgba(255, 248, 210, 0)');
  ctx.strokeStyle = rayGradV;
  ctx.beginPath();
  ctx.moveTo(0, -rayLen);
  ctx.lineTo(0, rayLen);
  ctx.stroke();

  ctx.restore();
}

interface AnimatedLogoGlobeProps {
  src?: string;
  alt: string;
  className?: string;
}

export const AnimatedLogoGlobe: React.FC<AnimatedLogoGlobeProps> = ({
  alt,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dots = getSphereDots();

    let cssW = container.clientWidth || CROP_W;
    let cssH = container.clientHeight || CROP_H;
    let dpr = Math.min(window.devicePixelRatio || 1, 2.5);

    const syncSize = () => {
      const nextW = container.clientWidth;
      const nextH = container.clientHeight;
      if (nextW > 0 && nextH > 0) {
        cssW = nextW;
        cssH = nextH;
      }
      dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      canvas.width = Math.max(1, Math.round(cssW * dpr));
      canvas.height = Math.max(1, Math.round(cssH * dpr));
    };

    syncSize();
    const ro = new ResizeObserver(syncSize);
    ro.observe(container);

    const projectPoint = (
      ux: number,
      uy: number,
      uz: number,
      cosR: number,
      sinR: number,
    ): [number, number, number] => {
      const x1 = ux * cosR + uz * sinR;
      const z1 = -ux * sinR + uz * cosR;
      const y2 = uy * COS_TX - z1 * SIN_TX;
      const z2 = uy * SIN_TX + z1 * COS_TX;
      const nx = x1 * COS_TZ - y2 * SIN_TZ;
      const ny = x1 * SIN_TZ + y2 * COS_TZ;
      return [nx, ny, z2];
    };

    const drawFrame = (rotRad: number, elapsedSec: number) => {
      const w = cssW;
      const h = cssH;
      if (w <= 0 || h <= 0) return;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const scale = w / CROP_W;
      const cx = (REF_CX - CROP_X) * scale;
      const cy = (REF_CY - CROP_Y) * scale;
      const R = REF_R * scale;

      const cosR = Math.cos(rotRad);
      const sinR = Math.sin(rotRad);

      // 1. Clean tight Premium Blue rim glow strictly hugging the sphere (zero color scatter/bleed)
      const glowBreath = 0.88 + 0.12 * Math.sin(elapsedSec * 1.8);
      const outerGlow = ctx.createRadialGradient(cx, cy, R * 0.96, cx, cy, R * 1.11);
      outerGlow.addColorStop(0, `rgba(56, 189, 248, ${(0.34 * glowBreath).toFixed(3)})`);
      outerGlow.addColorStop(0.55, `rgba(29, 117, 255, ${(0.12 * glowBreath).toFixed(3)})`);
      outerGlow.addColorStop(1, 'rgba(29, 117, 255, 0)');
      ctx.fillStyle = outerGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.11, 0, Math.PI * 2);
      ctx.fill();

      // 2. Animated Vector Left Squares (back layer) & Back Golden Orbit Arc
      for (let i = 0; i < LEFT_SQUARES.length; i++) {
        if (!LEFT_SQUARES[i].front) drawCrispSquare(ctx, LEFT_SQUARES[i], scale, elapsedSec, i);
      }
      drawGoldenOrbitBackArc(ctx, scale, elapsedSec);

      // 3. Rotating 3D Earth Sphere clipped strictly to circular sphere silhouette
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.clip();

      // 3a. Deep midnight ocean base with upper-right natural directional light
      const oceanGrad = ctx.createRadialGradient(
        cx + R * 0.36,
        cy - R * 0.38,
        R * 0.04,
        cx - R * 0.14,
        cy + R * 0.14,
        R * 1.18,
      );
      oceanGrad.addColorStop(0, '#0d57d9');
      oceanGrad.addColorStop(0.35, '#04226b');
      oceanGrad.addColorStop(0.75, '#010d36');
      oceanGrad.addColorStop(1, '#010516');
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(cx - R - 1, cy - R - 1, R * 2 + 2, R * 2 + 2);

      // 3b. Rotating 3D latitude & longitude wireframe grid lines (front hemisphere only)
      ctx.lineWidth = Math.max(0.8, R * 0.0078);

      for (let latDeg = -60; latDeg <= 60; latDeg += 20) {
        const latRad = latDeg * DEG;
        const cosLat = Math.cos(latRad);
        const sinLat = Math.sin(latRad);
        let drawing = false;
        ctx.beginPath();
        for (let lonDeg = 0; lonDeg <= 360; lonDeg += 6) {
          const lonRad = lonDeg * DEG;
          const [nx, ny, nz] = projectPoint(
            cosLat * Math.sin(lonRad),
            sinLat,
            cosLat * Math.cos(lonRad),
            cosR,
            sinR,
          );
          if (nz > 0.02) {
            const sx = cx + nx * R;
            const sy = cy - ny * R;
            if (!drawing) {
              ctx.moveTo(sx, sy);
              drawing = true;
            } else {
              ctx.lineTo(sx, sy);
            }
          } else {
            drawing = false;
          }
        }
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.28)';
        ctx.stroke();
      }

      for (let lonDeg = 0; lonDeg < 360; lonDeg += 20) {
        const lonRad = lonDeg * DEG;
        const sinLon = Math.sin(lonRad);
        const cosLon = Math.cos(lonRad);
        let drawing = false;
        ctx.beginPath();
        for (let latDeg = -84; latDeg <= 84; latDeg += 6) {
          const latRad = latDeg * DEG;
          const cosLat = Math.cos(latRad);
          const [nx, ny, nz] = projectPoint(
            cosLat * sinLon,
            Math.sin(latRad),
            cosLat * cosLon,
            cosR,
            sinR,
          );
          if (nz > 0.02) {
            const sx = cx + nx * R;
            const sy = cy - ny * R;
            if (!drawing) {
              ctx.moveTo(sx, sy);
              drawing = true;
            } else {
              ctx.lineTo(sx, sy);
            }
          } else {
            drawing = false;
          }
        }
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.26)';
        ctx.stroke();
      }

      // Glowing cyan intersection dots across the rotating grid
      const nodeSize = Math.max(1.3, R * 0.0155);
      for (let latDeg = -60; latDeg <= 60; latDeg += 20) {
        const latRad = latDeg * DEG;
        const cosLat = Math.cos(latRad);
        const sinLat = Math.sin(latRad);
        for (let lonDeg = 0; lonDeg < 360; lonDeg += 20) {
          const lonRad = lonDeg * DEG;
          const [nx, ny, nz] = projectPoint(
            cosLat * Math.sin(lonRad),
            sinLat,
            cosLat * Math.cos(lonRad),
            cosR,
            sinR,
          );
          if (nz > 0.1) {
            const ndotl = nx * LX + ny * LY + nz * LZ;
            const alpha = Math.max(0.2, Math.min(0.68, 0.26 + ndotl * 0.42)) * nz;
            ctx.fillStyle = `rgba(145, 226, 255, ${alpha.toFixed(2)})`;
            ctx.fillRect(
              cx + nx * R - nodeSize * 0.5,
              cy - ny * R - nodeSize * 0.5,
              nodeSize,
              nodeSize,
            );
          }
        }
      }

      // 3c. Rotating 3D Digital Pixel Continent Dots with live cyan shimmer & 3D foreshortening
      const baseDot = Math.max(1.75, R * 0.028);
      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        const [nx, ny, nz] = projectPoint(d.ux, d.uy, d.uz, cosR, sinR);
        if (nz <= 0.02) continue;

        const edgeFade = Math.min(1, (nz - 0.02) / 0.14);
        const ndotl = nx * LX + ny * LY + nz * LZ;
        const shimmer = 1 + d.twinkleAmp * Math.sin(elapsedSec * 3.0 + d.phase);
        const lit = Math.max(0, Math.min(1, ((ndotl + 0.28) / 1.15) * d.tone * shimmer));
        const palIdx = Math.min(15, Math.max(0, Math.round(lit * 15)));
        const [pr, pg, pb] = PIXEL_PALETTE[palIdx];

        const sx = cx + nx * R;
        const sy = cy - ny * R;
        const fw = baseDot * Math.max(0.32, Math.sqrt(Math.max(0.08, 1 - nx * nx * 0.86)));
        const fh = baseDot * Math.max(0.36, Math.sqrt(Math.max(0.12, 1 - ny * ny * 0.82)));

        ctx.fillStyle = `rgba(${pr},${pg},${pb},${edgeFade.toFixed(2)})`;
        ctx.fillRect(sx - fw * 0.5, sy - fh * 0.5, fw, fh);
      }

      // 3d. Upper-right natural rim specular light & inner Fresnel atmospheric glow
      const specRim = ctx.createRadialGradient(
        cx + R * 0.64,
        cy - R * 0.64,
        R * 0.02,
        cx + R * 0.45,
        cy - R * 0.45,
        R * 0.72,
      );
      specRim.addColorStop(0, 'rgba(181, 243, 245, 0.48)');
      specRim.addColorStop(0.45, 'rgba(56, 189, 248, 0.2)');
      specRim.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = specRim;
      ctx.fillRect(cx - R, cy - R, R * 2, R * 2);

      const fresnel = ctx.createRadialGradient(cx, cy, R * 0.72, cx, cy, R);
      fresnel.addColorStop(0, 'rgba(29, 117, 255, 0)');
      fresnel.addColorStop(0.76, 'rgba(29, 135, 255, 0.28)');
      fresnel.addColorStop(0.94, 'rgba(83, 199, 245, 0.54)');
      fresnel.addColorStop(1, 'rgba(125, 224, 255, 0.68)');
      ctx.fillStyle = fresnel;
      ctx.fillRect(cx - R, cy - R, R * 2, R * 2);

      ctx.restore();

      // 4. Animated Razor-sharp Foreground Golden Orbit Ring & micro foreground squares on top
      drawGoldenOrbitFrontArc(ctx, scale, elapsedSec);
      for (let i = 0; i < LEFT_SQUARES.length; i++) {
        if (LEFT_SQUARES[i].front) drawCrispSquare(ctx, LEFT_SQUARES[i], scale, elapsedSec, i);
      }
    };

    let rafId = 0;
    const startTime = performance.now();

    const tick = (now: number) => {
      if (!document.hidden) {
        const elapsedMs = now - startTime;
        const rotRad = START_LON + ((elapsedMs % ROTATION_PERIOD_MS) / ROTATION_PERIOD_MS) * Math.PI * 2;
        drawFrame(rotRad, elapsedMs * 0.001);
      }
      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label={alt}
      className={`relative w-full aspect-[280/198] select-none bg-transparent ${className}`}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
    </div>
  );
};

export default AnimatedLogoGlobe;
