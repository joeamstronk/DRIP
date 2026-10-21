import React, { useState } from 'react';
import { CreditScoreHistoryPoint } from '../../types/ipdr';
import { TrendingUp, TrendingDown, Minus, Activity, Sparkles, CheckCircle2 } from 'lucide-react';

interface CreditScoreSparklineProps {
  history?: CreditScoreHistoryPoint[];
  currentScore: number;
}

export const CreditScoreSparkline: React.FC<CreditScoreSparklineProps> = ({
  history,
  currentScore,
}) => {
  // Ensure we always have 6 months of valid points
  const points: CreditScoreHistoryPoint[] = React.useMemo(() => {
    if (history && history.length >= 2) {
      return history;
    }
    // Fallback generated last 6 months trend if none supplied
    const monthNames = ['May 2026', 'Jun 2026', 'Jul 2026', 'Aug 2026', 'Sep 2026', 'Oct 2026'];
    const shortNames = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
    const base = Math.max(350, currentScore - 28);
    return monthNames.map((m, idx) => {
      const s = Math.round(base + (idx / 5) * 28);
      const prev = idx === 0 ? s : Math.round(base + ((idx - 1) / 5) * 28);
      const diff = s - prev;
      return {
        month: m,
        monthShort: shortNames[idx],
        score: s,
        grade: s >= 750 ? 'A+' : s >= 680 ? 'A' : s >= 600 ? 'B' : 'C',
        change: diff,
        changeDirection: diff > 0 ? 'UP' : diff < 0 ? 'DOWN' : 'STABLE',
        event: idx === 5 ? 'Current cycle assessment' : 'Consistent on-time settlement',
      };
    });
  }, [history, currentScore]);

  const [hoveredIdx, setHoveredIdx] = useState<number>(points.length - 1);

  // Statistics calculations
  const scores = points.map((p) => p.score);
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);
  const startScore = points[0]?.score ?? currentScore;
  const endScore = points[points.length - 1]?.score ?? currentScore;
  const totalChange = endScore - startScore;
  const percentChange = startScore > 0 ? ((totalChange / startScore) * 100).toFixed(1) : '0.0';

  // SVG dimensions
  const svgWidth = 640;
  const svgHeight = 140;
  const paddingX = 40;
  const paddingTop = 25;
  const paddingBottom = 25;

  const scoreRange = Math.max(20, maxScore - minScore);
  const chartMin = Math.max(300, minScore - 8);
  const chartMax = Math.min(850, maxScore + 8);
  const chartRange = chartMax - chartMin;

  const getCoordinates = (index: number, score: number) => {
    const x =
      paddingX +
      (index / (points.length - 1)) * (svgWidth - paddingX * 2);
    const y =
      svgHeight -
      paddingBottom -
      ((score - chartMin) / chartRange) * (svgHeight - paddingTop - paddingBottom);
    return { x, y };
  };

  const coords = points.map((p, idx) => getCoordinates(idx, p.score));

  // Generate smooth cubic bezier SVG path
  const generateSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;

    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(pts.length - 1, i + 2)];

      // Tension factor
      const tension = 0.2;
      const cp1x = p1.x + (p2.x - p0.x) * tension;
      const cp1y = p1.y + (p2.y - p0.y) * tension;
      const cp2x = p2.x - (p3.x - p1.x) * tension;
      const cp2y = p2.y - (p3.y - p1.y) * tension;

      path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return path;
  };

  const linePath = generateSmoothPath(coords);
  const areaPath = `${linePath} L ${coords[coords.length - 1].x} ${svgHeight - paddingBottom} L ${coords[0].x} ${svgHeight - paddingBottom} Z`;

  // Guide lines scores (Low, Mid, High)
  const midScoreVal = Math.round((chartMin + chartMax) / 2);
  const guideScores = [
    { label: `${chartMax}`, y: getCoordinates(0, chartMax).y },
    { label: `${midScoreVal}`, y: getCoordinates(0, midScoreVal).y },
    { label: `${chartMin}`, y: getCoordinates(0, chartMin).y },
  ];

  const activePoint = points[hoveredIdx] || points[points.length - 1];
  const activeCoord = coords[hoveredIdx] || coords[coords.length - 1];

  // Stability classification
  const getStabilityBadge = () => {
    if (totalChange >= 15) {
      return {
        label: 'Upward Stability Trend',
        color: 'text-emerald-800 bg-emerald-50 border-emerald-200',
        icon: <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />,
      };
    }
    if (totalChange >= 0) {
      return {
        label: 'Stable Continuous Prime',
        color: 'text-cyan-800 bg-cyan-50 border-cyan-200',
        icon: <Sparkles className="w-3.5 h-3.5 text-cyan-600" />,
      };
    }
    return {
      label: 'Delinquency Recovering',
      color: 'text-amber-800 bg-amber-50 border-amber-200',
      icon: <TrendingDown className="w-3.5 h-3.5 text-amber-600" />,
    };
  };

  const stability = getStabilityBadge();

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
      {/* Sparkline Header & Trend KPI */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-cyan-50 text-cyan-600 border border-cyan-200">
              <Activity className="w-4 h-4" />
            </span>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              6-Month Credit Score History & Stability Trend
            </h3>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Rolling monthly telco behavioral scoring evaluating repayment consistency and tenure progression
          </p>
        </div>

        {/* 6-Month Trajectory Pills */}
        <div className="flex items-center gap-2 shrink-0">
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono-numbers font-bold border ${stability.color}`}
          >
            {stability.icon}
            <span>{stability.label}</span>
          </div>

          <div
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono-numbers font-bold border ${
              totalChange >= 0
                ? 'text-emerald-700 bg-emerald-50/60 border-emerald-200'
                : 'text-rose-700 bg-rose-50/60 border-rose-200'
            }`}
          >
            {totalChange > 0 ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : totalChange < 0 ? (
              <TrendingDown className="w-3.5 h-3.5" />
            ) : (
              <Minus className="w-3.5 h-3.5" />
            )}
            <span>
              {totalChange > 0 ? `+${totalChange}` : totalChange} pts ({totalChange > 0 ? `+${percentChange}` : `${percentChange}`}%)
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Sparkline Chart */}
      <div className="relative bg-slate-50/60 rounded-xl border border-slate-200/80 p-3 overflow-hidden">
        {/* Metric summary bar inside chart container */}
        <div className="flex items-center justify-between text-[11px] font-mono-numbers text-slate-500 px-2 mb-1">
          <div className="flex items-center gap-4">
            <span>
              Period: <strong className="text-slate-800">{points[0]?.monthShort} - {points[points.length - 1]?.month}</strong>
            </span>
            <span>
              6M Range: <strong className="text-slate-800">{minScore} - {maxScore} pts</strong>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-slate-600">
              <span className="w-2 h-2 rounded-full bg-cyan-600 inline-block"></span>
              Score Curve
            </span>
            <span className="text-[10px] text-slate-400">Hover points for month events</span>
          </div>
        </div>

        {/* SVG Sparkline */}
        <div className="w-full relative">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-36 overflow-visible select-none"
          >
            <defs>
              {/* Gradient for area fill under the sparkline */}
              <linearGradient id="scoreSparklineGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0891b2" stopOpacity="0.28" />
                <stop offset="60%" stopColor="#0891b2" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#0891b2" stopOpacity="0.0" />
              </linearGradient>

              {/* Filter for subtle glow */}
              <filter id="sparklineGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#0891b2" floodOpacity="0.25" />
              </filter>
            </defs>

            {/* Horizontal guide lines */}
            {guideScores.map((g, idx) => (
              <g key={idx}>
                <line
                  x1={paddingX}
                  y1={g.y}
                  x2={svgWidth - paddingX}
                  y2={g.y}
                  stroke="#e2e8f0"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={paddingX - 8}
                  y={g.y + 3}
                  textAnchor="end"
                  fill="#94a3b8"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {g.label}
                </text>
              </g>
            ))}

            {/* Gradient Area Fill */}
            <path d={areaPath} fill="url(#scoreSparklineGradient)" />

            {/* Sparkline Curve */}
            <path
              d={linePath}
              fill="none"
              stroke="#0891b2"
              strokeWidth="2.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#sparklineGlow)"
            />

            {/* Vertical Indicator on Active/Hovered Point */}
            {activeCoord && (
              <line
                x1={activeCoord.x}
                y1={paddingTop}
                x2={activeCoord.x}
                y2={svgHeight - paddingBottom}
                stroke="#0891b2"
                strokeWidth="1.5"
                strokeDasharray="2 2"
                opacity="0.6"
              />
            )}

            {/* Month Data Coordinate Dots */}
            {coords.map((coord, idx) => {
              const isHovered = hoveredIdx === idx;
              const pt = points[idx];
              const isLast = idx === points.length - 1;

              return (
                <g
                  key={idx}
                  className="cursor-pointer transition-all duration-150"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onClick={() => setHoveredIdx(idx)}
                >
                  {/* Outer halo */}
                  <circle
                    cx={coord.x}
                    cy={coord.y}
                    r={isHovered ? 8 : isLast ? 6 : 4}
                    fill={isHovered ? '#0891b2' : '#0891b2'}
                    fillOpacity={isHovered ? 0.25 : 0.15}
                  />

                  {/* Core dot */}
                  <circle
                    cx={coord.x}
                    cy={coord.y}
                    r={isHovered ? 5 : isLast ? 4 : 3}
                    fill={isHovered ? '#0e7490' : isLast ? '#0891b2' : '#ffffff'}
                    stroke="#0891b2"
                    strokeWidth={isHovered ? 2.5 : 2}
                  />

                  {/* Score Label above point */}
                  <text
                    x={coord.x}
                    y={coord.y - (isHovered ? 12 : 9)}
                    textAnchor="middle"
                    fill={isHovered ? '#0f172a' : '#475569'}
                    fontWeight={isHovered ? 'bold' : '600'}
                    fontSize={isHovered ? '11' : '9.5'}
                    fontFamily="monospace"
                  >
                    {pt.score}
                  </text>

                  {/* Month Label below chart line */}
                  <text
                    x={coord.x}
                    y={svgHeight - 8}
                    textAnchor="middle"
                    fill={isHovered ? '#0891b2' : '#64748b'}
                    fontWeight={isHovered ? 'bold' : 'normal'}
                    fontSize="10"
                    fontFamily="sans-serif"
                  >
                    {pt.monthShort}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Selected Month Detail Callout Card */}
        {activePoint && (
          <div className="mt-3 p-3 bg-white rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-50 border border-cyan-200 flex flex-col items-center justify-center shrink-0">
                <span className="text-[9px] font-bold text-cyan-800 uppercase tracking-tight">
                  {activePoint.monthShort}
                </span>
                <span className="text-xs font-extrabold text-cyan-600 font-mono-numbers">
                  26
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">
                    {activePoint.month} Assessment:
                  </span>
                  <span className="text-sm font-extrabold text-cyan-700 font-mono-numbers">
                    {activePoint.score}
                  </span>
                  <span className="text-xs text-slate-400 font-mono-numbers">/ 850</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                    Grade {activePoint.grade}
                  </span>
                </div>

                <div className="text-[11px] text-slate-600 flex items-center gap-1.5 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                  <span>{activePoint.event || 'Continuous positive telecom tenure settlement'}</span>
                </div>
              </div>
            </div>

            {/* Delta vs prior month */}
            <div className="flex items-center gap-2 self-start md:self-center shrink-0 font-mono-numbers text-xs">
              <span className="text-slate-400 text-[11px]">Monthly Delta:</span>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded font-bold ${
                  activePoint.change > 0
                    ? 'text-emerald-800 bg-emerald-50 border border-emerald-200'
                    : activePoint.change < 0
                    ? 'text-rose-800 bg-rose-50 border border-rose-200'
                    : 'text-slate-600 bg-slate-100 border border-slate-200'
                }`}
              >
                {activePoint.change > 0 ? (
                  <TrendingUp className="w-3 h-3 text-emerald-600" />
                ) : activePoint.change < 0 ? (
                  <TrendingDown className="w-3 h-3 text-rose-600" />
                ) : (
                  <Minus className="w-3 h-3 text-slate-400" />
                )}
                <span>
                  {activePoint.change > 0
                    ? `+${activePoint.change} pts`
                    : activePoint.change < 0
                    ? `${activePoint.change} pts`
                    : 'Unchanged'}
                </span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 6-Month Timeline Pills Quick Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
        {points.map((pt, idx) => {
          const isSelected = hoveredIdx === idx;
          const isPositive = pt.change > 0;
          const isNegative = pt.change < 0;

          return (
            <button
              key={idx}
              type="button"
              onClick={() => setHoveredIdx(idx)}
              className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-cyan-50/70 border-cyan-400 ring-2 ring-cyan-200 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-slate-700">{pt.monthShort}</span>
                <span
                  className={`text-[10px] font-mono-numbers font-semibold ${
                    isPositive
                      ? 'text-emerald-700'
                      : isNegative
                      ? 'text-rose-700'
                      : 'text-slate-400'
                  }`}
                >
                  {isPositive ? `+${pt.change}` : isNegative ? `${pt.change}` : '—'}
                </span>
              </div>
              <div className="text-sm font-extrabold text-slate-900 font-mono-numbers mt-0.5">
                {pt.score}
              </div>
              <div className="text-[10px] text-slate-500 font-medium">
                Grade {pt.grade}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
