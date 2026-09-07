import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Plus, Trash2, Eye, EyeOff, Crosshair, Download, Box, LineChart } from 'lucide-react';
import * as math from 'mathjs';
import { GraphFunction } from '../types';
import { preprocessExpression } from '../utils/mathEngine';

interface Grapher2DProps {
  onSwitchTo3D?: () => void;
}

const DEFAULT_FUNCTIONS: GraphFunction[] = [
  { id: '1', name: 'f₁(x)', expression: 'sin(x)', color: '#38bdf8', visible: true },
  { id: '2', name: 'f₂(x)', expression: '0.2 * x^2 - 2', color: '#f59e0b', visible: true },
];

const PRESETS = [
  { label: 'Onda Seno', expr: 'sin(x)' },
  { label: 'Parábola', expr: 'x^2 - 4' },
  { label: 'Cúbica', expr: 'x^3 - 3*x' },
  { label: 'Gaussiana (Campana)', expr: '3 * e^(-x^2)' },
  { label: 'Amortiguada', expr: '2 * e^(-0.2*x) * cos(2*x)' },
  { label: 'Racional', expr: '1 / x' },
  { label: 'Valor Absoluto', expr: 'abs(x) - 3' },
];

export const Grapher2D: React.FC<Grapher2DProps> = ({ onSwitchTo3D }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [functions, setFunctions] = useState<GraphFunction[]>(DEFAULT_FUNCTIONS);
  const [viewState, setViewState] = useState({
    xMin: -10,
    xMax: 10,
    yMin: -6,
    yMax: 6,
  });

  const [mouseCoord, setMouseCoord] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [rootsFound, setRootsFound] = useState<{ expr: string; x: number }[]>([]);

  // Function evaluation cache
  const compiledFuncs = useRef<Map<string, math.EvalFunction>>(new Map());

  // Recompile functions when expressions change
  useEffect(() => {
    compiledFuncs.current.clear();
    functions.forEach(fn => {
      try {
        const sanitized = preprocessExpression(fn.expression);
        const compiled = math.compile(sanitized);
        compiledFuncs.current.set(fn.id, compiled);
      } catch {
        // Syntax error or incomplete formula
      }
    });
  }, [functions]);

  // Handle Canvas Drawing
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.fillStyle = '#090d16'; // Deep slate dark
    ctx.fillRect(0, 0, width, height);

    const { xMin, xMax, yMin, yMax } = viewState;
    const xRange = xMax - xMin;
    const yRange = yMax - yMin;

    const toScreenX = (x: number) => ((x - xMin) / xRange) * width;
    const toScreenY = (y: number) => height - ((y - yMin) / yRange) * height;

    // Draw Grid Lines
    const getGridStep = (range: number) => {
      const rough = range / 10;
      const magnitude = Math.pow(10, Math.floor(Math.log10(rough)));
      const normalized = rough / magnitude;
      if (normalized < 2) return 1 * magnitude;
      if (normalized < 5) return 2 * magnitude;
      return 5 * magnitude;
    };

    const xStep = getGridStep(xRange);
    const yStep = getGridStep(yRange);

    // Minor/Major grid lines
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#1e293b'; // slate-800
    ctx.fillStyle = '#64748b'; // slate-500
    ctx.font = '10px ui-monospace, SFMono-Regular, monospace';

    // Vertical lines & X labels
    const startX = Math.floor(xMin / xStep) * xStep;
    for (let x = startX; x <= xMax; x += xStep) {
      const sx = toScreenX(x);
      ctx.beginPath();
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, height);
      ctx.stroke();

      if (Math.abs(x) > 1e-9) {
        const sy = toScreenY(0);
        const labelY = Math.max(14, Math.min(height - 6, sy + 14));
        ctx.fillText(x.toFixed(xStep < 1 ? 2 : 0), sx + 3, labelY);
      }
    }

    // Horizontal lines & Y labels
    const startY = Math.floor(yMin / yStep) * yStep;
    for (let y = startY; y <= yMax; y += yStep) {
      const sy = toScreenY(y);
      ctx.beginPath();
      ctx.moveTo(0, sy);
      ctx.lineTo(width, sy);
      ctx.stroke();

      if (Math.abs(y) > 1e-9) {
        const sx = toScreenX(0);
        const labelX = Math.max(4, Math.min(width - 32, sx + 4));
        ctx.fillText(y.toFixed(yStep < 1 ? 2 : 0), labelX, sy - 3);
      }
    }

    // Draw Axes (X and Y = 0)
    ctx.strokeStyle = '#475569'; // slate-600
    ctx.lineWidth = 2;

    const originX = toScreenX(0);
    const originY = toScreenY(0);

    // X Axis
    if (originY >= 0 && originY <= height) {
      ctx.beginPath();
      ctx.moveTo(0, originY);
      ctx.lineTo(width, originY);
      ctx.stroke();
    }

    // Y Axis
    if (originX >= 0 && originX <= width) {
      ctx.beginPath();
      ctx.moveTo(originX, 0);
      ctx.lineTo(originX, height);
      ctx.stroke();
    }

    // Plot Functions
    functions.forEach(fn => {
      if (!fn.visible) return;
      const compiled = compiledFuncs.current.get(fn.id);
      if (!compiled) return;

      ctx.strokeStyle = fn.color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();

      let isDrawing = false;
      const step = 1; // 1 pixel resolution for crisp, smooth rendering

      for (let sx = 0; sx <= width; sx += step) {
        const xVal = xMin + (sx / width) * xRange;
        try {
          const yVal = compiled.evaluate({ x: xVal, pi: Math.PI, e: Math.E });
          if (typeof yVal === 'number' && isFinite(yVal)) {
            const sy = toScreenY(yVal);
            // Check for massive discontinuities (e.g. tan(x), 1/x)
            if (sy < -height * 2 || sy > height * 3) {
              isDrawing = false;
            } else {
              if (!isDrawing) {
                ctx.moveTo(sx, sy);
                isDrawing = true;
              } else {
                ctx.lineTo(sx, sy);
              }
            }
          } else {
            isDrawing = false;
          }
        } catch {
          isDrawing = false;
        }
      }
      ctx.stroke();
    });

    // Plot Roots if computed
    if (rootsFound.length > 0) {
      rootsFound.forEach(root => {
        const rx = toScreenX(root.x);
        const ry = toScreenY(0);
        if (rx >= 0 && rx <= width) {
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(rx, ry, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.fillStyle = '#f87171';
          ctx.fillText(`x ≈ ${root.x.toFixed(3)}`, rx + 6, ry - 6);
        }
      });
    }

    // Crosshair tracer if hovering
    if (mouseCoord) {
      const mx = toScreenX(mouseCoord.x);
      const my = toScreenY(mouseCoord.y);

      ctx.strokeStyle = '#38bdf844';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1;

      // Vertical line
      ctx.beginPath();
      ctx.moveTo(mx, 0);
      ctx.lineTo(mx, height);
      ctx.stroke();

      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(0, my);
      ctx.lineTo(width, my);
      ctx.stroke();
      ctx.setLineDash([]);

      // Point dots on curves
      functions.forEach(fn => {
        if (!fn.visible) return;
        const compiled = compiledFuncs.current.get(fn.id);
        if (!compiled) return;

        try {
          const yVal = compiled.evaluate({ x: mouseCoord.x, pi: Math.PI, e: Math.E });
          if (typeof yVal === 'number' && isFinite(yVal)) {
            const sy = toScreenY(yVal);
            if (sy >= 0 && sy <= height) {
              ctx.fillStyle = fn.color;
              ctx.beginPath();
              ctx.arc(mx, sy, 4.5, 0, Math.PI * 2);
              ctx.fill();
              ctx.strokeStyle = '#ffffff';
              ctx.lineWidth = 1.5;
              ctx.stroke();
            }
          }
        } catch {
          // Ignore
        }
      });
    }
  }, [viewState, functions, mouseCoord, rootsFound]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight || 420;
      draw();
    };

    const observer = new ResizeObserver(handleResize);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    handleResize();

    return () => observer.disconnect();
  }, [draw]);

  useEffect(() => {
    draw();
  }, [draw]);

  // Mouse drag to Pan
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const { xMin, xMax, yMin, yMax } = viewState;
    const mathX = xMin + (px / canvas.width) * (xMax - xMin);
    const mathY = yMax - (py / canvas.height) * (yMax - yMin);

    setMouseCoord({ x: mathX, y: mathY });

    if (isDragging && dragStart) {
      const dxPixels = e.clientX - dragStart.x;
      const dyPixels = e.clientY - dragStart.y;

      const dxMath = (dxPixels / canvas.width) * (xMax - xMin);
      const dyMath = (dyPixels / canvas.height) * (yMax - yMin);

      setViewState(prev => ({
        xMin: prev.xMin - dxMath,
        xMax: prev.xMax - dxMath,
        yMin: prev.yMin + dyMath,
        yMax: prev.yMax + dyMath,
      }));

      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  // Mouse wheel to Zoom
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const zoomFactor = e.deltaY > 0 ? 1.15 : 0.85;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const { xMin, xMax, yMin, yMax } = viewState;
    const cursorX = xMin + (px / canvas.width) * (xMax - xMin);
    const cursorY = yMax - (py / canvas.height) * (yMax - yMin);

    setViewState({
      xMin: cursorX - (cursorX - xMin) * zoomFactor,
      xMax: cursorX + (xMax - cursorX) * zoomFactor,
      yMin: cursorY - (cursorY - yMin) * zoomFactor,
      yMax: cursorY + (yMax - cursorY) * zoomFactor,
    });
  };

  const zoom = (factor: number) => {
    setViewState(prev => {
      const xMid = (prev.xMin + prev.xMax) / 2;
      const yMid = (prev.yMin + prev.yMax) / 2;
      const xSpan = (prev.xMax - prev.xMin) * factor;
      const ySpan = (prev.yMax - prev.yMin) * factor;
      return {
        xMin: xMid - xSpan / 2,
        xMax: xMid + xSpan / 2,
        yMin: yMid - ySpan / 2,
        yMax: yMid + ySpan / 2,
      };
    });
  };

  const resetZoom = () => {
    setViewState({ xMin: -10, xMax: 10, yMin: -6, yMax: 6 });
    setRootsFound([]);
  };

  // Find visible roots
  const handleFindRoots = () => {
    const visibleFunc = functions.find(f => f.visible);
    if (!visibleFunc) return;

    const compiled = compiledFuncs.current.get(visibleFunc.id);
    if (!compiled) return;

    const found: { expr: string; x: number }[] = [];
    const samples = 400;
    const { xMin, xMax } = viewState;
    const step = (xMax - xMin) / samples;

    let prevY: number | null = null;
    let prevX = xMin;

    for (let i = 0; i <= samples; i++) {
      const x = xMin + i * step;
      try {
        const y = compiled.evaluate({ x, pi: Math.PI, e: Math.E });
        if (typeof y === 'number' && isFinite(y)) {
          if (prevY !== null && Math.sign(y) !== Math.sign(prevY) && Math.abs(y - prevY) < 50) {
            // Root bracket between prevX and x; refine with bisection
            let a = prevX;
            let b = x;
            for (let k = 0; k < 20; k++) {
              const mid = (a + b) / 2;
              const midY = compiled.evaluate({ x: mid, pi: Math.PI, e: Math.E });
              if (Math.sign(midY) === Math.sign(prevY)) {
                a = mid;
              } else {
                b = mid;
              }
            }
            const rootX = (a + b) / 2;
            if (!found.some(r => Math.abs(r.x - rootX) < 0.1)) {
              found.push({ expr: visibleFunc.expression, x: rootX });
            }
          }
          prevY = y;
          prevX = x;
        } else {
          prevY = null;
        }
      } catch {
        prevY = null;
      }
    }

    setRootsFound(found);
  };

  const exportGraphImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const link = document.createElement('a');
      link.download = `grafico-matematico-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch {
      // ignore
    }
  };

  const addFunction = () => {
    if (functions.length >= 4) return;
    const colors = ['#38bdf8', '#f59e0b', '#10b981', '#ec4899'];
    const newColor = colors[functions.length % colors.length];
    const newId = String(Date.now());
    setFunctions([
      ...functions,
      { id: newId, name: `f${functions.length + 1}(x)`, expression: 'x', color: newColor, visible: true },
    ]);
  };

  const updateFunctionExpr = (id: string, expr: string) => {
    setFunctions(functions.map(f => (f.id === id ? { ...f, expression: expr } : f)));
  };

  const toggleFunctionVisibility = (id: string) => {
    setFunctions(functions.map(f => (f.id === id ? { ...f, visible: !f.visible } : f)));
  };

  const removeFunction = (id: string) => {
    if (functions.length <= 1) return;
    setFunctions(functions.filter(f => f.id !== id));
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Top Functions Manager */}
      <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex flex-col gap-3">
        {/* Navigation Switcher & Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <LineChart className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                Graficador Bidimensional 2D
              </h2>
              <p className="text-xs text-slate-400">
                Trazado de curvas continuas en el plano cartesiano: <code className="text-cyan-300 font-mono">y = f(x)</code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-cyan-400 bg-slate-800 rounded-lg border border-slate-700 shadow-xs"
              title="Modo 2D activo"
            >
              <LineChart className="w-3.5 h-3.5 text-cyan-400" />
              <span>Modo 2D: y = f(x)</span>
            </button>
            {onSwitchTo3D && (
              <button
                onClick={onSwitchTo3D}
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-850 rounded-lg transition-colors"
                title="Cambiar a Graficador 3D"
              >
                <Box className="w-3.5 h-3.5" />
                <span>Modo 3D: z = f(x, y)</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-200">Funciones Matemáticas f(x)</span>
            <span className="text-[10px] text-slate-400 font-mono">
              (Usa la variable x, e.g. sin(x), x^2, e^x)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick presets */}
            <select
              onChange={e => {
                if (e.target.value && functions[0]) {
                  updateFunctionExpr(functions[0].id, e.target.value);
                }
              }}
              className="text-xs bg-slate-950 text-slate-300 border border-slate-700/80 rounded-lg px-2.5 py-1"
              defaultValue=""
            >
              <option value="" disabled>
                Cargar plantilla...
              </option>
              {PRESETS.map((p, idx) => (
                <option key={idx} value={p.expr}>
                  {p.label}: {p.expr}
                </option>
              ))}
            </select>

            {functions.length < 4 && (
              <button
                onClick={addFunction}
                className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Añadir f(x)</span>
              </button>
            )}
          </div>
        </div>

        {/* Function Inputs List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {functions.map(fn => (
            <div
              key={fn.id}
              className="flex items-center gap-2 bg-slate-950 p-2 rounded-lg border border-slate-800"
            >
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: fn.color }}
              />
              <span className="text-xs font-mono font-bold text-slate-300 shrink-0">
                {fn.name} =
              </span>
              <input
                type="text"
                value={fn.expression}
                onChange={e => updateFunctionExpr(fn.id, e.target.value)}
                placeholder="e.g. sin(x)"
                className="flex-1 bg-transparent text-xs font-mono text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 px-1 rounded"
              />
              <button
                onClick={() => toggleFunctionVisibility(fn.id)}
                title={fn.visible ? 'Ocultar gráfica' : 'Mostrar gráfica'}
                className="p-1 text-slate-400 hover:text-slate-200"
              >
                {fn.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 opacity-40" />}
              </button>
              {functions.length > 1 && (
                <button
                  onClick={() => removeFunction(fn.id)}
                  title="Eliminar función"
                  className="p-1 text-slate-500 hover:text-rose-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Canvas & Controls Container */}
      <div className="relative w-full bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-inner">
        {/* Canvas Element */}
        <div ref={containerRef} className="w-full h-[420px] relative">
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            className="w-full h-full cursor-crosshair block"
          />
        </div>

        {/* Floating View Controls (Zoom, Reset, Roots) */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1 rounded-lg border border-slate-800 shadow-md">
          <button
            onClick={() => zoom(0.8)}
            title="Acercar (Zoom In)"
            className="p-1.5 text-slate-300 hover:text-cyan-400 hover:bg-slate-800 rounded"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => zoom(1.25)}
            title="Alejar (Zoom Out)"
            className="p-1.5 text-slate-300 hover:text-cyan-400 hover:bg-slate-800 rounded"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={resetZoom}
            title="Restablecer plano estándar"
            className="p-1.5 text-slate-300 hover:text-cyan-400 hover:bg-slate-800 rounded"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={exportGraphImage}
            title="Exportar gráfica como imagen PNG"
            className="p-1.5 text-slate-300 hover:text-cyan-400 hover:bg-slate-800 rounded"
          >
            <Download className="w-4 h-4" />
          </button>
          <div className="h-4 w-px bg-slate-700 mx-0.5" />
          <button
            onClick={handleFindRoots}
            title="Detectar raíces f(x) = 0 visibles"
            className="px-2 py-1 text-xs font-medium text-cyan-400 bg-cyan-950/50 hover:bg-cyan-900/50 rounded flex items-center gap-1 border border-cyan-800/60"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>Raíces</span>
          </button>
        </div>

        {/* Floating Coordinates & Range Info */}
        <div className="absolute bottom-3 left-3 flex items-center gap-3 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 pointer-events-none">
          {mouseCoord ? (
            <span>
              x: <strong className="text-cyan-400">{mouseCoord.x.toFixed(3)}</strong> | y:{' '}
              <strong className="text-cyan-400">{mouseCoord.y.toFixed(3)}</strong>
            </span>
          ) : (
            <span className="text-slate-500">Pasa el cursor para rastrear coordenadas</span>
          )}
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="text-slate-500 hidden sm:inline">
            X: [{viewState.xMin.toFixed(1)}, {viewState.xMax.toFixed(1)}] Y: [{viewState.yMin.toFixed(1)}, {viewState.yMax.toFixed(1)}]
          </span>
        </div>
      </div>
    </div>
  );
};
