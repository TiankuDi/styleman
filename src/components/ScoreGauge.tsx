import React, { useEffect, useState } from 'react';

interface ScoreGaugeProps {
  score: number;
  rankBadge: string;
  size?: number;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  rankBadge,
  size = 150,
}) => {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1200;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(ease * score));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [score]);

  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Rank color scheme
  const getRankBadgeColor = (rank: string) => {
    if (rank.includes('S')) return 'from-amber-400 to-yellow-500 text-neutral-950 border-amber-300';
    if (rank.includes('A')) return 'from-emerald-400 to-teal-500 text-neutral-950 border-emerald-300';
    return 'from-blue-400 to-indigo-500 text-neutral-950 border-blue-300';
  };

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Gradient Def */}
        <defs>
          <linearGradient id="scoreGaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="50%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#facc15" />
          </linearGradient>
        </defs>

        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#scoreGaugeGrad)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          className="transition-all duration-1000 ease-out"
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
          綜合造型美學
        </span>
        <div className="flex items-baseline justify-center">
          <span className="text-4xl font-extrabold tracking-tight text-white font-mono">
            {displayScore}
          </span>
          <span className="text-xs text-neutral-400 ml-0.5">/100</span>
        </div>

        {/* Rank Badge pill */}
        <div
          className={`mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-wide shadow-md bg-gradient-to-r border ${getRankBadgeColor(
            rankBadge
          )}`}
        >
          RANK {rankBadge}
        </div>
      </div>
    </div>
  );
};
