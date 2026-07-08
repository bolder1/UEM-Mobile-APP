import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Line, Path, Stop } from 'react-native-svg';
import { useTheme } from '../theme/ThemeProvider';

const POINTS = 28;

function buildPath(values: number[], width: number, height: number, max: number) {
  if (values.length < 2) return '';
  const step = width / (POINTS - 1);
  const padded = Array(POINTS - values.length).fill(values[0] ?? 0).concat(values);
  return padded
    .map((v, i) => {
      const x = i * step;
      const y = height - (Math.max(0, v) / max) * height;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
}

/** Live rolling sparkline for download/upload throughput — samples the live
 * values it's given each time they change, keeping a fixed-size trailing
 * window so the line reads as continuous motion rather than a static chart. */
export function TrafficChart({ down, up, height = 120 }: { down: number; up: number; height?: number }) {
  const { colors } = useTheme();
  const [width, setWidth] = useState(0);
  const downHistory = useRef<number[]>([]);
  const upHistory = useRef<number[]>([]);
  const [, force] = useState(0);

  useEffect(() => {
    downHistory.current = [...downHistory.current, down].slice(-POINTS);
    upHistory.current = [...upHistory.current, up].slice(-POINTS);
    force((n) => n + 1);
  }, [down, up]);

  const max = Math.max(60, ...downHistory.current, ...upHistory.current) * 1.15;
  const downPath = width ? buildPath(downHistory.current, width, height, max) : '';
  const upPath = width ? buildPath(upHistory.current, width, height, max) : '';
  const downArea = downPath ? `${downPath} L ${width} ${height} L 0 ${height} Z` : '';

  return (
    <View style={styles.wrap} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 && (
        <Svg width={width} height={height}>
          <Defs>
            <LinearGradient id="downFill" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={colors.primary} stopOpacity={0.28} />
              <Stop offset="1" stopColor={colors.primary} stopOpacity={0} />
            </LinearGradient>
          </Defs>
          {[0.25, 0.5, 0.75].map((f) => (
            <Line key={f} x1={0} y1={height * f} x2={width} y2={height * f} stroke={colors.hairline} strokeWidth={1} />
          ))}
          <Path d={downArea} fill="url(#downFill)" />
          <Path d={downPath} stroke={colors.primary} strokeWidth={2.5} fill="none" strokeLinejoin="round" strokeLinecap="round" />
          <Path d={upPath} stroke={colors.success} strokeWidth={2} fill="none" strokeLinejoin="round" strokeLinecap="round" opacity={0.85} />
        </Svg>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%' },
});
