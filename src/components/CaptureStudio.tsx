import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  Sparkles,
  RefreshCw,
  FlipHorizontal,
  Clock,
  Image as ImageIcon,
  CheckCircle,
  X,
  AlertCircle,
  Smartphone,
} from 'lucide-react';
import { fileToBase64, urlToBase64 } from '../utils/imageHelper';
import { SAMPLE_OUTFITS } from '../data/sampleOutfits';
import { SampleOutfit } from '../types/stylist';

interface CaptureStudioProps {
  onImageSelected: (dataUrl: string, mimeType?: string, occasion?: string) => void;
  isLoading: boolean;
}

export const CaptureStudio: React.FC<CaptureStudioProps> = ({
  onImageSelected,
  isLoading,
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'samples'>('camera');
  const [selectedOccasion, setSelectedOccasion] = useState<string>('綜合日常與社交');

  // Camera state
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isMirrored, setIsMirrored] = useState(true);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Native camera input for iPad/iPhone/Mobile
  const nativeCameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Occasions list
  const occasions = [
    '綜合日常與社交',
    '都會職場與商務',
    '浪漫約會與聚會',
    '街頭潮流與出遊',
    '晚宴派對與盛裝',
  ];

  // Stop camera helper
  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Start live webcam
  const startCamera = async () => {
    stopCamera();
    setCameraError(null);

    if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('當前瀏覽器環境限制了即時視訊串流，建議點擊下方「啟動原生相機拍照」直接拍照。');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn('getUserMedia error (expected in some restricted iframes):', err);
      setCameraError('瀏覽器或預覽視窗限制了網頁即時串流相機，請直接點擊下方「啟動相機拍照」，即可使用 iPad / 手機內建相機進行高畫質拍攝！');
      setIsCameraActive(false);
    }
  };

  // Switch tabs
  useEffect(() => {
    if (activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [activeTab, facingMode]);

  // Flip front/back camera
  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
    setIsMirrored((prev) => !prev);
  };

  // Trigger shutter capture
  const handleShutter = () => {
    if (countdown !== null) return;
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          takeSnapshot();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const takeSnapshot = () => {
    if (!videoRef.current) return;
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 300);

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (isMirrored && facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    stopCamera();
    onImageSelected(dataUrl, 'image/jpeg', selectedOccasion);
  };

  // File Upload Handlers
  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('請上傳圖片格式（JPG, PNG, WEBP）');
      return;
    }
    try {
      const { dataUrl, mimeType } = await fileToBase64(file);
      onImageSelected(dataUrl, mimeType, selectedOccasion);
    } catch (e) {
      console.error('File conversion error:', e);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Sample Selection
  const handleSelectSample = async (sample: SampleOutfit) => {
    try {
      const { dataUrl, mimeType } = await urlToBase64(sample.imageUrl);
      onImageSelected(dataUrl, mimeType, selectedOccasion);
    } catch (err) {
      onImageSelected(sample.imageUrl, 'image/jpeg', selectedOccasion);
    }
  };

  return (
    <div className="w-full glass-panel rounded-3xl p-6 border border-white/10 space-y-6 shadow-2xl">
      {/* Hidden Native Camera Input (100% works across all iPad/iPhone/Android devices without iframe permissions) */}
      <input
        ref={nativeCameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files[0]);
          }
        }}
      />

      {/* Header & Occasion selection */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>匯入穿搭照片進行造型診斷</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            支援相機直接拍照、上傳照片或精選穿搭範本，即時啟動六維時尚美學分析
          </p>
        </div>

        {/* Occasion Selector */}
        <div className="flex items-center gap-2 bg-neutral-900/90 p-1.5 rounded-2xl border border-white/10 text-xs">
          <span className="text-neutral-400 pl-2 hidden sm:inline">目標場合：</span>
          <select
            value={selectedOccasion}
            onChange={(e) => setSelectedOccasion(e.target.value)}
            className="bg-transparent text-amber-300 font-semibold focus:outline-none cursor-pointer py-1 pr-2"
          >
            {occasions.map((occ) => (
              <option key={occ} value={occ} className="bg-neutral-900 text-white">
                {occ}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Primary Action Buttons Bar */}
      <div className="flex flex-wrap items-center gap-3 p-2 rounded-2xl bg-neutral-950/60 border border-white/10">
        {/* Direct Native Camera trigger button */}
        <button
          onClick={() => nativeCameraInputRef.current?.click()}
          className="flex-1 min-w-[200px] flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-neutral-950 font-bold text-xs shadow-lg transition-all active:scale-95"
        >
          <Camera className="w-4 h-4 fill-neutral-950" />
          <span>開啟相機拍照（iPad / 手機推薦）</span>
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 min-w-[160px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/10 transition-all active:scale-95"
        >
          <Upload className="w-4 h-4 text-amber-300" />
          <span>選取照片圖庫</span>
        </button>
      </div>

      {/* Tabs Switcher: Live Camera / Upload / Samples */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <button
          onClick={() => setActiveTab('camera')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'camera'
              ? 'bg-amber-500 text-neutral-950 font-bold shadow-md'
              : 'text-neutral-400 hover:text-white bg-white/5'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>即時鏡頭預覽</span>
        </button>

        <button
          onClick={() => setActiveTab('upload')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'upload'
              ? 'bg-amber-500 text-neutral-950 font-bold shadow-md'
              : 'text-neutral-400 hover:text-white bg-white/5'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>檔案拖曳上傳</span>
        </button>

        <button
          onClick={() => setActiveTab('samples')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'samples'
              ? 'bg-amber-500 text-neutral-950 font-bold shadow-md'
              : 'text-neutral-400 hover:text-white bg-white/5'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>示範風格衣櫥 (即刻體驗)</span>
        </button>
      </div>

      {/* TAB CONTENT: CAMERA */}
      {activeTab === 'camera' && (
        <div className="space-y-4">
          {cameraError ? (
            <div className="p-8 rounded-2xl bg-neutral-900/80 border border-amber-500/30 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                <Camera className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">使用裝置相機拍攝穿搭</h4>
                <p className="text-xs text-neutral-300 max-w-md mx-auto leading-relaxed">
                  {cameraError}
                </p>
              </div>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => nativeCameraInputRef.current?.click()}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-neutral-950 font-bold text-xs shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  <span>立即開啟相機拍照</span>
                </button>
                <button
                  onClick={startCamera}
                  className="w-full sm:w-auto px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/10 transition-colors"
                >
                  重試視訊串流
                </button>
              </div>
            </div>
          ) : (
            <div className="relative w-full h-[420px] sm:h-[480px] bg-neutral-950 rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center">
              {/* Shutter Flash Animation */}
              {isFlashing && (
                <div className="absolute inset-0 bg-white z-50 animate-out fade-out duration-200 pointer-events-none" />
              )}

              {/* Countdown overlay */}
              {countdown !== null && (
                <div className="absolute inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-8xl font-black text-amber-400 animate-ping">
                    {countdown}
                  </span>
                </div>
              )}

              {/* Video Element */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover transition-transform ${
                  isMirrored && facingMode === 'user' ? 'scale-x-[-1]' : ''
                }`}
              />

              {/* Silhouette Framing Guide Overlay */}
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                <div className="w-64 h-80 sm:w-72 sm:h-96 border-2 border-dashed border-amber-400/40 rounded-[50px] relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-neutral-900/90 text-[10px] text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30 font-medium">
                    請將身形對齊虛線取景框
                  </div>
                </div>
              </div>

              {/* Floating Camera Controls Top */}
              <div className="absolute top-4 right-4 flex items-center gap-2 z-30">
                <button
                  onClick={toggleFacingMode}
                  className="p-2.5 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-white border border-white/10 transition-colors shadow-lg"
                  title="翻轉前/後鏡頭"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsMirrored(!isMirrored)}
                  className={`p-2.5 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 border border-white/10 transition-colors shadow-lg ${
                    isMirrored ? 'text-amber-400' : 'text-neutral-400'
                  }`}
                  title="鏡像翻轉開關"
                >
                  <FlipHorizontal className="w-4 h-4" />
                </button>
              </div>

              {/* Shutter Button Bottom */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-4">
                <button
                  onClick={handleShutter}
                  disabled={isLoading || countdown !== null}
                  className="group relative flex items-center justify-center w-16 h-16 rounded-full bg-white text-neutral-950 p-1.5 shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                  title="拍下全身/半身穿搭"
                >
                  <div className="w-full h-full rounded-full border-2 border-neutral-950 group-hover:bg-amber-400 transition-colors flex items-center justify-center">
                    <Camera className="w-6 h-6" />
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: UPLOAD */}
      {activeTab === 'upload' && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`h-72 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-amber-400 bg-amber-500/10'
              : 'border-white/15 hover:border-amber-400/50 bg-neutral-900/40 hover:bg-neutral-900/70'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0]);
              }
            }}
          />
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3 shadow-lg">
            <Upload className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-white mb-1">
            拖曳穿搭照片至此，或點擊瀏覽選取
          </h3>
          <p className="text-xs text-neutral-400 max-w-sm">
            支援全身鏡自拍、半身人像或單品穿著特寫 (JPG / PNG / WEBP)
          </p>
        </div>
      )}

      {/* TAB CONTENT: SAMPLES */}
      {activeTab === 'samples' && (
        <div className="space-y-3">
          <p className="text-xs text-neutral-400">
            精選 5 款不同風格的國際街拍示範，點擊即可立即載入 Canvas 並啟動深度評分：
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {SAMPLE_OUTFITS.map((sample) => (
              <div
                key={sample.id}
                onClick={() => handleSelectSample(sample)}
                className="group relative rounded-2xl overflow-hidden glass-card border border-white/10 hover:border-amber-400/60 cursor-pointer transition-all hover:-translate-y-1 shadow-lg"
              >
                <div className="aspect-[3/4] w-full overflow-hidden bg-neutral-900">
                  <img
                    src={sample.imageUrl}
                    alt={sample.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <div className="p-2.5 bg-neutral-950/90 border-t border-white/5 space-y-0.5">
                  <h4 className="text-xs font-bold text-white truncate">
                    {sample.name}
                  </h4>
                  <p className="text-[10px] text-amber-400/90 truncate">
                    {sample.category}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
