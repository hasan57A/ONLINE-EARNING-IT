import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

// Module-level reusable math helpers (zero GC inside animation loop)
const _targetTilt = new THREE.Vector2(0, 0);
const _currentTilt = new THREE.Vector2(0, 0);
const _sunWorldDir = new THREE.Vector3(4.6, 3.2, 4.4).normalize();

type LonLat = [number, number];

// Real-world continental & major island polygons ([lon, lat])
const CONTINENT_POLYGONS: LonLat[][] = [
  // North America
  [
    [-168, 66], [-162, 71], [-140, 70], [-125, 71], [-105, 72], [-85, 70],
    [-78, 63], [-64, 60], [-55, 52], [-66, 45], [-74, 40], [-81, 31],
    [-80, 25], [-83, 29], [-90, 29], [-97, 26], [-96, 19], [-88, 21],
    [-84, 15], [-83, 9], [-78, 8], [-82, 8], [-86, 11], [-92, 14],
    [-105, 19], [-110, 24], [-114, 31], [-118, 34], [-124, 41], [-125, 49],
    [-136, 58], [-150, 60], [-162, 55], [-166, 61],
  ],
  // Greenland
  [
    [-52, 60], [-42, 60], [-32, 68], [-20, 74], [-18, 81], [-35, 83],
    [-58, 81], [-70, 77], [-60, 72], [-53, 66],
  ],
  // South America
  [
    [-78, 9], [-72, 12], [-62, 10], [-50, 1], [-35, -6], [-38, -14],
    [-41, -22], [-48, -28], [-53, -34], [-62, -40], [-66, -47], [-68, -54],
    [-74, -53], [-74, -44], [-71, -33], [-70, -19], [-77, -12], [-81, -5],
    [-79, 2],
  ],
  // UK & Ireland
  [[-6, 50], [1, 51], [0, 56], [-4, 59], [-7, 57], [-10, 54], [-9, 51]],
  // Europe
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
];

// Curated cluster of dispersing sapphire-blue & 24K gold pixel cubes matching the emblem silhouette
interface PixelCubeSpec {
  x: number;
  y: number;
  z: number;
  size: number;
  isGold: boolean;
  phase: number;
  speed: number;
  amp: number;
}

