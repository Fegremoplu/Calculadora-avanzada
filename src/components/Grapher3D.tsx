import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as math from 'mathjs';
import {
  RotateCw,
  RotateCcw,
  Play,
  Pause,
  Download,
  Eye,
  Sparkles,
  Layers,
  Palette,
  Maximize2,
  Sliders,
  Check,
  AlertCircle,
  LineChart,
  Box
} from 'lucide-react';
import { preprocessExpression } from '../utils/mathEngine';

interface Grapher3DProps {
  onSwitchTo2D?: () => void;
}

interface Preset3D {
  label: string;
  expr: string;
  xRange: [number, number];
  yRange: [number, number];
  zScale: number;
}

const PRESETS_3D: Preset3D[] = [
  {
    label: 'Sombrero / Sinc',
    expr: 'sin(sqrt(x^2 + y^2)) / (sqrt(x^2 + y^2) + 0.001)',
    xRange: [-8, 8],
    yRange: [-8, 8],
    zScale: 2.5,
  },
  {
    label: 'Silla de Montar (Hiperbólico)',
    expr: '(x^2 - y^2) / 4',
    xRange: [-5, 5],
    yRange: [-5, 5],
    zScale: 0.8,
  },
  {
    label: 'Ondas Cruzadas',
    expr: 'sin(x) * cos(y)',
    xRange: [-6, 6],
    yRange: [-6, 6],
    zScale: 1.5,
  },
  {
    label: 'Campana Gaussiana 3D',
    expr: '3 * exp(-(x^2 + y^2) / 4)',
    xRange: [-5, 5],
    yRange: [-5, 5],
    zScale: 1.2,
  },
  {
    label: 'Paraboloide Elíptico',
    expr: '(x^2 + y^2) / 6',
    xRange: [-5, 5],
    yRange: [-5, 5],
    zScale: 0.8,
  },
  {
    label: 'Onda Espiral / Anillos',
    expr: 'cos(sqrt(x^2 + y^2) * 1.5)',
    xRange: [-7, 7],
    yRange: [-7, 7],
    zScale: 1.5,
  },
  {
    label: 'Silla de Mono (Monkey Saddle)',
    expr: '(x^3 - 3*x*y^2) / 10',
    xRange: [-4, 4],
    yRange: [-4, 4],
    zScale: 0.8,
  },
  {
    label: 'Pirámide de Ondas',
    expr: 'cos(abs(x) + abs(y))',
    xRange: [-6, 6],
    yRange: [-6, 6],
    zScale: 1.2,
  },
];

type ColorPalette = 'turbo' | 'cyan-amber' | 'viridis' | 'magma';
type RenderStyle = 'surface-wire' | 'smooth' | 'wireframe' | 'points';

// Helper for Color Palettes interpolation
function getColorForRatio(ratio: number, palette: ColorPalette): [number, number, number] {
  const t = Math.max(0, Math.min(1, ratio));

  switch (palette) {
    case 'cyan-amber': {
      // 0 = Dark Cyan, 0.5 = Teal, 0.8 = Orange, 1.0 = Amber-Gold
      if (t < 0.5) {
        const u = t / 0.5;
        return [0.03 + u * 0.1, 0.5 + u * 0.4, 0.7 + u * 0.2]; // Cyan to Bright teal
      } else {
        const u = (t - 0.5) / 0.5;
        return [0.13 + u * 0.82, 0.9 - u * 0.25, 0.9 - u * 0.75]; // Teal to Golden Amber
      }
    }
    case 'viridis': {
      // Purple -> Blue -> Green -> Yellow
      if (t < 0.33) {
        const u = t / 0.33;
        return [0.28 - u * 0.1, 0.13 + u * 0.2, 0.44 + u * 0.3];
      } else if (t < 0.66) {
        const u = (t - 0.33) / 0.33;
        return [0.18 + u * 0.1, 0.33 + u * 0.4, 0.74 - u * 0.4];
      } else {
        const u = (t - 0.66) / 0.34;
        return [0.28 + u * 0.65, 0.73 + u * 0.22, 0.34 - u * 0.2];
      }
    }
    case 'magma': {
      // Black-Purple -> Magenta -> Coral -> Pale Yellow
      if (t < 0.5) {
        const u = t / 0.5;
        return [0.1 + u * 0.6, 0.05 + u * 0.1, 0.3 + u * 0.2];
      } else {
        const u = (t - 0.5) / 0.5;
        return [0.7 + u * 0.28, 0.15 + u * 0.75, 0.5 - u * 0.3];
      }
    }
    case 'turbo':
    default: {
      // Blue -> Cyan -> Green -> Yellow -> Red
      if (t < 0.25) {
        const u = t / 0.25;
        return [0.18 - u * 0.15, 0.19 + u * 0.55, 0.78 + u * 0.2];
      } else if (t < 0.5) {
        const u = (t - 0.25) / 0.25;
        return [0.03 + u * 0.3, 0.74 + u * 0.24, 0.98 - u * 0.7];
      } else if (t < 0.75) {
        const u = (t - 0.5) / 0.25;
        return [0.33 + u * 0.62, 0.98 - u * 0.25, 0.28 - u * 0.25];
      } else {
        const u = (t - 0.75) / 0.25;
        return [0.95 + u * 0.05, 0.73 - u * 0.6, 0.03];
      }
    }
  }
}

