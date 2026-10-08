import React, { useState } from 'react';
import { StylistMetric } from '../types/stylist';

interface RadarChartProps {
  metrics: {
    colorHarmony: StylistMetric;
    silhouetteFit: StylistMetric;
    styleCohesion: StylistMetric;
    accessoryDetail: StylistMetric;
    occasionSuitability: StylistMetric;
    hairGrooming: StylistMetric;
  };
  size?: number;
}

export const RadarChart: React.FC<RadarChartProps> = ({ metrics, size = 280 }) => {
  const [hoveredMetric, setHoveredMetric] = useState<StylistMetric | null>(null);

  const metricList = [
    metrics.colorHarmony,
    metrics.silhouetteFit,
    metrics.styleCohesion,
    metrics.accessoryDetail,
    metrics.occasionSuitability,
    metrics.hairGrooming,
  ];

  const count = metricList.length;
  const center = size / 2;
  const radius = (size / 2) * 0.72;

  // Grid levels (20%, 40%, 60%, 80%, 100%)
  const levels = [0.25, 0.5, 0.75, 1];

  // Helper to convert polar coordinates
  const getCoordinates = (index: number, valueFactor: number) => {
    const angle = (Math.PI * 2 * index) / count - Math.PI / 2;
    const x = center + radius * valueFactor * Math.cos(angle);
    const y = center + radius * valueFactor * Math.sin(angle);
    return { x, y };
  };

  // Polygon points
  const points = metricList
    .map((m, i) => {
      const normalizedScore = Math.max(m.score / 100, 0.1);
      const { x, y } = getCoordinates(i, normalizedScore);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="overflow-visible">
          <defs>
            <radialGradient id="radarFill" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#eab308" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#ca8a04" stopOpacity="0.1" />
            </radialGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Concentric Polygons Background */}
          {levels.map((level, lvlIdx) => {
            const levelPoints = Array.from({ length: count })
              .map((_, i) => {
                const { x, y } = getCoordinates(i, level);
                return `${x},${y}`;
              })
              .join(' ');
            return (
              <polygon
                key={lvlIdx}
                points={levelPoints}
                fill="none"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth={lvlIdx === levels.length - 1 ? '1.5' : '1'}
              />
            );
          })}

          {/* Axis radiating lines */}
          {metricList.map((_, i) => {
            const { x, y } = getCoordinates(i, 1);
            return (
              <line
                key={i}
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke="rgba(255, 255, 255, 0.12)"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
            );
          })}

          {/* Filled Metric Radar Area */}
          <polygon
            points={points}
            fill="url(#radarFill)"
            stroke="#facc15"
            strokeWidth="2.5"
            filter="url(#glow)"
            className="transition-all duration-500 ease-out"
          />

          {/* Dots on Vertices & Labels */}
          {metricList.map((m, i) => {
            const normalized = Math.max(m.score / 100, 0.1);
            const { x, y } = getCoordinates(i, normalized);
            const labelPos = getCoordinates(i, 1.22);
            const isHovered = hoveredMetric?.name === m.name;

            return (
              <g
                key={m.name}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredMetric(m)}
                onMouseLeave={() => setHoveredMetric(null)}
              >
                {/* Vertex dot */}
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 6 : 4}
                  fill={isHovered ? '#ffffff' : '#facc15'}
                  stroke="#000000"
                  strokeWidth="2"
                  className="transition-transform duration-200"
                />

                {/* Text Label */}
                <text
                  x={labelPos.x}
                  y={labelPos.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={isHovered ? '#fef08a' : '#d4d4d8'}
                  fontSize={isHovered ? '11px' : '10px'}
                  fontWeight={isHovered ? '700' : '500'}
                  className="select-none transition-colors"
                >
                  {m.label}
                </text>
                <text
                  x={labelPos.x}
                  y={labelPos.y + 12}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#ca8a04"
                  fontSize="9px"
                  fontWeight="700"
                >
                  {m.score}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Hovered Metric Callout */}
      <div className="h-10 mt-2 text-center flex items-center justify-center">
        {hoveredMetric ? (
          <p className="text-xs text-amber-300 font-medium animate-in fade-in">
            <span className="font-bold text-white">{hoveredMetric.label} ({hoveredMetric.score}分):</span> {hoveredMetric.comment}
          </p>
        ) : (
          <p className="text-[11px] text-neutral-400">
            滑鼠游標移至六維頂點可查看個別診斷分析
          </p>
        )}
      </div>
    </div>
  );
};
