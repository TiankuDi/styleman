import React, { useEffect, useState, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, RotateCcw, Sparkles, Radio } from 'lucide-react';
import { narrator } from '../utils/audioSpeech';

interface VoiceCritiquePlayerProps {
  spokenCritique: string;
  headline?: string;
  autoPlay?: boolean;
}

export const VoiceCritiquePlayer: React.FC<VoiceCritiquePlayerProps> = ({
  spokenCritique,
  headline,
  autoPlay = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>('');
  const [waveHeights, setWaveHeights] = useState<number[]>([20, 45, 80, 60, 30, 75, 90, 40, 20]);
  const animationFrameRef = useRef<number | null>(null);

  // Load available voices
  useEffect(() => {
    const updateVoices = () => {
      const allVoices = narrator.getVoices();
      setVoices(allVoices);
      const chineseVoice = allVoices.find(
        (v) =>
          v.lang.startsWith('zh-TW') ||
          v.lang.startsWith('zh-HK') ||
          v.lang.startsWith('zh') ||
          v.lang.includes('cmn')
      );
      if (chineseVoice && !selectedVoiceName) {
        setSelectedVoiceName(chineseVoice.name);
      }
    };

    updateVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, [selectedVoiceName]);

  // Listen to narrator state
  useEffect(() => {
    narrator.setListener((speaking) => {
      setIsPlaying(speaking);
    });

    if (autoPlay && spokenCritique) {
      const timer = setTimeout(() => {
        handlePlay();
      }, 500);
      return () => clearTimeout(timer);
    }

    return () => {
      narrator.stop();
    };
  }, [spokenCritique]);

  // Waveform animation while speaking
  useEffect(() => {
    if (!isPlaying) {
      setWaveHeights([15, 20, 25, 20, 15, 25, 20, 15, 12]);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const animateWaves = () => {
      setWaveHeights((prev) =>
        prev.map(() => Math.floor(Math.random() * 75) + 15)
      );
      animationFrameRef.current = requestAnimationFrame(animateWaves);
    };

    const interval = setInterval(() => {
      setWaveHeights((prev) =>
        prev.map(() => Math.floor(Math.random() * 80) + 15)
      );
    }, 120);

    return () => {
      clearInterval(interval);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  const handlePlay = () => {
    narrator.speak(spokenCritique, {
      rate: speechRate,
      voiceName: selectedVoiceName,
    });
  };

  const handlePause = () => {
    if (isPlaying) {
      narrator.pause();
    } else {
      narrator.resume();
    }
  };

  const handleReplay = () => {
    narrator.stop();
    narrator.speak(spokenCritique, {
      rate: speechRate,
      voiceName: selectedVoiceName,
    });
  };

  const cycleRate = () => {
    const rates = [0.9, 1.0, 1.2];
    const currentIndex = rates.indexOf(speechRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    setSpeechRate(nextRate);
    if (isPlaying) {
      handleReplay();
    }
  };

  return (
    <div className="w-full rounded-2xl glass-panel p-5 border border-amber-500/20 relative overflow-hidden shadow-xl">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col gap-4 relative z-10">
        {/* Header line */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Radio className={`w-4 h-4 ${isPlaying ? 'animate-pulse' : ''}`} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  AI 造型總監語音講評
                </span>
                {isPlaying && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    播報中
                  </span>
                )}
              </div>
              <p className="text-[11px] text-neutral-400">
                語音評審精簡短評 • 專屬穿搭修飾點撥
              </p>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex items-center gap-2">
            {/* Speed toggle */}
            <button
              onClick={cycleRate}
              className="px-2 py-1 rounded-lg bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 text-xs font-mono border border-white/10 transition-colors"
              title="調整語速"
            >
              {speechRate}x
            </button>

            {/* Play/Pause Button */}
            {isPlaying ? (
              <button
                onClick={handlePause}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 text-neutral-950 font-bold text-xs hover:bg-amber-400 transition-all shadow-md active:scale-95"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>暫停</span>
              </button>
            ) : (
              <button
                onClick={handlePlay}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-neutral-950 font-bold text-xs hover:from-amber-400 hover:to-yellow-300 transition-all shadow-md active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>聆聽語音評語</span>
              </button>
            )}

            <button
              onClick={handleReplay}
              className="p-1.5 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 border border-white/10 transition-colors"
              title="重新朗讀"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Headline Badge */}
        {headline && (
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs font-semibold text-amber-200/90 leading-snug">
              「{headline}」
            </p>
          </div>
        )}

        {/* Spoken Text & Audio Wave Visualizer */}
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-neutral-950/60 p-4 rounded-xl border border-white/5">
          {/* Animated Waveform Visualizer */}
          <div className="flex items-center gap-1 h-12 px-3 py-1 bg-neutral-900/80 rounded-lg border border-white/5 shrink-0">
            {waveHeights.map((h, i) => (
              <div
                key={i}
                className={`w-1 rounded-full transition-all duration-150 ${
                  isPlaying
                    ? 'bg-gradient-to-t from-amber-500 to-yellow-300 shadow-sm shadow-amber-500/50'
                    : 'bg-neutral-600'
                }`}
                style={{ height: `${h}%` }}
              />
            ))}
          </div>

          {/* Spoken Text paragraph */}
          <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed font-sans flex-1">
            {spokenCritique}
          </p>
        </div>
      </div>
    </div>
  );
};
