import React, { useEffect, useState } from 'react';
import { Sparkles, Compass, Palette, Scissors } from 'lucide-react';

export const AnalyzingOverlay: React.FC = () => {
  const steps = [
    { icon: Palette, text: '解析色彩光譜與色階對比度...' },
    { icon: Compass, text: '計算頭身比例、腰線與黃金分割率...' },
    { icon: Scissors, text: '解構服裝剪裁版型與單品熱點...' },
    { icon: Sparkles, text: '資深造型顧問正在生成專業評語與雷達圖譜...' },
  ];

  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 900);
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
      <div className="max-w-md w-full glass-panel p-8 rounded-3xl border border-amber-500/30 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Animated Scanning Beam */}
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/0 via-amber-500/10 to-amber-500/0 -translate-y-full animate-[scan_2s_ease-in-out_infinite]" />

        {/* Center glowing logo */}
        <div className="relative mx-auto w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-yellow-400/20 border border-amber-400/40 flex items-center justify-center shadow-lg shadow-amber-500/20">
          <Sparkles className="w-10 h-10 text-amber-400 animate-spin-slow" />
        </div>

        <div className="space-y-1">
          <h3 className="text-lg font-bold text-white font-serif-luxury tracking-wide">
            AURA AI STYLIST RUNWAY LAB
          </h3>
          <p className="text-xs text-amber-300 font-semibold uppercase tracking-wider">
            正在進行高級時裝美學多維度解構
          </p>
        </div>

        {/* Step progression */}
        <div className="space-y-2 text-left">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            const isDone = idx < currentStep;
            const isCurrent = idx === currentStep;

            return (
              <div
                key={idx}
                className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                  isCurrent
                    ? 'bg-amber-500/15 border border-amber-500/30 text-amber-200'
                    : isDone
                    ? 'text-neutral-400 opacity-80'
                    : 'text-neutral-600 opacity-40'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs ${
                    isCurrent
                      ? 'bg-amber-400 text-neutral-950 font-bold'
                      : isDone
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-neutral-800 text-neutral-500'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-medium">{s.text}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
