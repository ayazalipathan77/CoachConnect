'use client';

import { useState } from 'react';

type Datum = { month: string; earned: number; missed: number; commission: number };

const gbp = (minor: number) =>
  `£${(minor / 100).toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

/**
 * Responsive SVG bar chart (no external library). Each month renders a stacked
 * pair of bars: earned (brand) and missed (muted red). Commission is surfaced
 * in the legend and per-bar tooltip.
 */
export function EarningsChart({ data }: { data: Datum[] }) {
  const [hover, setHover] = useState<number | null>(null);

  const max = Math.max(1, ...data.map((d) => Math.max(d.earned, d.missed)));
  const totalEarned = data.reduce((s, d) => s + d.earned, 0);
  const totalMissed = data.reduce((s, d) => s + d.missed, 0);
  const totalCommission = data.reduce((s, d) => s + d.commission, 0);

  const W = 640;
  const H = 220;
  const padX = 8;
  const padBottom = 28;
  const padTop = 12;
  const plotH = H - padBottom - padTop;
  const groupW = (W - padX * 2) / Math.max(1, data.length);
  const barW = Math.min(22, groupW / 3);

  return (
    <div className="bg-[#111111] border border-white/10 rounded-3xl p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h3 className="font-bold">Earnings · last {data.length} months</h3>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-white/60">
            <span className="w-3 h-3 rounded-sm bg-brand inline-block" /> Earned
          </span>
          <span className="flex items-center gap-1.5 text-white/60">
            <span className="w-3 h-3 rounded-sm bg-red-500/40 inline-block" /> Missed
          </span>
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Monthly earnings chart">
        {/* baseline */}
        <line x1={padX} y1={padTop + plotH} x2={W - padX} y2={padTop + plotH} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

        {data.map((d, i) => {
          const gx = padX + i * groupW + groupW / 2;
          const earnedH = (d.earned / max) * plotH;
          const missedH = (d.missed / max) * plotH;
          const baseY = padTop + plotH;
          const active = hover === i;
          return (
            <g
              key={i}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              {/* hover hit area */}
              <rect x={padX + i * groupW} y={padTop} width={groupW} height={plotH} fill="transparent" />
              {/* earned bar */}
              <rect
                x={gx - barW - 1}
                y={baseY - earnedH}
                width={barW}
                height={earnedH}
                rx={3}
                fill="var(--color-brand)"
                opacity={active ? 1 : 0.85}
              />
              {/* missed bar */}
              <rect
                x={gx + 1}
                y={baseY - missedH}
                width={barW}
                height={missedH}
                rx={3}
                fill="rgba(239,68,68,0.4)"
                opacity={active ? 1 : 0.85}
              />
              <text x={gx} y={H - 8} textAnchor="middle" className="fill-white/40" fontSize="11">
                {d.month}
              </text>
              {active && (
                <g>
                  <rect x={gx - 60} y={padTop} width={120} height={50} rx={8} fill="#000" opacity={0.85} />
                  <text x={gx} y={padTop + 18} textAnchor="middle" className="fill-brand" fontSize="11" fontWeight="bold">
                    {gbp(d.earned)} earned
                  </text>
                  <text x={gx} y={padTop + 32} textAnchor="middle" className="fill-white/60" fontSize="10">
                    {gbp(d.missed)} missed
                  </text>
                  <text x={gx} y={padTop + 44} textAnchor="middle" className="fill-white/40" fontSize="10">
                    {gbp(d.commission)} commission
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>

      <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/10">
        <div>
          <p className="text-white/40 text-xs uppercase tracking-widest">Earned</p>
          <p className="font-display font-bold text-lg text-brand">{gbp(totalEarned)}</p>
        </div>
        <div>
          <p className="text-white/40 text-xs uppercase tracking-widest">Missed</p>
          <p className="font-display font-bold text-lg text-white/50">{gbp(totalMissed)}</p>
        </div>
        <div>
          <p className="text-white/40 text-xs uppercase tracking-widest">Commission</p>
          <p className="font-display font-bold text-lg text-white/70">{gbp(totalCommission)}</p>
        </div>
      </div>
      <p className="text-white/30 text-xs mt-3">
        Commission is the platform fee taken on completed sessions. Missed revenue reflects coach fees lost to cancellations.
      </p>
    </div>
  );
}
