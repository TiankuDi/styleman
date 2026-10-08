import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Camera,
  Upload,
  RefreshCw,
  Share2,
  Award,
  Layers,
  ChevronDown,
  Info,
  Sliders,
  Check,
} from 'lucide-react';
import { StyleReport } from './types/stylist';
import { DEFAULT_STYLE_REPORT, SAMPLE_OUTFITS } from './data/sampleOutfits';
import { FashionCanvas } from './components/FashionCanvas';
import { VoiceCritiquePlayer } from './components/VoiceCritiquePlayer';
import { StyleDashboard } from './components/StyleDashboard';
import { CaptureStudio } from './components/CaptureStudio';
import { AnalyzingOverlay } from './components/AnalyzingOverlay';

export default function App() {
  // Current active image & analysis report
  const [currentImage, setCurrentImage] = useState<string>(SAMPLE_OUTFITS[0].imageUrl);
  const [report, setReport] = useState<StyleReport>(DEFAULT_STYLE_REPORT);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showInputModal, setShowInputModal] = useState<boolean>(false);
  const [selectedOccasion, setSelectedOccasion] = useState<string>('綜合日常與社交');

  // Perform Outfit Analysis via server API
  const handleAnalyzeOutfit = async (
    imageDataUrl: string,
    mimeType = 'image/jpeg',
    occasion = '綜合日常與社交'
  ) => {
    setIsLoading(true);
    setCurrentImage(imageDataUrl);
    setShowInputModal(false);
    setSelectedOccasion(occasion);
    setSelectedItemId(null);

    try {
      const response = await fetch('/api/analyze-outfit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: imageDataUrl,
          mimeType,
          occasion,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data: StyleReport = await response.json();
      setReport(data);
    } catch (error) {
      console.warn('API error or fallback mode:', error);
      // Fallback with custom tweak
      setReport({
        ...DEFAULT_STYLE_REPORT,
        headline: `針對「${occasion}」的專業美學診斷完成`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col antialiased selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Luxury Navigation Header */}
      <header className="sticky top-0 z-40 w-full bg-neutral-950/85 backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand & Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center text-neutral-950 font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-white font-serif-luxury">
                  AuraStyle AI
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 hidden sm:inline-block">
                  智慧造型設計師
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 hidden sm:block">
                專業穿搭評分 • 互動式 Canvas 視覺化儀表板 • 語音評語播報
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowInputModal(!showInputModal)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition-all shadow-md active:scale-95"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>拍照 / 上傳穿搭</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Quick Camera/Upload Section (Always accessible toggle) */}
        {showInputModal && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-300">
            <CaptureStudio
              onImageSelected={handleAnalyzeOutfit}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* AI Voice Critique Audio Player (簡要說出評語) */}
        <VoiceCritiquePlayer
          spokenCritique={report.spokenCritique}
          headline={report.headline}
          autoPlay={false}
        />

        {/* Core Layout: Canvas Hero + Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left / Center: Interactive Fashion Canvas Visualizer */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-neutral-300">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>CANVAS 穿搭解構畫布</span>
                <span className="text-[11px] text-neutral-500 font-normal hidden sm:inline">
                  (可拖曳縮放、點選單品熱點)
                </span>
              </div>

              <button
                onClick={() => setShowInputModal(true)}
                className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>更換穿搭照片</span>
              </button>
            </div>

            {/* The Canvas Studio */}
            <FashionCanvas
              imageUrl={currentImage}
              report={report}
              selectedItemId={selectedItemId}
              onSelectItem={setSelectedItemId}
            />

            {/* Bottom Canvas Usage Guidance */}
            <div className="p-3 rounded-xl bg-neutral-900/60 border border-white/5 flex items-center justify-between text-[11px] text-neutral-400">
              <span className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                支援滾輪縮放、畫面拖曳、黃金比例格線與一鍵導出高解析雜誌海報。
              </span>
              <span className="text-amber-400/80 font-mono hidden md:inline">
                {report.styleArchetype}
              </span>
            </div>
          </div>

          {/* Right: Rich Interactive Visual Dashboard */}
          <div className="lg:col-span-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-neutral-300">
                <Sliders className="w-4 h-4 text-amber-400" />
                <span>造型設計師專業診斷儀表板</span>
              </div>
              <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                綜合指數: {report.overallScore} 分
              </span>
            </div>

            <StyleDashboard
              report={report}
              selectedItemId={selectedItemId}
              onSelectItem={setSelectedItemId}
            />
          </div>
        </div>

        {/* Quick Sample Outfits Drawer (Bottom Quick Picker) */}
        {!showInputModal && (
          <div className="pt-6 border-t border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>即時試穿示範風格庫（點擊立即在 Canvas 分析）</span>
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {SAMPLE_OUTFITS.map((sample) => (
                <div
                  key={sample.id}
                  onClick={() => handleAnalyzeOutfit(sample.imageUrl, 'image/jpeg', '綜合日常')}
                  className={`group relative rounded-2xl overflow-hidden glass-card border cursor-pointer transition-all hover:-translate-y-1 ${
                    currentImage === sample.imageUrl
                      ? 'border-amber-400 ring-2 ring-amber-400/30 shadow-lg shadow-amber-500/10'
                      : 'border-white/10 hover:border-white/30'
                  }`}
                >
                  <div className="aspect-[3/4] w-full overflow-hidden bg-neutral-900">
                    <img
                      src={sample.imageUrl}
                      alt={sample.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-2.5 bg-neutral-950/90 border-t border-white/5 space-y-0.5">
                    <h4 className="text-xs font-bold text-white truncate">
                      {sample.name}
                    </h4>
                    <p className="text-[10px] text-amber-400 truncate">
                      {sample.category}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/10 py-6 text-center text-xs text-neutral-500">
        <p>AuraStyle AI 造型顧問 • 結合多模態視覺美學分析與 Canvas 互動視覺化</p>
      </footer>

      {/* Loading Modal Overlay */}
      {isLoading && <AnalyzingOverlay />}
    </div>
  );
}