const DISPERSING_PIXEL_CUBES: PixelCubeSpec[] = [
  // Far-left trailing edge cubes
  { x: -1.66, y: -0.18, z: 0.14, size: 0.105, isGold: true, phase: 0.2, speed: 1.15, amp: 0.04 },
  { x: -1.61, y: 0.10, z: 0.24, size: 0.10, isGold: false, phase: 1.1, speed: 1.25, amp: 0.044 },
  { x: -1.55, y: -0.34, z: 0.08, size: 0.064, isGold: true, phase: 2.3, speed: 1.4, amp: 0.036 },
  // Mid-left hero cubes
  { x: -1.48, y: -0.09, z: 0.28, size: 0.155, isGold: true, phase: 0.8, speed: 0.95, amp: 0.044 },
  { x: -1.46, y: 0.27, z: 0.12, size: 0.078, isGold: true, phase: 1.7, speed: 1.3, amp: 0.04 },
  { x: -1.40, y: -0.43, z: 0.18, size: 0.082, isGold: false, phase: 2.8, speed: 1.2, amp: 0.038 },
  { x: -1.35, y: 0.16, z: 0.34, size: 0.108, isGold: false, phase: 0.5, speed: 1.05, amp: 0.046 },
  { x: -1.34, y: 0.46, z: 0.04, size: 0.062, isGold: true, phase: 3.1, speed: 1.45, amp: 0.035 },
  // Center cluster cubes
  { x: -1.32, y: -0.22, z: 0.38, size: 0.132, isGold: false, phase: 1.9, speed: 1.0, amp: 0.044 },
  { x: -1.27, y: 0.03, z: 0.22, size: 0.098, isGold: true, phase: 2.5, speed: 1.15, amp: 0.04 },
  { x: -1.25, y: 0.35, z: 0.24, size: 0.102, isGold: false, phase: 0.9, speed: 1.28, amp: 0.038 },
  { x: -1.22, y: -0.54, z: 0.10, size: 0.058, isGold: true, phase: 1.4, speed: 1.5, amp: 0.032 },
  { x: -1.17, y: -0.34, z: 0.28, size: 0.068, isGold: true, phase: 2.1, speed: 1.32, amp: 0.036 },
  { x: -1.16, y: 0.20, z: 0.40, size: 0.114, isGold: true, phase: 0.4, speed: 1.08, amp: 0.042 },
  // Near-globe transition cubes
  { x: -1.10, y: -0.05, z: 0.32, size: 0.088, isGold: false, phase: 2.9, speed: 1.18, amp: 0.034 },
  { x: -1.09, y: 0.43, z: 0.16, size: 0.07, isGold: false, phase: 1.2, speed: 1.38, amp: 0.032 },
  { x: -1.05, y: -0.44, z: 0.22, size: 0.06, isGold: false, phase: 3.6, speed: 1.42, amp: 0.03 },
  { x: -1.02, y: 0.14, z: 0.22, size: 0.052, isGold: true, phase: 0.7, speed: 1.55, amp: 0.028 },
  { x: -1.00, y: -0.20, z: 0.26, size: 0.054, isGold: false, phase: 2.4, speed: 1.48, amp: 0.03 },
  { x: -0.96, y: 0.31, z: 0.18, size: 0.044, isGold: false, phase: 1.8, speed: 1.6, amp: 0.025 },
];

/**
 * Generates ultra-fast (<8ms) crisp halftone LED-dotted sapphire continent & grid textures
 * matching the digital globe emblem in the user's ONLINE LEARNING PRO logo.
 */
