import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Download,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layers,
  Sparkles,
  Maximize2,
  Check,
  Tag,
  Palette,
  Crosshair,
  Award,
} from 'lucide-react';
import { OutfitItemPin, StyleReport } from '../types/stylist';

interface FashionCanvasProps {
  imageUrl: string;
  report: StyleReport;
  selectedItemId: string | null;
  onSelectItem: (id: string | null) => void;
  className?: string;
}

export const FashionCanvas: React.FC<FashionCanvasProps> = ({
  imageUrl,
  report,
  selectedItemId,
  onSelectItem,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageObjRef = useRef<HTMLImageElement | null>(null);

  // Layers toggle
  const [showPins, setShowPins] = useState(true);
  const [showColors, setShowColors] = useState(true);
  const [showGoldenRatio, setShowGoldenRatio] = useState(false);
  const [showBadge, setShowBadge] = useState(true);
  const [viewMode, setViewMode] = useState<'studio' | 'magazine'>('studio');

  // Zoom & Pan state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Hovered item for tooltip
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Load image
  useEffect(() => {
    setImageLoaded(false);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;
    img.onload = () => {
      imageObjRef.current = img;
      setImageLoaded(true);
      setZoom(1);
      setPan({ x: 0, y: 0 });
    };
  }, [imageUrl]);

  // Main Canvas Rendering
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageLoaded || !imageObjRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imageObjRef.current;
    const targetWidth = canvas.width;
    const targetHeight = canvas.height;

    ctx.clearRect(0, 0, targetWidth, targetHeight);

    // Dark sleek background
    ctx.fillStyle = '#0a0a0d';
    ctx.fillRect(0, 0, targetWidth, targetHeight);

    // Save for zoom & pan
    ctx.save();
    ctx.translate(targetWidth / 2 + pan.x, targetHeight / 2 + pan.y);
    ctx.scale(zoom, zoom);
    ctx.translate(-targetWidth / 2, -targetHeight / 2);

    // Draw main image fitted to aspect ratio
    const imgAspect = img.width / img.height;
    const canvasAspect = targetWidth / targetHeight;

    let drawW = targetWidth;
    let drawH = targetHeight;
    let drawX = 0;
    let drawY = 0;

    if (imgAspect > canvasAspect) {
      // Image is wider than canvas
      drawH = targetWidth / imgAspect;
      drawY = (targetHeight - drawH) / 2;
    } else {
      // Image is taller than canvas
      drawW = targetHeight * imgAspect;
      drawX = (targetWidth - drawW) / 2;
    }

    // Draw image shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 30;
    ctx.drawImage(img, drawX, drawY, drawW, drawH);
    ctx.shadowBlur = 0;

    // View mode: Magazine styling
    if (viewMode === 'magazine') {
      // Subtle top/bottom vignette
      const grad = ctx.createLinearGradient(0, 0, 0, targetHeight);
      grad.addColorStop(0, 'rgba(0, 0, 0, 0.65)');
      grad.addColorStop(0.2, 'rgba(0, 0, 0, 0)');
      grad.addColorStop(0.75, 'rgba(0, 0, 0, 0)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0.85)');
      ctx.fillStyle = grad;
      ctx.fillRect(drawX, drawY, drawW, drawH);

      // Editorial Masthead
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.font = '700 38px "Cormorant Garamond", Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText('AURA VOGUE REPORT', targetWidth / 2, drawY + 54);

      ctx.font = '600 11px "Plus Jakarta Sans", sans-serif';
      ctx.letterSpacing = '4px';
      ctx.fillStyle = 'rgba(212, 175, 55, 0.9)'; // Champagne gold
      ctx.fillText('HAUTE COUTURE AI STYLIST ANALYSIS', targetWidth / 2, drawY + 76);

      // Fine magazine border
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(drawX + 16, drawY + 16, drawW - 32, drawH - 32);
    }

    // Layer: Golden Ratio & Proportion Lines
    if (showGoldenRatio) {
      ctx.save();
      ctx.strokeStyle = 'rgba(234, 179, 8, 0.55)'; // Amber
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 1.5;

      // Center plumb line
      ctx.beginPath();
      ctx.moveTo(targetWidth / 2, drawY);
      ctx.lineTo(targetWidth / 2, drawY + drawH);
      ctx.stroke();

      // Golden ratio lines (0.382 and 0.618 of image height)
      const goldenY1 = drawY + drawH * 0.382;
      const goldenY2 = drawY + drawH * 0.618;

      ctx.beginPath();
      ctx.moveTo(drawX, goldenY1);
      ctx.lineTo(drawX + drawW, goldenY1);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(drawX, goldenY2);
      ctx.lineTo(drawX + drawW, goldenY2);
      ctx.stroke();

      // Labels
      ctx.setLineDash([]);
      ctx.font = '10px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = 'rgba(234, 179, 8, 0.9)';
      ctx.textAlign = 'left';
      ctx.fillText('黃金腰線 3:7 (Golden Waistline)', drawX + 14, goldenY1 - 6);
      ctx.fillText('黃金下擺比例 (Lower Golden Ratio)', drawX + 14, goldenY2 - 6);
      ctx.restore();
    }

    // Layer: Color Palette Ribbon
    if (showColors && report.colorPalette && report.colorPalette.length > 0) {
      ctx.save();
      const paletteX = drawX + 24;
      const paletteY = drawY + drawH - 64;
      const paletteH = 34;
      const totalW = Math.min(drawW - 48, 280);

      // Glass background
      ctx.fillStyle = 'rgba(10, 10, 14, 0.75)';
      ctx.beginPath();
      ctx.roundRect(paletteX - 8, paletteY - 18, totalW + 16, paletteH + 28, 10);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.font = '9px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.textAlign = 'left';
      ctx.fillText('COLOR DNA 調色盤', paletteX, paletteY - 6);

      let currentX = paletteX;
      report.colorPalette.forEach((swatch, idx) => {
        const swatchW = (totalW * swatch.percentage) / 100;
        ctx.fillStyle = swatch.hex;
        ctx.beginPath();
        if (idx === 0) {
          ctx.roundRect(currentX, paletteY, swatchW, paletteH, [6, 0, 0, 6]);
        } else if (idx === report.colorPalette.length - 1) {
          ctx.roundRect(currentX, paletteY, swatchW, paletteH, [0, 6, 6, 0]);
        } else {
          ctx.fillRect(currentX, paletteY, swatchW, paletteH);
        }
        ctx.fill();

        currentX += swatchW;
      });
      ctx.restore();
    }

    // Layer: Editorial Badge / Watermark
    if (showBadge) {
      ctx.save();
      const badgeX = drawX + drawW - 110;
      const badgeY = drawY + 24;

      // Score Badge Box
      ctx.fillStyle = 'rgba(17, 17, 24, 0.85)';
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, 90, 80, 12);
      ctx.fill();
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.font = '800 28px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#fef08a'; // yellow-200
      ctx.textAlign = 'center';
      ctx.fillText(String(report.overallScore), badgeX + 45, badgeY + 38);

      ctx.font = '700 11px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#eab308';
      ctx.fillText(`RANK ${report.rankBadge || 'S'}`, badgeX + 45, badgeY + 54);

      ctx.font = '500 8px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.fillText('AURA INDEX', badgeX + 45, badgeY + 68);
      ctx.restore();
    }

    // Layer: Draw Pins on Canvas for Export
    if (showPins && viewMode === 'studio') {
      report.items.forEach((item) => {
        const isSelected = selectedItemId === item.id;
        const isHovered = hoveredItemId === item.id;
        const px = drawX + (drawW * item.x) / 100;
        const py = drawY + (drawH * item.y) / 100;

        ctx.save();
        // Pulsing outer ring
        ctx.beginPath();
        ctx.arc(px, py, isSelected ? 18 : 12, 0, Math.PI * 2);
        ctx.fillStyle = isSelected
          ? 'rgba(234, 179, 8, 0.35)'
          : isHovered
          ? 'rgba(255, 255, 255, 0.3)'
          : 'rgba(234, 179, 8, 0.2)';
        ctx.fill();

        // Pin border ring
        ctx.beginPath();
        ctx.arc(px, py, 9, 0, Math.PI * 2);
        ctx.fillStyle = isSelected ? '#eab308' : '#ffffff';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#09090b';
        ctx.stroke();

        // Inner core
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fillStyle = isSelected ? '#000000' : '#eab308';
        ctx.fill();

        ctx.restore();
      });
    }

    ctx.restore();
  }, [
    imageLoaded,
    showPins,
    showColors,
    showGoldenRatio,
    showBadge,
    viewMode,
    zoom,
    pan,
    report,
    selectedItemId,
    hoveredItemId,
  ]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
      renderCanvas();
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [renderCanvas]);

  // Mouse drag pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    setZoom((prev) => Math.min(Math.max(prev * zoomFactor, 0.6), 2.8));
  };

  // High-Resolution Export Card
  const handleExportPoster = async () => {
    if (!imageObjRef.current) return;
    setIsExporting(true);

    try {
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = 1200;
      exportCanvas.height = 1600;
      const ctx = exportCanvas.getContext('2d');
      if (!ctx) return;

      const img = imageObjRef.current;

      // Dark Luxury Gradient Background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, 1600);
      bgGrad.addColorStop(0, '#0c0c11');
      bgGrad.addColorStop(1, '#050507');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1200, 1600);

      // Gold Framing
      ctx.strokeStyle = '#c5a059';
      ctx.lineWidth = 3;
      ctx.strokeRect(40, 40, 1120, 1520);
      ctx.lineWidth = 1;
      ctx.strokeRect(48, 48, 1104, 1504);

      // Editorial Header
      ctx.fillStyle = '#ffffff';
      ctx.font = '700 64px "Cormorant Garamond", Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText('AURA STYLIST', 600, 120);

      ctx.fillStyle = '#d4af37';
      ctx.font = '600 16px "Plus Jakarta Sans", sans-serif';
      ctx.letterSpacing = '8px';
      ctx.fillText('EDITORIAL FASHION CRITIQUE & ANALYSIS', 600, 155);

      // Photo placement in frame
      const photoFrameX = 90;
      const photoFrameY = 190;
      const photoFrameW = 1020;
      const photoFrameH = 920;

      // Draw photo fitted
      const imgAspect = img.width / img.height;
      const frameAspect = photoFrameW / photoFrameH;
      let drawW = photoFrameW;
      let drawH = photoFrameH;
      let drawX = photoFrameX;
      let drawY = photoFrameY;

      if (imgAspect > frameAspect) {
        drawH = photoFrameW / imgAspect;
        drawY = photoFrameY + (photoFrameH - drawH) / 2;
      } else {
        drawW = photoFrameH * imgAspect;
        drawX = photoFrameX + (photoFrameW - drawW) / 2;
      }

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(photoFrameX, photoFrameY, photoFrameW, photoFrameH, 16);
      ctx.clip();
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
      ctx.restore();

      ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(photoFrameX, photoFrameY, photoFrameW, photoFrameH, 16);
      ctx.stroke();

      // Overall Score Pill
      ctx.fillStyle = 'rgba(15, 15, 20, 0.9)';
      ctx.beginPath();
      ctx.roundRect(860, 220, 220, 100, 16);
      ctx.fill();
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#fde047';
      ctx.font = '800 48px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(report.overallScore), 970, 280);

      ctx.fillStyle = '#d4af37';
      ctx.font = '700 15px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(`SCORE • RANK ${report.rankBadge || 'S'}`, 970, 305);

      // Archetype Banner
      ctx.fillStyle = 'rgba(20, 20, 28, 0.95)';
      ctx.beginPath();
      ctx.roundRect(90, 1140, 1020, 110, 16);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.font = '700 24px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      ctx.fillText(report.styleArchetype || '現代風格穿搭', 125, 1180);

      ctx.font = '400 17px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#d4d4d8';
      ctx.fillText(report.headline || report.spokenCritique.slice(0, 35) + '...', 125, 1215);

      // Color Palette Strip
      if (report.colorPalette && report.colorPalette.length > 0) {
        let currentPaletteX = 90;
        const paletteY = 1275;
        const paletteTotalW = 480;
        const paletteH = 46;

        ctx.font = '600 14px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#a1a1aa';
        ctx.fillText('COLOR PALETTE DNA', 90, paletteY - 12);

        report.colorPalette.forEach((c) => {
          const w = (paletteTotalW * c.percentage) / 100;
          ctx.fillStyle = c.hex;
          ctx.fillRect(currentPaletteX, paletteY, w, paletteH);
          currentPaletteX += w;
        });

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.strokeRect(90, paletteY, paletteTotalW, paletteH);
      }

      // Spoken Quote Box
      const quoteX = 600;
      const quoteY = 1275;
      const quoteW = 510;
      ctx.fillStyle = 'rgba(28, 28, 38, 0.7)';
      ctx.beginPath();
      ctx.roundRect(quoteX, quoteY - 26, quoteW, 160, 12);
      ctx.fill();

      ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#eab308';
      ctx.textAlign = 'left';
      ctx.fillText('STYLIST VERDICT 造型師精評', quoteX + 16, quoteY - 4);

      ctx.font = '400 16px "Noto Sans TC", sans-serif';
      ctx.fillStyle = '#e4e4e7';

      // Simple text wrap for verdict
      const words = report.spokenCritique;
      let line = '';
      let curY = quoteY + 26;
      for (let i = 0; i < words.length; i++) {
        line += words[i];
        if (line.length >= 22) {
          ctx.fillText(line, quoteX + 16, curY);
          line = '';
          curY += 28;
          if (curY > quoteY + 115) {
            line += '...';
            break;
          }
        }
      }
      if (line) {
        ctx.fillText(line, quoteX + 16, curY);
      }

      // Footer: Stylist Seal & Date
      ctx.font = '500 14px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.textAlign = 'left';
      ctx.fillText(`DATE: ${new Date().toLocaleDateString('zh-TW')} • AURA AI COUTURE LAB`, 90, 1500);

      // Download
      const link = document.createElement('a');
      link.download = `AuraStyle-Report-${Date.now()}.png`;
      link.href = exportCanvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error('Export error:', e);
    } finally {
      setIsExporting(false);
    }
  };

  // Find active item
  const activeItem = report.items.find(
    (item) => item.id === (selectedItemId || hoveredItemId)
  );

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-[580px] md:h-[680px] rounded-2xl overflow-hidden glass-panel flex flex-col select-none ${className}`}
    >
      {/* Top Floating Action Bar */}
      <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between gap-2 pointer-events-auto">
        {/* Layer Toggles */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-900/85 backdrop-blur-md border border-white/10 shadow-lg text-xs">
          <button
            onClick={() => setShowPins(!showPins)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all ${
              showPins
                ? 'bg-amber-500/20 text-amber-300 font-medium'
                : 'text-neutral-400 hover:text-white'
            }`}
            title="開關單品標記"
          >
            <Tag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">單品熱點</span>
          </button>

          <button
            onClick={() => setShowColors(!showColors)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all ${
              showColors
                ? 'bg-amber-500/20 text-amber-300 font-medium'
                : 'text-neutral-400 hover:text-white'
            }`}
            title="開關色彩調色盤"
          >
            <Palette className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">色彩帶</span>
          </button>

          <button
            onClick={() => setShowGoldenRatio(!showGoldenRatio)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all ${
              showGoldenRatio
                ? 'bg-amber-500/20 text-amber-300 font-medium'
                : 'text-neutral-400 hover:text-white'
            }`}
            title="開關黃金比例分割線"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">黃金比例</span>
          </button>

          <button
            onClick={() => setShowBadge(!showBadge)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all ${
              showBadge
                ? 'bg-amber-500/20 text-amber-300 font-medium'
                : 'text-neutral-400 hover:text-white'
            }`}
            title="開關評分印章"
          >
            <Award className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">評分章</span>
          </button>
        </div>

        {/* View Mode & Export */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center p-1 rounded-xl bg-neutral-900/85 backdrop-blur-md border border-white/10 text-xs">
            <button
              onClick={() => setViewMode('studio')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'studio'
                  ? 'bg-amber-500 text-neutral-950 font-bold shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              工作台
            </button>
            <button
              onClick={() => setViewMode('magazine')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'magazine'
                  ? 'bg-amber-500 text-neutral-950 font-bold shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              雜誌封面
            </button>
          </div>

          <button
            onClick={handleExportPoster}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-neutral-950 font-semibold text-xs transition-all shadow-md active:scale-95 disabled:opacity-50"
            title="導出高解析度穿搭雜誌海報"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isExporting ? '輸出中...' : '匯出海報'}</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Canvas Area */}
      <div
        className="relative flex-1 w-full h-full overflow-hidden cursor-grab active:cursor-grabbing bg-neutral-950"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Overlay Interactive Pin Buttons (mapped to image percentage positions) */}
        {showPins && viewMode === 'studio' && imageLoaded && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
            }}
          >
            {report.items.map((item) => {
              const isSelected = selectedItemId === item.id;
              const isHovered = hoveredItemId === item.id;
              return (
                <div
                  key={item.id}
                  className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                  style={{
                    left: `${item.x}%`,
                    top: `${item.y}%`,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectItem(isSelected ? null : item.id);
                  }}
                  onMouseEnter={() => setHoveredItemId(item.id)}
                  onMouseLeave={() => setHoveredItemId(null)}
                >
                  {/* Glowing Animated Pulse Ring */}
                  <div className="relative flex items-center justify-center">
                    <span
                      className={`absolute w-8 h-8 rounded-full ${
                        isSelected
                          ? 'bg-amber-400/50 animate-ping'
                          : 'bg-white/20 animate-pulse'
                      }`}
                    />
                    <div
                      className={`relative w-6 h-6 rounded-full flex items-center justify-center shadow-lg transition-transform ${
                        isSelected
                          ? 'bg-amber-400 text-neutral-950 scale-125 ring-4 ring-amber-400/40'
                          : isHovered
                          ? 'bg-amber-300 text-neutral-950 scale-110'
                          : 'bg-neutral-900/90 text-amber-300 border border-amber-400/60'
                      }`}
                    >
                      <span className="text-[10px] font-black">{item.score}★</span>
                    </div>

                    {/* Quick Floating Tag on Hover */}
                    <div
                      className={`absolute left-7 top-1/2 -translate-y-1/2 whitespace-nowrap px-2.5 py-1 rounded-lg bg-neutral-900/90 backdrop-blur-md border border-white/10 text-xs shadow-xl transition-all duration-200 pointer-events-none ${
                        isHovered || isSelected
                          ? 'opacity-100 translate-x-0'
                          : 'opacity-0 -translate-x-1'
                      }`}
                    >
                      <p className="font-semibold text-white">{item.name}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Selected Item Detail Glass Card (Bottom Overlay) */}
        {activeItem && (
          <div className="absolute bottom-14 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md z-30 pointer-events-auto animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div className="p-4 rounded-2xl glass-panel border border-amber-500/30 shadow-2xl space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    {activeItem.type}
                  </span>
                  <h4 className="text-sm font-bold text-white mt-1">
                    {activeItem.name}
                  </h4>
                </div>
                <div className="flex items-center gap-1 text-xs font-black text-amber-400 bg-neutral-900/80 px-2 py-1 rounded-lg border border-white/10">
                  <span>評分:</span>
                  <span>{activeItem.score} / 5</span>
                </div>
              </div>

              <p className="text-xs text-neutral-300 leading-relaxed">
                {activeItem.critique}
              </p>

              <div className="pt-2 border-t border-white/10 flex items-start gap-1.5 text-xs text-amber-200/90 bg-amber-950/20 p-2 rounded-xl">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <p>
                  <strong className="text-amber-300">搭配提案：</strong>
                  {activeItem.recommendation}
                </p>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={() => onSelectItem(null)}
                  className="text-[11px] text-neutral-400 hover:text-white"
                >
                  關閉卡片
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Floating Control Bar */}
      <div className="absolute bottom-3 right-3 z-30 flex items-center gap-1 p-1 rounded-xl bg-neutral-900/85 backdrop-blur-md border border-white/10 text-xs shadow-lg">
        <button
          onClick={() => setZoom((prev) => Math.min(prev + 0.15, 2.5))}
          className="p-1.5 text-neutral-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          title="放大"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <span className="text-[10px] font-mono px-1 text-neutral-400">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom((prev) => Math.max(prev - 0.15, 0.6))}
          className="p-1.5 text-neutral-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          title="縮小"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            setZoom(1);
            setPan({ x: 0, y: 0 });
          }}
          className="p-1.5 text-neutral-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          title="重置視角"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