export const Grapher3D: React.FC<Grapher3DProps> = ({ onSwitchTo2D }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Math Expression State
  const [expression, setExpression] = useState<string>('sin(sqrt(x^2 + y^2)) / (sqrt(x^2 + y^2) + 0.001)');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Range and scaling
  const [xMin, setXMin] = useState<number>(-8);
  const [xMax, setXMax] = useState<number>(8);
  const [yMin, setYMin] = useState<number>(-8);
  const [yMax, setYMax] = useState<number>(8);
  const [zScale, setZScale] = useState<number>(2.5);
  const [resolution, setResolution] = useState<number>(55); // grid steps

  // Visual appearance
  const [palette, setPalette] = useState<ColorPalette>('cyan-amber');
  const [renderStyle, setRenderStyle] = useState<RenderStyle>('surface-wire');
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [showAxes, setShowAxes] = useState<boolean>(true);
  const [showBoundingBox, setShowBoundingBox] = useState<boolean>(true);

  // Hover coordinate inspection
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; z: number } | null>(null);

  // Three.js internal references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const meshGroupRef = useRef<THREE.Group | null>(null);
  const axesGroupRef = useRef<THREE.Group | null>(null);
  const boxGroupRef = useRef<THREE.Group | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseVecRef = useRef<THREE.Vector2>(new THREE.Vector2());

  // 1. Initialize Scene & Renderer
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // Create Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070b14); // Deep slate background
    sceneRef.current = scene;

    // Create Camera
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(16, 14, 18);
    cameraRef.current = camera;

    // Create Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    // Orbit Controls
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 1.2;
    controls.maxDistance = 80;
    controls.minDistance = 3;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.85);
    dirLight1.position.set(15, 25, 20);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 0.45); // Cyan rim light
    dirLight2.position.set(-15, -10, -15);
    scene.add(dirLight2);

    // Groups for modular updates
    const meshGroup = new THREE.Group();
    scene.add(meshGroup);
    meshGroupRef.current = meshGroup;

    const axesGroup = new THREE.Group();
    scene.add(axesGroup);
    axesGroupRef.current = axesGroup;

    const boxGroup = new THREE.Group();
    scene.add(boxGroup);
    boxGroupRef.current = boxGroup;

    // Render loop
    const animate = () => {
      animationFrameId.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize Observer for fluid responsiveness
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 0 && h > 0) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
      }
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      controls.dispose();
      renderer.dispose();
    };
  }, []);

  // Update autoRotate on controls
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
    }
  }, [autoRotate]);

  // 2. Build or Rebuild 3D Surface Mesh
  const buildSurface = useCallback(() => {
    const meshGroup = meshGroupRef.current;
    if (!meshGroup) return;

    // Clear previous children
    while (meshGroup.children.length > 0) {
      const child = meshGroup.children[0];
      meshGroup.remove(child);
      if ('geometry' in child && child.geometry instanceof THREE.BufferGeometry) {
        child.geometry.dispose();
      }
    }

    // Compile formula
    let compiled: math.EvalFunction;
    try {
      const sanitized = preprocessExpression(expression);
      compiled = math.compile(sanitized);
      // Test evaluation
      compiled.evaluate({ x: 0, y: 0, pi: Math.PI, e: Math.E });
      setErrorMsg(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error de sintaxis en z = f(x, y)';
      setErrorMsg(msg);
      return;
    }

    const N = Math.max(15, Math.min(100, resolution));
    const xRange = xMax - xMin;
    const yRange = yMax - yMin;

    const positions: number[] = [];
    const colors: number[] = [];
    const indices: number[] = [];
    const rawZValues: number[] = [];

    // Evaluate grid points
    let minZ = Infinity;
    let maxZ = -Infinity;

    for (let j = 0; j <= N; j++) {
      const v = j / N;
      const yVal = yMin + v * yRange;

      for (let i = 0; i <= N; i++) {
        const u = i / N;
        const xVal = xMin + u * xRange;

        let zVal = 0;
        try {
          const evalZ = compiled.evaluate({
            x: xVal,
            y: yVal,
            pi: Math.PI,
            e: Math.E,
            sin: Math.sin,
            cos: Math.cos,
            tan: Math.tan,
            sqrt: Math.sqrt,
            abs: Math.abs,
            exp: Math.exp,
            ln: Math.log,
            log: Math.log10,
          });

          if (typeof evalZ === 'number' && isFinite(evalZ)) {
            zVal = evalZ;
          } else {
            zVal = 0;
          }
        } catch {
          zVal = 0;
        }

        // Clamp extreme asymptote spikes
        if (zVal > 50) zVal = 50;
        if (zVal < -50) zVal = -50;

        rawZValues.push(zVal);
        if (zVal < minZ) minZ = zVal;
        if (zVal > maxZ) maxZ = zVal;
      }
    }

    const zSpan = maxZ - minZ === 0 ? 1 : maxZ - minZ;

    // Build geometry buffers
    // In Three.js: X is horizontal, Y is UP (we map scaled z to Y), and Z is depth (we map yVal to Z)
    // To normalize visual footprint to around ~12 units in X and Z:
    const scaleFactorX = 12 / (xRange || 1);
    const scaleFactorY = 12 / (yRange || 1);

    for (let j = 0; j <= N; j++) {
      const v = j / N;
      const yVal = yMin + v * yRange;

      for (let i = 0; i <= N; i++) {
        const u = i / N;
        const xVal = xMin + u * xRange;
        const index = j * (N + 1) + i;
        const zVal = rawZValues[index];

        const posX = (xVal - (xMin + xMax) / 2) * scaleFactorX;
        const posY = (zVal * zScale * 6) / zSpan; // mapped to Three.js Y up
        const posZ = (yVal - (yMin + yMax) / 2) * scaleFactorY;

        positions.push(posX, posY, posZ);

        // Color mapped by z ratio
        const ratio = (zVal - minZ) / zSpan;
        const [r, g, b] = getColorForRatio(ratio, palette);
        colors.push(r, g, b);
      }
    }

    // Triangles
    for (let j = 0; j < N; j++) {
      for (let i = 0; i < N; i++) {
        const row1 = j * (N + 1);
        const row2 = (j + 1) * (N + 1);

        // Triangle 1
        indices.push(row1 + i, row2 + i, row1 + i + 1);
        // Triangle 2
        indices.push(row1 + i + 1, row2 + i, row2 + i + 1);
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    // Attach raw coordinate metadata to user data for Raycaster hover
    geometry.userData = {
      xMin,
      xMax,
      yMin,
      yMax,
      minZ,
      maxZ,
      rawZValues,
      N,
    };

    if (renderStyle === 'points') {
      const pMaterial = new THREE.PointsMaterial({
        size: 0.18,
        vertexColors: true,
      });
      const points = new THREE.Points(geometry, pMaterial);
      meshGroup.add(points);
    } else if (renderStyle === 'wireframe') {
      const wMaterial = new THREE.MeshBasicMaterial({
        wireframe: true,
        vertexColors: true,
      });
      const wireMesh = new THREE.Mesh(geometry, wMaterial);
      meshGroup.add(wireMesh);
    } else {
      // Solid Surface with Lighting
      const material = new THREE.MeshStandardMaterial({
        vertexColors: true,
        side: THREE.DoubleSide,
        roughness: 0.35,
        metalness: 0.25,
        flatShading: renderStyle === 'surface-wire',
      });

      const surfaceMesh = new THREE.Mesh(geometry, material);
      surfaceMesh.name = 'surfaceMesh';
      meshGroup.add(surfaceMesh);

      // Add delicate wireframe overlay if 'surface-wire'
      if (renderStyle === 'surface-wire') {
        const wireframeMat = new THREE.MeshBasicMaterial({
          color: 0x020617,
          wireframe: true,
          transparent: true,
          opacity: 0.3,
        });
        const wireOverlay = new THREE.Mesh(geometry, wireframeMat);
        meshGroup.add(wireOverlay);
      }
    }

    // Build Bounding Box & Floor Grid
    updateSceneDecorations();
  }, [
    expression,
    xMin,
    xMax,
    yMin,
    yMax,
    zScale,
    resolution,
    palette,
    renderStyle,
    showAxes,
    showBoundingBox,
  ]);

  // 3. Update Axes and Bounding Box
  const updateSceneDecorations = useCallback(() => {
    const axesGroup = axesGroupRef.current;
    const boxGroup = boxGroupRef.current;
    if (!axesGroup || !boxGroup) return;

    // Clear previous
    while (axesGroup.children.length > 0) axesGroup.remove(axesGroup.children[0]);
    while (boxGroup.children.length > 0) boxGroup.remove(boxGroup.children[0]);

    if (showAxes) {
      // 3D Coordinate Arrows (X=Red/Cyan, Y_up=Green/Height, Z_depth=Blue)
      const origin = new THREE.Vector3(-7, -4, -7);
      const length = 3.5;

      const dirX = new THREE.Vector3(1, 0, 0);
      const arrowX = new THREE.ArrowHelper(dirX, origin, length, 0x38bdf8, 0.6, 0.3);
      axesGroup.add(arrowX);

      const dirY = new THREE.Vector3(0, 1, 0); // represents mathematical Z height
      const arrowY = new THREE.ArrowHelper(dirY, origin, length, 0xf59e0b, 0.6, 0.3);
      axesGroup.add(arrowY);

      const dirZ = new THREE.Vector3(0, 0, 1); // represents mathematical Y
      const arrowZ = new THREE.ArrowHelper(dirZ, origin, length, 0x10b981, 0.6, 0.3);
      axesGroup.add(arrowZ);

      // Add floor grid
      const grid = new THREE.GridHelper(14, 14, 0x334155, 0x1e293b);
      grid.position.y = -4;
      axesGroup.add(grid);
    }

    if (showBoundingBox) {
      const boxGeo = new THREE.BoxGeometry(14, 8, 14);
      const wireGeo = new THREE.WireframeGeometry(boxGeo);
      const boxMat = new THREE.LineBasicMaterial({
        color: 0x334155,
        transparent: true,
        opacity: 0.35,
      });
      const boxLines = new THREE.LineSegments(wireGeo, boxMat);
      boxGroup.add(boxLines);
    }
  }, [showAxes, showBoundingBox]);

  // Re-build surface when math parameters change
  useEffect(() => {
    buildSurface();
  }, [buildSurface]);

  // 4. Raycaster Mouse Inspection
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const camera = cameraRef.current;
    const scene = sceneRef.current;
    if (!canvas || !camera || !scene) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

    mouseVecRef.current.set(x, y);
    raycasterRef.current.setFromCamera(mouseVecRef.current, camera);

    const surface = scene.getObjectByName('surfaceMesh');
    if (!surface) {
      setHoveredPoint(null);
      return;
    }

    const intersects = raycasterRef.current.intersectObject(surface);
    if (intersects.length > 0) {
      const pt = intersects[0].point;
      // Reverse map Three coordinates to user (x, y, z)
      const scaleFactorX = 12 / (xMax - xMin || 1);
      const scaleFactorY = 12 / (yMax - yMin || 1);

      const realX = pt.x / scaleFactorX + (xMin + xMax) / 2;
      const realY = pt.z / scaleFactorY + (yMin + yMax) / 2;

      // Evaluate z
      try {
        const sanitized = preprocessExpression(expression);
        const compiled = math.compile(sanitized);
        const realZ = compiled.evaluate({ x: realX, y: realY });
        if (typeof realZ === 'number' && isFinite(realZ)) {
          setHoveredPoint({ x: realX, y: realY, z: realZ });
          return;
        }
      } catch {
        // ignore
      }
    }
    setHoveredPoint(null);
  };

  // Reset Camera View
  const handleResetCamera = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(16, 14, 18);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  };

  // Export 3D Render as PNG
  const handleExportPNG = () => {
    const canvas = canvasRef.current;
    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    if (!canvas || !renderer || !scene || !camera) return;

    try {
      renderer.render(scene, camera);
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `grafica-3d-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      // ignore
    }
  };

  // Load Preset
  const handleLoadPreset = (preset: Preset3D) => {
    setExpression(preset.expr);
    setXMin(preset.xRange[0]);
    setXMax(preset.xRange[1]);
    setYMin(preset.yRange[0]);
    setYMax(preset.yRange[1]);
    setZScale(preset.zScale);
  };

  return (
    <div className="w-full flex flex-col gap-3 animate-in fade-in duration-200">
      {/* Top Bar: Switcher 2D / 3D and Formula Input */}
      <div className="bg-slate-900 border border-slate-800 p-3 sm:p-4 rounded-2xl shadow-xl flex flex-col gap-3">
        {/* Navigation Switcher & Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Box className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                Graficador Tridimensional 3D
                <span className="text-[10px] font-mono uppercase bg-cyan-950 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-800/60">
                  WebGL
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Visualizador de superficies analíticas en el espacio: <code className="text-cyan-300 font-mono">z = f(x, y)</code>
              </p>
            </div>
          </div>

          {/* Quick toggle 2D / 3D */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {onSwitchTo2D && (
              <button
                onClick={onSwitchTo2D}
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-850 rounded-lg transition-colors"
                title="Cambiar a Graficador 2D"
              >
                <LineChart className="w-3.5 h-3.5" />
                <span>Modo 2D: y = f(x)</span>
              </button>
            )}
            <button
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-cyan-400 bg-slate-800 rounded-lg border border-slate-700 shadow-xs"
              title="Modo 3D activo"
            >
              <Box className="w-3.5 h-3.5 text-cyan-400" />
              <span>Modo 3D: z = f(x, y)</span>
            </button>
          </div>
        </div>

        {/* Formula Input */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="flex-1 flex items-center gap-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 focus-within:border-cyan-500/80 transition-colors">
            <span className="text-cyan-400 font-mono font-semibold text-sm">z =</span>
            <input
              type="text"
              value={expression}
              onChange={e => setExpression(e.target.value)}
              placeholder="p. ej. sin(sqrt(x^2 + y^2)) o (x^2 - y^2)/4"
              className="flex-1 bg-transparent text-sm font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none"
            />
            {errorMsg ? (
              <span className="flex items-center gap-1 text-xs text-rose-400" title={errorMsg}>
                <AlertCircle className="w-4 h-4" />
                <span className="hidden md:inline font-mono text-[11px]">Sintaxis inválida</span>
              </span>
            ) : (
              <span className="text-emerald-400 flex items-center gap-1 text-xs" title="Fórmula válida">
                <Check className="w-4 h-4" />
              </span>
            )}
          </div>

          <button
            onClick={() => buildSurface()}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs rounded-xl shadow transition-colors flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Graficar</span>
          </button>
        </div>

        {/* Preset surfaces */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
          <span className="text-slate-500 text-[11px] font-medium shrink-0 flex items-center gap-1">
            <Sliders className="w-3 h-3" /> Plantillas:
          </span>
          {PRESETS_3D.map(p => (
            <button
              key={p.label}
              onClick={() => handleLoadPreset(p)}
              className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-slate-700 whitespace-nowrap text-[11px] transition-colors shrink-0 font-medium"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main 3D Canvas Stage */}
      <div className="relative w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
        {/* Three.js Container */}
        <div
          ref={containerRef}
          className="w-full h-[460px] sm:h-[540px] md:h-[600px] cursor-grab active:cursor-grabbing relative"
        >
          <canvas
            ref={canvasRef}
            onPointerMove={handlePointerMove}
            onPointerLeave={() => setHoveredPoint(null)}
            className="w-full h-full block touch-none"
          />

          {/* Floating Canvas Action Overlay */}
          <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5 bg-slate-900/85 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 shadow-xl">
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              title={autoRotate ? 'Pausar auto-rotación' : 'Activar auto-rotación orbital'}
              className={`p-2 rounded-lg transition-colors ${
                autoRotate
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
              }`}
            >
              {autoRotate ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            <button
              onClick={handleResetCamera}
              title="Restablecer posición de cámara 3D"
              className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={handleExportPNG}
              title="Exportar captura de la gráfica 3D en PNG"
              className="p-2 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>

            <div className="h-px w-full bg-slate-800 my-0.5" />

            <button
              onClick={() => setShowAxes(!showAxes)}
              title={showAxes ? 'Ocultar ejes tridimensionales' : 'Mostrar ejes X, Y, Z'}
              className={`p-2 rounded-lg transition-colors ${
                showAxes
                  ? 'text-cyan-400 bg-slate-800'
                  : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>

          {/* Real-time Coordinate Inspection Badge */}
          {hoveredPoint && (
            <div className="absolute top-3 left-3 z-10 bg-slate-900/90 backdrop-blur-md border border-cyan-500/50 px-3 py-1.5 rounded-xl shadow-lg font-mono text-xs text-slate-200 animate-in fade-in">
              <div className="text-[10px] uppercase text-cyan-400 font-semibold mb-0.5">Punto en Superficie</div>
              <div className="flex items-center gap-3">
                <span>
                  <strong className="text-cyan-400">x:</strong> {hoveredPoint.x.toFixed(2)}
                </span>
                <span>
                  <strong className="text-emerald-400">y:</strong> {hoveredPoint.y.toFixed(2)}
                </span>
                <span>
                  <strong className="text-amber-400">z:</strong> {hoveredPoint.z.toFixed(3)}
                </span>
              </div>
            </div>
          )}

          {/* Coordinate Guide Legend (bottom left) */}
          <div className="absolute bottom-3 left-3 z-10 bg-slate-900/85 backdrop-blur-xs px-2.5 py-1.5 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400" /> Eje X
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> Eje Y
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> Altura Z
            </span>
          </div>

          {/* Mouse Gestures Hint (bottom right) */}
          <div className="absolute bottom-3 right-3 z-10 hidden sm:block bg-slate-900/80 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-slate-800 text-[10px] text-slate-500 font-medium">
            Arrastrar: Rotar 3D • Rueda: Zoom • Clic Der: Desplazar
          </div>
        </div>

        {/* Surface Appearance & Range Controls Bar */}
        <div className="border-t border-slate-800 bg-slate-900/95 p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs text-slate-300">
          {/* 1. Shading Style */}
          <div className="space-y-1.5">
            <label className="text-slate-400 font-medium flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-cyan-400" /> Estilo de Render
            </label>
            <div className="grid grid-cols-2 gap-1 font-mono text-[11px]">
              <button
                onClick={() => setRenderStyle('surface-wire')}
                className={`py-1.5 px-2 rounded-lg border text-center transition-colors ${
                  renderStyle === 'surface-wire'
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                Malla + Sólido
              </button>
              <button
                onClick={() => setRenderStyle('smooth')}
                className={`py-1.5 px-2 rounded-lg border text-center transition-colors ${
                  renderStyle === 'smooth'
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                Superficie Lisa
              </button>
              <button
                onClick={() => setRenderStyle('wireframe')}
                className={`py-1.5 px-2 rounded-lg border text-center transition-colors ${
                  renderStyle === 'wireframe'
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                Sólo Malla
              </button>
              <button
                onClick={() => setRenderStyle('points')}
                className={`py-1.5 px-2 rounded-lg border text-center transition-colors ${
                  renderStyle === 'points'
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                Puntos 3D
              </button>
            </div>
          </div>

          {/* 2. Color Palette */}
          <div className="space-y-1.5">
            <label className="text-slate-400 font-medium flex items-center gap-1">
              <Palette className="w-3.5 h-3.5 text-cyan-400" /> Paleta de Colores
            </label>
            <div className="grid grid-cols-2 gap-1 font-mono text-[11px]">
              <button
                onClick={() => setPalette('cyan-amber')}
                className={`py-1.5 px-2 rounded-lg border text-center transition-colors ${
                  palette === 'cyan-amber'
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                Cian / Ámbar
              </button>
              <button
                onClick={() => setPalette('turbo')}
                className={`py-1.5 px-2 rounded-lg border text-center transition-colors ${
                  palette === 'turbo'
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                Térmico Turbo
              </button>
              <button
                onClick={() => setPalette('viridis')}
                className={`py-1.5 px-2 rounded-lg border text-center transition-colors ${
                  palette === 'viridis'
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                Viridis
              </button>
              <button
                onClick={() => setPalette('magma')}
                className={`py-1.5 px-2 rounded-lg border text-center transition-colors ${
                  palette === 'magma'
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                Magma
              </button>
            </div>
          </div>

          {/* 3. Range X & Y */}
          <div className="space-y-1.5">
            <label className="text-slate-400 font-medium">Dominio [X, Y]</label>
            <div className="flex items-center gap-2 font-mono text-xs">
              <div className="flex-1 flex items-center gap-1 bg-slate-950 px-2 py-1.5 rounded-lg border border-slate-800">
                <span className="text-slate-500">X:</span>
                <input
                  type="number"
                  value={xMin}
                  onChange={e => setXMin(Number(e.target.value))}
                  className="w-9 bg-transparent text-slate-200 text-center focus:outline-none"
                />
                <span className="text-slate-600">a</span>
                <input
                  type="number"
                  value={xMax}
                  onChange={e => setXMax(Number(e.target.value))}
                  className="w-9 bg-transparent text-slate-200 text-center focus:outline-none"
                />
              </div>

              <div className="flex-1 flex items-center gap-1 bg-slate-950 px-2 py-1.5 rounded-lg border border-slate-800">
                <span className="text-slate-500">Y:</span>
                <input
                  type="number"
                  value={yMin}
                  onChange={e => setYMin(Number(e.target.value))}
                  className="w-9 bg-transparent text-slate-200 text-center focus:outline-none"
                />
                <span className="text-slate-600">a</span>
                <input
                  type="number"
                  value={yMax}
                  onChange={e => setYMax(Number(e.target.value))}
                  className="w-9 bg-transparent text-slate-200 text-center focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 4. Vertical Z Scale & Resolution */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-slate-400 font-medium">
              <span>Resolución de Malla</span>
              <span className="font-mono text-cyan-400 text-[11px]">{resolution}×{resolution}</span>
            </div>
            <input
              type="range"
              min="20"
              max="90"
              step="5"
              value={resolution}
              onChange={e => setResolution(Number(e.target.value))}
              className="w-full accent-cyan-400 bg-slate-800 rounded-lg cursor-pointer h-1.5"
            />

            <div className="flex items-center justify-between pt-1">
              <span className="text-slate-400 font-medium">Escala Altura Z</span>
              <div className="flex items-center gap-1 font-mono text-[11px]">
                {[0.5, 1, 1.8, 2.5].map(scale => (
                  <button
                    key={scale}
                    onClick={() => setZScale(scale)}
                    className={`px-1.5 py-0.5 rounded border transition-colors ${
                      zScale === scale
                        ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                        : 'bg-slate-950 text-slate-500 border-slate-800'
                    }`}
                  >
                    {scale}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