function buildLogoEarthTextures(isCompact: boolean) {
  const width = isCompact ? 1024 : 2048;
  const height = isCompact ? 512 : 1024;

  // 1. Fast polygon rasterization onto a 512x256 land mask
  const maskW = 512;
  const maskH = 256;
  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = maskW;
  maskCanvas.height = maskH;
  const maskCtx = maskCanvas.getContext('2d')!;
  maskCtx.fillStyle = '#000000';
  maskCtx.fillRect(0, 0, maskW, maskH);

  const toMaskXY = ([lon, lat]: LonLat): [number, number] => [
    ((lon + 180) / 360) * maskW,
    ((90 - lat) / 180) * maskH,
  ];

  maskCtx.fillStyle = '#ffffff';
  for (const poly of CONTINENT_POLYGONS) {
    maskCtx.beginPath();
    poly.forEach((pt, idx) => {
      const [px, py] = toMaskXY(pt);
      if (idx === 0) maskCtx.moveTo(px, py);
      else maskCtx.lineTo(px, py);
    });
    maskCtx.closePath();
    maskCtx.fill();
  }

  const maskData = maskCtx.getImageData(0, 0, maskW, maskH).data;

  // 2. Render Albedo + Emissive + Roughness canvases
  const albedoCanvas = document.createElement('canvas');
  albedoCanvas.width = width;
  albedoCanvas.height = height;
  const albedoCtx = albedoCanvas.getContext('2d')!;

  const emissiveCanvas = document.createElement('canvas');
  emissiveCanvas.width = width;
  emissiveCanvas.height = height;
  const emissiveCtx = emissiveCanvas.getContext('2d')!;

  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = width;
  roughCanvas.height = height;
  const roughCtx = roughCanvas.getContext('2d')!;

  // Balanced royal-sapphire ocean gradient (reduced harsh near-black navy shadow)
  const oceanGrad = albedoCtx.createLinearGradient(0, 0, 0, height);
  oceanGrad.addColorStop(0, '#030d2e');
  oceanGrad.addColorStop(0.25, '#061b5e');
  oceanGrad.addColorStop(0.5, '#0a2d8a');
  oceanGrad.addColorStop(0.75, '#061b5e');
  oceanGrad.addColorStop(1, '#030d2e');
  albedoCtx.fillStyle = oceanGrad;
  albedoCtx.fillRect(0, 0, width, height);

  emissiveCtx.fillStyle = '#020a26';
  emissiveCtx.fillRect(0, 0, width, height);

  // Specular deep-ocean base roughness
  roughCtx.fillStyle = '#404040';
  roughCtx.fillRect(0, 0, width, height);

  // Crisp deep sapphire-blue lat/lon wireframe grid
  const gridColorAlbedo = 'rgba(14, 96, 220, 0.34)';
  const gridColorEmissive = 'rgba(10, 78, 195, 0.38)';
  const lineWidth = isCompact ? 1.1 : 1.65;

  albedoCtx.strokeStyle = gridColorAlbedo;
  albedoCtx.lineWidth = lineWidth;
  emissiveCtx.strokeStyle = gridColorEmissive;
  emissiveCtx.lineWidth = lineWidth;

  // 24 meridians (every 15 deg)
  for (let lon = -180; lon < 180; lon += 15) {
    const x = ((lon + 180) / 360) * width;
    albedoCtx.beginPath();
    albedoCtx.moveTo(x, 0);
    albedoCtx.lineTo(x, height);
    albedoCtx.stroke();

    emissiveCtx.beginPath();
    emissiveCtx.moveTo(x, 0);
    emissiveCtx.lineTo(x, height);
    emissiveCtx.stroke();
  }

  // 11 parallels (every 15 deg)
  for (let lat = -75; lat <= 75; lat += 15) {
    const y = ((90 - lat) / 180) * height;
    albedoCtx.beginPath();
    albedoCtx.moveTo(0, y);
    albedoCtx.lineTo(width, y);
    albedoCtx.stroke();

    emissiveCtx.beginPath();
    emissiveCtx.moveTo(0, y);
    emissiveCtx.lineTo(width, y);
    emissiveCtx.stroke();
  }

  // 3. Spherical-compensated Halftone LED Dot Matrix in rich Deep Royal Logo Blue
  const latStepDeg = 1.38;
  const dotHeightPx = (1.02 / 180) * height;

  for (let latDeg = -60; latDeg <= 83; latDeg += latStepDeg) {
    const latRad = (latDeg * Math.PI) / 180;
    const cosLat = Math.max(0.24, Math.cos(latRad));
    const lonStepDeg = latStepDeg / cosLat;
    const dotWidthPx = (1.02 / cosLat / 360) * width;

    const v = (90 - latDeg) / 180;
    const cy = v * height;
    const my = Math.min(maskH - 1, Math.max(0, Math.floor(v * maskH)));

    for (let lonDeg = -180 + lonStepDeg * 0.5; lonDeg < 180; lonDeg += lonStepDeg) {
      const u = (lonDeg + 180) / 360;
      const mx = Math.min(maskW - 1, Math.max(0, Math.floor(u * maskW)));
      const maskVal = maskData[(my * maskW + mx) * 4];

      if (maskVal > 110) {
        const cx = u * width;
        const hash = Math.abs(Math.sin(lonDeg * 12.9898 + latDeg * 78.233) * 43758.5453) % 1;

        // Royal-sapphire dots with soft sky highlight on brightest 28%
        albedoCtx.fillStyle =
          hash > 0.72 ? '#60c0ff' : hash > 0.35 ? '#1c86fa' : '#0b63db';
        albedoCtx.fillRect(
          cx - dotWidthPx * 0.5,
          cy - dotHeightPx * 0.5,
          dotWidthPx,
          dotHeightPx
        );

        emissiveCtx.fillStyle =
          hash > 0.72 ? '#44b0ff' : hash > 0.3 ? '#1076f0' : '#0655c9';
        emissiveCtx.fillRect(
          cx - dotWidthPx * 0.5,
          cy - dotHeightPx * 0.5,
          dotWidthPx,
          dotHeightPx
        );

        roughCtx.fillStyle = '#525252';
        roughCtx.fillRect(
          cx - dotWidthPx * 0.5,
          cy - dotHeightPx * 0.5,
          dotWidthPx,
          dotHeightPx
        );
      }
    }
  }

  const albedoMap = new THREE.CanvasTexture(albedoCanvas);
  albedoMap.colorSpace = THREE.SRGBColorSpace;
  albedoMap.wrapS = THREE.RepeatWrapping;

  const emissiveMap = new THREE.CanvasTexture(emissiveCanvas);
  emissiveMap.colorSpace = THREE.SRGBColorSpace;
  emissiveMap.wrapS = THREE.RepeatWrapping;

  const roughMap = new THREE.CanvasTexture(roughCanvas);
  roughMap.wrapS = THREE.RepeatWrapping;

  return { albedoMap, emissiveMap, roughMap };
}

