import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Path, Text as SvgText, G } from 'react-native-svg';
import { theme } from '../../theme';

const DIRECTIONS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
const ANGLES = [270, 315, 0, 45, 90, 135, 180, 225];

const AspectCompass = ({ aspects = [], size = 100 }) => {
  const center = size / 2;
  const radius = size / 2 - 14;
  const sectorAngle = 45;

  const getPath = (startAngle) => {
    const start = ((startAngle - sectorAngle / 2) * Math.PI) / 180;
    const end = ((startAngle + sectorAngle / 2) * Math.PI) / 180;
    const x1 = center + radius * Math.cos(start);
    const y1 = center + radius * Math.sin(start);
    const x2 = center + radius * Math.cos(end);
    const y2 = center + radius * Math.sin(end);
    return `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`;
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle cx={center} cy={center} r={radius} fill={theme.colors.backgroundTertiary} stroke={theme.colors.border} strokeWidth={1} />
        {DIRECTIONS.map((dir, i) => {
          const isActive = aspects.includes(dir);
          return (
            <Path
              key={dir}
              d={getPath(ANGLES[i])}
              fill={isActive ? theme.colors.brandOrange : 'transparent'}
              opacity={isActive ? 0.6 : 0}
            />
          );
        })}
        {DIRECTIONS.map((dir, i) => {
          const angle = (ANGLES[i] * Math.PI) / 180;
          const labelRadius = radius + 9;
          const x = center + labelRadius * Math.cos(angle);
          const y = center + labelRadius * Math.sin(angle);
          const isActive = aspects.includes(dir);
          return (
            <SvgText
              key={`label-${dir}`}
              x={x}
              y={y}
              textAnchor="middle"
              alignmentBaseline="central"
              fontSize={9}
              fontWeight={isActive ? 'bold' : 'normal'}
              fill={isActive ? theme.colors.brandOrange : theme.colors.textTertiary}
            >
              {dir}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AspectCompass;
