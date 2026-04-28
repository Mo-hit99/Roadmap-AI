import React from 'react';

interface SuccessGaugeProps {
  score: number;
}

const polarToCartesian = (cx: number, cy: number, r: number, angle: number) => {
  const radians = ((angle - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(radians),
    y: cy + r * Math.sin(radians),
  };
};

const describeArc = (cx: number, cy: number, r: number, startAngle: number, endAngle: number) => {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
};

const SuccessGauge: React.FC<SuccessGaugeProps> = ({ score }) => {
  const clampedScore = Math.max(0, Math.min(score, 100));
  const startAngle = -135;
  const endAngle = 135;
  const filledAngle = startAngle + ((endAngle - startAngle) * clampedScore) / 100;

  return (
    <div className="success-gauge">
      <svg viewBox="0 0 140 120" role="img" aria-label={`Success score ${clampedScore} out of 100`}>
        <defs>
          <linearGradient id="warmGauge" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--accent-ember)" />
            <stop offset="100%" stopColor="var(--accent-gold)" />
          </linearGradient>
        </defs>
        <path className="gauge-track" d={describeArc(70, 72, 48, startAngle, endAngle)} />
        <path className="gauge-fill" d={describeArc(70, 72, 48, startAngle, filledAngle)} />
      </svg>
      <div className="gauge-center">
        <strong className="mono">{clampedScore}</strong>
        <span className="mono">/ 100</span>
      </div>
    </div>
  );
};

export default SuccessGauge;
