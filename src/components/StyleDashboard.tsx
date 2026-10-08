import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Palette,
  ShoppingBag,
  Sliders,
  Calendar,
  Compass,
  ArrowUpRight,
  TrendingUp,
  Star,
  ChevronRight,
} from 'lucide-react';
import { OutfitItemPin, StyleReport } from '../types/stylist';
import { ScoreGauge } from './ScoreGauge';
import { RadarChart } from './RadarChart';

interface StyleDashboardProps {
  report: StyleReport;
  selectedItemId: string | null;
  onSelectItem: (id: string | null) => void;
}

export const StyleDashboard: React.FC<StyleDashboardProps> = ({
  report,
  selectedItemId,
  onSelectItem,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'items' | 'colors' | 'occasions'>('overview');

  return (
    <div className="w-full space-y-6">
      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-neutral-900/80 border border-white/10 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'overview'
              ? 'bg-amber-500 text-neutral-950 shadow-md font-bold'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>美學維度與綜評</span>
        </button>

        <button
          onClick={() => setActiveTab('items')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'items'
              ? 'bg-amber-500 text-neutral-950 shadow-md font-bold'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>單品深度解構 ({report.items.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('colors')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'colors'
              ? 'bg-amber-500 text-neutral-950 shadow-md font-bold'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>色彩基因 DNA</span>
        </button>

        <button
          onClick={() => setActiveTab('occasions')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'occasions'
              ? 'bg-amber-500 text-neutral-950 shadow-md font-bold'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>場合適配與造型密技</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top Score & Radar Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Score & Style Archetype Card */}
            <div className="md:col-span-5 glass-panel p-6 rounded-2xl border border-white/10 flex flex-col justify-between items-center text-center space-y-4">
              <div className="w-full flex items-center justify-between text-xs text-neutral-400">
                <span className="flex items-center gap-1 font-semibold text-amber-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  時裝美學評估
                </span>
                <span className="font-mono text-[11px] bg-white/5 px-2 py-0.5 rounded-md">
                  AURA-V4
                </span>
              </div>

              <ScoreGauge
                score={report.overallScore}
                rankBadge={report.rankBadge}
                size={160}
              />

              <div className="w-full space-y-2 pt-2 border-t border-white/10">
                <div className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  {report.styleArchetype}
                </div>
                <p className="text-xs text-neutral-400">
                  個人色彩季型：
                  <span className="text-white font-medium ml-1">
                    {report.seasonPaletteType}
                  </span>
                </p>
              </div>
            </div>

            {/* Radar Chart 6-Dimensions */}
            <div className="md:col-span-7 glass-panel p-6 rounded-2xl border border-white/10 flex flex-col justify-between items-center">
              <div className="w-full flex items-center justify-between text-xs text-neutral-400 mb-2">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-amber-400" />
                  六維時尚雷達圖譜
                </span>
                <span className="text-[11px] text-neutral-400">
                  基準分 80+ 為優秀標準
                </span>
              </div>

              <div className="my-auto">
                <RadarChart metrics={report.metrics} size={260} />
              </div>
            </div>
          </div>

          {/* Strengths & Improvements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Strengths */}
            <div className="glass-panel p-5 rounded-2xl border border-emerald-500/20 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>亮點優勢（值得保持）</span>
              </div>
              <ul className="space-y-2.5">
                {report.strengths.map((str, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-xs text-neutral-200 leading-relaxed bg-white/5 p-2.5 rounded-xl"
                  >
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Improvements */}
            <div className="glass-panel p-5 rounded-2xl border border-amber-500/20 space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>造型進階建議（畫龍點睛）</span>
              </div>
              <ul className="space-y-2.5">
                {report.improvements.map((imp, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-xs text-neutral-200 leading-relaxed bg-amber-500/10 border border-amber-500/15 p-2.5 rounded-xl"
                  >
                    <span className="w-5 h-5 rounded-full bg-amber-500/25 text-amber-300 font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Proportions insight card */}
          {report.bodyProportionAdvice && (
            <div className="glass-panel p-4 rounded-2xl border border-white/10 flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 shrink-0">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white mb-1">
                  身形剪裁與比例透視（黃金 3:7 分割）
                </h4>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  {report.bodyProportionAdvice}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ITEMS BREAKDOWN */}
      {activeTab === 'items' && (
        <div className="space-y-4">
          <p className="text-xs text-neutral-400">
            點擊下方任一單品卡片，畫布將同步聚焦該部位的標記點與搭配建議：
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {report.items.map((item) => {
              const isSelected = selectedItemId === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => onSelectItem(isSelected ? null : item.id)}
                  className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                    isSelected
                      ? 'glass-panel border-amber-400 ring-2 ring-amber-400/30 scale-[1.01]'
                      : 'glass-card border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
                        {item.type}
                      </span>
                      <h4 className="text-sm font-bold text-white mt-1">
                        {item.name}
                      </h4>
                    </div>
                    {/* Stars */}
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < item.score ? 'fill-current' : 'text-neutral-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-neutral-300 leading-relaxed mb-3">
                    {item.critique}
                  </p>

                  <div className="pt-2.5 border-t border-white/10 flex items-start gap-1.5 text-xs text-amber-200 bg-amber-950/20 p-2 rounded-xl">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <p>
                      <strong className="text-amber-300 font-semibold">升級提議：</strong>
                      {item.recommendation}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: COLOR PALETTE */}
      {activeTab === 'colors' && (
        <div className="space-y-6">
          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">
                  個人色彩季別：{report.seasonPaletteType}
                </h4>
                <p className="text-xs text-neutral-400 mt-0.5">
                  精準分析當前穿搭的色彩比重、主色調與點綴反差
                </p>
              </div>
            </div>

            {/* Combined color strip */}
            <div className="h-8 rounded-xl overflow-hidden flex border border-white/10">
              {report.colorPalette.map((c, i) => (
                <div
                  key={i}
                  style={{ width: `${c.percentage}%`, backgroundColor: c.hex }}
                  className="h-full relative group transition-transform hover:scale-105"
                  title={`${c.name} (${c.percentage}%)`}
                />
              ))}
            </div>

            {/* Individual color cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              {report.colorPalette.map((c, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl bg-neutral-900/70 border border-white/10 flex flex-col gap-2.5"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl shadow-md border border-white/20 shrink-0"
                      style={{ backgroundColor: c.hex }}
                    />
                    <div>
                      <h5 className="text-xs font-bold text-white">{c.name}</h5>
                      <span className="font-mono text-[10px] text-neutral-400">
                        {c.hex} • {c.percentage}%
                      </span>
                    </div>
                  </div>
                  <div className="text-[11px] text-neutral-300 bg-white/5 p-2 rounded-lg leading-snug">
                    <span className="text-amber-400 font-semibold block mb-0.5">
                      {c.role === 'primary'
                        ? '主色 (Base)'
                        : c.role === 'secondary'
                        ? '輔色 (Secondary)'
                        : '點綴色 (Accent)'}
                    </span>
                    {c.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: OCCASIONS & STYLING SECRETS */}
      {activeTab === 'occasions' && (
        <div className="space-y-6">
          {/* Occasion Suitability Progress Bars */}
          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              場合契合度預測
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {report.recommendedOccasions.map((occ, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-neutral-200">
                      {occ.occasion}
                    </span>
                    <span className="font-mono font-bold text-amber-400">
                      {occ.fitRate}% 匹配
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-300 transition-all duration-700"
                      style={{ width: `${occ.fitRate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Styling Tips & Secrets */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              造型師專屬美學法則（Styling Secrets）
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {report.stylingTips.map((tip, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl glass-card border border-white/10 flex flex-col justify-between space-y-2"
                >
                  <div>
                    <span className="text-[10px] font-bold text-amber-400 font-mono">
                      TIP 0{idx + 1}
                    </span>
                    <h5 className="text-xs font-bold text-white mt-1 mb-2">
                      {tip.title}
                    </h5>
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      {tip.advice}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
