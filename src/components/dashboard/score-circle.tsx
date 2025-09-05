"use client";

import { useEffect, useState } from "react";

type ScoreCircleProps = {
  score: number;
  size?: number;
  strokeWidth?: number;
};

export function ScoreCircle({ score, size = 120, strokeWidth = 10 }: ScoreCircleProps) {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const animation = requestAnimationFrame(() => {
        setDisplayScore(score);
    });
    return () => cancelAnimationFrame(animation);
  }, [score]);


  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayScore / 100) * circumference;

  const getColor = () => {
    if (score >= 75) return "hsl(var(--primary))"; // Blue for high scores
    if (score >= 40) return "#f59e0b"; // Amber for medium scores
    return "hsl(var(--destructive))"; // Red for low scores
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor()}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold" style={{ color: getColor() }}>
          {Math.round(displayScore)}
        </span>
        <span className="text-xs font-medium text-muted-foreground">Truth Score</span>
      </div>
    </div>
  );
}