/**
 * Generates a refined 4-point 24K golden star flare texture (warm gold, minimal white)
 */
function buildStarFlareTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const half = size / 2;

  // Warm golden-white star core fading into 24K amber halo
  const halo = ctx.createRadialGradient(half, half, 0, half, half, half);
  halo.addColorStop(0, 'rgba(255, 252, 235, 0.98)');
  halo.addColorStop(0.2, 'rgba(253, 224, 71, 0.82)');
  halo.addColorStop(0.48, 'rgba(245, 158, 11, 0.28)');
  halo.addColorStop(1, 'rgba(245, 158, 11, 0)');
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, size, size);

  const hGrad = ctx.createLinearGradient(0, half, size, half);
  hGrad.addColorStop(0, 'rgba(251,191,36,0)');
  hGrad.addColorStop(0.5, 'rgba(255,252,232,0.92)');
  hGrad.addColorStop(1, 'rgba(251,191,36,0)');
  ctx.fillStyle = hGrad;
  ctx.fillRect(6, half - 1.5, size - 12, 3);

  const vGrad = ctx.createLinearGradient(half, 0, half, size);
  vGrad.addColorStop(0, 'rgba(251,191,36,0)');
  vGrad.addColorStop(0.5, 'rgba(255,252,232,0.92)');
  vGrad.addColorStop(1, 'rgba(251,191,36,0)');
  ctx.fillStyle = vGrad;
  ctx.fillRect(half - 1.5, 6, 3, size - 12);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Custom dark sapphire, subtle cool-white highlight & 24K gold reflection studio
 */
function buildSapphireGoldEnvScene(): THREE.Scene {
  const envScene = new THREE.Scene();
  envScene.background = new THREE.Color(0x02081c);

  const panelGeo = new THREE.PlaneGeometry(6, 6);
  const bluePanelMat = new THREE.MeshBasicMaterial({ color: 0x3b82f6, side: THREE.DoubleSide });
  const goldPanelMat = new THREE.MeshBasicMaterial({ color: 0xfde047, side: THREE.DoubleSide });
  const amberPanelMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24, side: THREE.DoubleSide });
  const deepPanelMat = new THREE.MeshBasicMaterial({ color: 0x09246b, side: THREE.DoubleSide });
  const softRimMat = new THREE.MeshBasicMaterial({ color: 0xbfdbfe, side: THREE.DoubleSide });

  const topPanel = new THREE.Mesh(panelGeo, bluePanelMat);
  topPanel.position.set(0, 6, 0);
  topPanel.rotation.x = Math.PI / 2;
  envScene.add(topPanel);

  const upperRightRim = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 3.2), softRimMat);
  upperRightRim.position.set(5, 5, 4);
  upperRightRim.lookAt(0, 0, 0);
  envScene.add(upperRightRim);

  const rightGold = new THREE.Mesh(panelGeo, goldPanelMat);
  rightGold.position.set(6, -1, 4);
  rightGold.lookAt(0, 0, 0);
  envScene.add(rightGold);

  const frontLeftGold = new THREE.Mesh(panelGeo, amberPanelMat);
  frontLeftGold.position.set(-4, -4, 5);
  frontLeftGold.lookAt(0, 0, 0);
  envScene.add(frontLeftGold);

  const leftBlue = new THREE.Mesh(panelGeo, deepPanelMat);
  leftBlue.position.set(-6, 2, 3);
  leftBlue.lookAt(0, 0, 0);
  envScene.add(leftBlue);

  return envScene;
}

