import React from 'react';
import Svg, { Circle } from 'react-native-svg';

interface Props {
  size?: number;
  progress: number; // 0-100
  trackColor?: string;
  color?: string;
  strokeWidth?: number;
}

export function ProgressRing({
  size = 48,
  progress,
  trackColor = 'rgba(255,255,255,0.28)',
  color = '#FFFFFF',
  strokeWidth = 3,
}: Props) {
  const r = size / 2 - strokeWidth;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - progress / 100);
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: [{ rotate: '-90deg' }] }}>
      <Circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
      />
    </Svg>
  );
}
