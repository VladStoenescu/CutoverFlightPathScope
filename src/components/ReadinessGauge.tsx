import React from 'react';
import { getReadinessColor } from '../models';

interface Props {
  pct: number;
  size?: number;
  label?: string;
}

export const ReadinessGauge: React.FC<Props> = ({ pct, size = 120, label }) => {
  const r = (size / 2) - 10;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (pct / 100) * circumference;
  const color = getReadinessColor(pct);

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={cx} cy={cy} r={r}
          fill="none" stroke="#1e293b" strokeWidth="10"
        />
        <circle
          cx={cx} cy={cy} r={r}
          fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
        <text x={cx} y={cy + 6} textAnchor="middle" fill={color} fontSize={size * 0.2} fontWeight="bold">
          {pct}%
        </text>
      </svg>
      {label && <span className="text-xs text-slate-400">{label}</span>}
    </div>
  );
};