export const EarthGlobe3D: React.FC<{ className?: string }> = ({ className = '' }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Software-WebGL probe
    const isSoftwareGl = (() => {
      try {
        const probe = document.createElement('canvas').getContext('webgl2');
        if (!probe) return true;
        const ext = probe.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : probe.RENDERER;
        const gpu = String(probe.getParameter(param) || '');
        probe.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return false;
      }
    })();

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const width = Math.max(container.clientWidth, 280);
    const height = Math.max(container.clientHeight, 280);
    // Closer camera framing so the logo Earth appears larger and more commanding on all devices
    const computeCameraZ = (aspect: number) => Math.max(4.2, 4.9 / Math.max(0.72, aspect));

    // 2. Scene, Camera & Transparent Renderer (no rectangular card border)
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 100);
    camera.position.set(0, 0.08, computeCameraZ(width / height));
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // 3. Dark-Sapphire & 24K Gold Studio Reflection (zero white specular glare)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envScene = buildSapphireGoldEnvScene();
    const envTarget = pmremGenerator.fromScene(envScene, 0.08);
    scene.environment = envTarget.texture;
    envScene.traverse(obj => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
        else obj.material.dispose();
      }
    });
    pmremGenerator.dispose();

    // 4. Lighting Rig: Balanced Royal Blue base with subtle crisp upper-right highlight
    const sunKey = new THREE.DirectionalLight(0xdbeafe, 2.0);
    sunKey.position.copy(_sunWorldDir).multiplyScalar(8);
    scene.add(sunKey);

    const skyFill = new THREE.HemisphereLight(0x3b82f6, 0x041238, 0.85);
    scene.add(skyFill);

    const goldLight = new THREE.DirectionalLight(0xfde047, 2.05);
    goldLight.position.set(3.2, -2.5, 4.5);
    scene.add(goldLight);

    const backRim = new THREE.DirectionalLight(0x1d7dfa, 1.65);
    backRim.position.set(-4.5, 3.0, -4.0);
    scene.add(backRim);

    // 5. Fast Procedural Digital Logo Globe Textures
    const { albedoMap, emissiveMap, roughMap } = buildLogoEarthTextures(isMobile || isSoftwareGl);
    const maxAniso = isSoftwareGl ? 1 : Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
    albedoMap.anisotropy = maxAniso;
    emissiveMap.anisotropy = maxAniso;

    // 6. Main Composite Assembly (centered visually with dispersing left cubes)
    const pivotGroup = new THREE.Group();
    pivotGroup.position.x = 0.22;
    scene.add(pivotGroup);

    const axialGroup = new THREE.Group();
    axialGroup.rotation.z = THREE.MathUtils.degToRad(14);
    axialGroup.rotation.x = THREE.MathUtils.degToRad(12);
    pivotGroup.add(axialGroup);

    // Part A: Royal-Sapphire Dotted Matrix Earth Sphere with subtle glossy sheen
    const earthGeo = new THREE.SphereGeometry(1, isMobile ? 48 : 64, isMobile ? 36 : 48);
    const earthMat = new THREE.MeshPhysicalMaterial({
      map: albedoMap,
      roughnessMap: roughMap,
      emissiveMap,
      emissive: new THREE.Color(0x167cf8),
      emissiveIntensity: 1.14,
      roughness: 0.56,
      metalness: 0.04,
      specularIntensity: 0.32,
      clearcoat: 0.2,
      clearcoatRoughness: 0.34,
      envMapIntensity: 0.2,
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    // Frame Americas, Atlantic, Europe & Africa right out of the gate like the logo
    earthMesh.rotation.y = -1.05;
    axialGroup.add(earthMesh);

    // Part B: Deep Royal-Blue Fresnel Atmosphere Rim with gentle sky-white upper-right crest
    const atmoInnerGeo = new THREE.SphereGeometry(1.028, 48, 36);
    const atmoInnerMat = new THREE.ShaderMaterial({
      uniforms: {
        uSunDir: { value: _sunWorldDir },
        uColorBase: { value: new THREE.Color(0x0044cc) },
        uColorPeak: { value: new THREE.Color(0x7dd3fc) },
      },
      vertexShader: `
        varying vec3 vNormalView;
        varying vec3 vNormalWorld;
        varying vec3 vViewPos;
        void main() {
          vNormalView = normalize(normalMatrix * normal);
          vNormalWorld = normalize(mat3(modelMatrix) * normal);
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          vViewPos = -mvPos.xyz;
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        uniform vec3 uSunDir;
        uniform vec3 uColorBase;
        uniform vec3 uColorPeak;
        varying vec3 vNormalView;
        varying vec3 vNormalWorld;
        varying vec3 vViewPos;
        void main() {
          vec3 viewDir = normalize(vViewPos);
          float rim = 1.0 - max(0.0, dot(viewDir, normalize(vNormalView)));
          float fresnel = pow(rim, 3.2);
          float sunSide = 0.26 + 0.74 * smoothstep(-0.25, 0.85, dot(normalize(vNormalWorld), normalize(uSunDir)));
          vec3 col = mix(uColorBase, uColorPeak, pow(sunSide, 2.0) * fresnel);
          gl_FragColor = vec4(col, fresnel * sunSide * 0.8);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const atmoInnerMesh = new THREE.Mesh(atmoInnerGeo, atmoInnerMat);
    atmoInnerMesh.renderOrder = 3;
    axialGroup.add(atmoInnerMesh);

    // Part C: Outer Volumetric Deep-Blue Glow Halo
    const atmoOuterGeo = new THREE.SphereGeometry(1.15, 48, 36);
    const atmoOuterMat = new THREE.ShaderMaterial({
      uniforms: {
        uColorInner: { value: new THREE.Color(0x031966) },
        uColorEdge: { value: new THREE.Color(0x0d52d6) },
      },
      vertexShader: `
        varying vec3 vNormalView;
        varying vec3 vViewPos;
        void main() {
          vNormalView = normalize(normalMatrix * normal);
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          vViewPos = -mvPos.xyz;
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        uniform vec3 uColorInner;
        uniform vec3 uColorEdge;
        varying vec3 vNormalView;
        varying vec3 vViewPos;
        void main() {
          vec3 viewDir = normalize(vViewPos);
          float facing = dot(normalize(vNormalView), -viewDir);
          float glow = pow(clamp(0.68 - facing, 0.0, 1.0), 3.0);
          vec3 col = mix(uColorInner, uColorEdge, glow);
          gl_FragColor = vec4(col, glow * 0.45);
        }
      `,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const atmoOuterMesh = new THREE.Mesh(atmoOuterGeo, atmoOuterMat);
    atmoOuterMesh.renderOrder = 1;
    axialGroup.add(atmoOuterMesh);

    // Part D: Sweeping Sculpted 24K Metallic Gold Orbital Ring
    const ringProfile = [
      new THREE.Vector2(1.205, -0.014),
      new THREE.Vector2(1.22, -0.025),
      new THREE.Vector2(1.285, -0.022),
      new THREE.Vector2(1.302, 0.0),
      new THREE.Vector2(1.285, 0.022),
      new THREE.Vector2(1.22, 0.025),
      new THREE.Vector2(1.205, 0.014),
      new THREE.Vector2(1.205, -0.014),
    ];
    const goldRingGeo = new THREE.LatheGeometry(ringProfile, 160);
    const goldRingMat = new THREE.MeshPhysicalMaterial({
      color: 0xfacc15,
      emissive: new THREE.Color(0xd97706),
      emissiveIntensity: 0.48,
      metalness: 0.86,
      roughness: 0.18,
      clearcoat: 0.4,
      clearcoatRoughness: 0.18,
      envMapIntensity: 1.65,
    });

    const ringPivot = new THREE.Group();
    ringPivot.rotation.set(0.42, 0.0, 0.44);
    pivotGroup.add(ringPivot);

    const goldRingMesh = new THREE.Mesh(goldRingGeo, goldRingMat);
    ringPivot.add(goldRingMesh);

    // Refined Warm 24K Gold Star Flare riding along the upper-right crest
    const starFlareMap = buildStarFlareTexture();
    const flareMat = new THREE.SpriteMaterial({
      map: starFlareMap,
      color: 0xfef08a,
      transparent: true,
      opacity: 0.94,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const ringFlareSprite = new THREE.Sprite(flareMat);
    ringFlareSprite.scale.set(0.32, 0.32, 1);
    ringFlareSprite.renderOrder = 4;
    ringPivot.add(ringFlareSprite);

    // Part E: Dispersing Metallic 3D Sapphire & 24K Gold Pixel Cubes on the Left
    const pixelGroup = new THREE.Group();
    pivotGroup.add(pixelGroup);

    const sharedCubeGeo = new THREE.BoxGeometry(1, 1, 1);
    const blueCubeMat = new THREE.MeshPhysicalMaterial({
      color: 0x0a48cc,
      emissive: new THREE.Color(0x0b5ef0),
      emissiveIntensity: 0.48,
      metalness: 0.18,
      roughness: 0.28,
      specularIntensity: 0.28,
      clearcoat: 0.25,
      clearcoatRoughness: 0.25,
      envMapIntensity: 0.35,
    });
    const goldCubeMat = new THREE.MeshPhysicalMaterial({
      color: 0xfacc15,
      emissive: new THREE.Color(0xd97706),
      emissiveIntensity: 0.45,
      metalness: 0.84,
      roughness: 0.2,
      clearcoat: 0.4,
      clearcoatRoughness: 0.18,
      envMapIntensity: 1.55,
    });

    const pixelMeshes: { mesh: THREE.Mesh; spec: PixelCubeSpec }[] = [];
    for (const spec of DISPERSING_PIXEL_CUBES) {
      const mesh = new THREE.Mesh(sharedCubeGeo, spec.isGold ? goldCubeMat : blueCubeMat);
      mesh.position.set(spec.x, spec.y, spec.z);
      mesh.scale.setScalar(spec.size);
      // Slight crisp angular variation while retaining square pixel readability
      mesh.rotation.set(
        (spec.phase % 0.4) * 0.25,
        (spec.phase % 0.6) * 0.3,
        0
      );
      pixelGroup.add(mesh);
      pixelMeshes.push({ mesh, spec });
    }

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Gentle interactive pointer parallax (never interrupts continuous rotation)
    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      _targetTilt.set(ny * 0.15, nx * 0.22);
    };
    const onPointerLeave = () => {
      _targetTilt.set(0, 0);
    };
    container.addEventListener('pointermove', onPointerMove, { passive: true });
    container.addEventListener('pointerleave', onPointerLeave, { passive: true });

    // Responsive ResizeObserver with safe framing on narrow mobile screens
    const resizeObserver = new ResizeObserver(entries => {
      const entry = entries[0];
      if (!entry) return;
      const w = Math.max(Math.floor(entry.contentRect.width), 100);
      const h = Math.max(Math.floor(entry.contentRect.height), 100);
      const aspect = w / h;
      camera.aspect = aspect;
      camera.position.z = computeCameraZ(aspect);
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    resizeObserver.observe(container);

    // Perpetual Continuous 60fps Animation Loop (never pauses)
    const clock = new THREE.Clock();
    let frameId = 0;
    let disposed = false;

    const afterDraw = (cb: () => void) => {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (!gl || typeof gl.fenceSync !== 'function') {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) {
          if (sync) gl.deleteSync(sync);
          return;
        }
        const state = sync ? gl.getSyncParameter(sync, gl.SYNC_STATUS) : gl.SIGNALED;
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    };

    const tick = () => {
      if (disposed) return;
      const delta = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.elapsedTime;

      // 1. Continuous smooth rotation of the dotted digital Earth on its axis
      earthMesh.rotation.y += delta * 0.19;

      // 2. Subtle organic levitation of the entire emblem assembly
      pivotGroup.position.y = Math.sin(elapsed * 1.15) * 0.04;

      // 3. Subtle orbital breathing & gliding golden star spark on the upper-right arc
      ringPivot.rotation.x = 0.42 + Math.sin(elapsed * 0.85) * 0.035;
      ringPivot.rotation.z = 0.44 + Math.cos(elapsed * 0.72) * 0.025;
      const sparkAngle = -0.35 + Math.sin(elapsed * 0.65) * 0.42;
      ringFlareSprite.position.set(
        Math.cos(sparkAngle) * 1.27,
        0.01,
        Math.sin(sparkAngle) * 1.27
      );
      const flareScale = 0.34 + Math.sin(elapsed * 2.6) * 0.06;
      ringFlareSprite.scale.set(flareScale, flareScale, 1);

      // 4. Dispersing 3D sapphire & gold pixel cubes gently drift & float off the left edge
      for (let i = 0; i < pixelMeshes.length; i++) {
        const { mesh, spec } = pixelMeshes[i];
        const t = elapsed * spec.speed + spec.phase;
        mesh.position.x = spec.x + Math.sin(t) * spec.amp;
        mesh.position.y = spec.y + Math.cos(t * 0.85) * (spec.amp * 0.85);
        mesh.position.z = spec.z + Math.sin(t * 0.7) * (spec.amp * 0.6);
        mesh.rotation.x = Math.sin(t * 0.6) * 0.18;
        mesh.rotation.y = Math.cos(t * 0.5) * 0.22;
      }

      // 5. Smooth damped pointer parallax
      _currentTilt.x = THREE.MathUtils.damp(_currentTilt.x, _targetTilt.x, 4.5, delta);
      _currentTilt.y = THREE.MathUtils.damp(_currentTilt.y, _targetTilt.y, 4.5, delta);
      pivotGroup.rotation.x = _currentTilt.x;
      pivotGroup.rotation.y = _currentTilt.y;

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      resizeObserver.disconnect();
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerleave', onPointerLeave);

      earthGeo.dispose();
      earthMat.dispose();
      atmoInnerGeo.dispose();
      atmoInnerMat.dispose();
      atmoOuterGeo.dispose();
      atmoOuterMat.dispose();
      goldRingGeo.dispose();
      goldRingMat.dispose();
      flareMat.dispose();
      starFlareMap.dispose();
      sharedCubeGeo.dispose();
      blueCubeMat.dispose();
      goldCubeMat.dispose();

      albedoMap.dispose();
      emissiveMap.dispose();
      roughMap.dispose();
      envTarget.dispose();
      renderer.dispose();

      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      aria-label="Animated 3D Digital Globe Emblem"
      className={`w-full h-full select-none ${className}`}
    />
  );
};

export default EarthGlobe3D;
