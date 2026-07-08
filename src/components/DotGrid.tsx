import React from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Defs, Pattern, Circle, Rect } from 'react-native-svg';

export function DotGrid({ color, size = 18, dotRadius = 1 }: { color: string; size?: number; dotRadius?: number }) {
  const patternId = 'dotgrid';
  return (
    <Svg width="100%" height="100%" style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <Pattern id={patternId} width={size} height={size} patternUnits="userSpaceOnUse">
          <Circle cx={dotRadius} cy={dotRadius} r={dotRadius} fill={color} />
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </Svg>
  );
}
