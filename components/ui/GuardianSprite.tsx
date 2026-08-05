import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path, Polygon, Rect } from 'react-native-svg';
import { GUARDIANS } from '@/game/data/guardians';
import { GuardianTypeId } from '@/types/game';

interface Props {
  type: GuardianTypeId;
  size: number;
  rank?: number;
}

export function GuardianSprite({ type, size, rank = 1 }: Props) {
  const def = GUARDIANS[type];
  const s = size;
  const glow = 0.25 + rank * 0.12;
  return (
    <View style={{ width: s, height: s, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={[
          styles.glow,
          {
            width: s * 1.05,
            height: s * 1.05,
            borderRadius: s,
            backgroundColor: def.color,
            opacity: glow * 0.35,
          },
        ]}
      />
      <Svg width={s} height={s} viewBox="0 0 40 40">
        {type === 'arc' && (
          <>
            <Polygon points="20,4 34,30 20,23 6,30" fill={def.color} />
            <Polygon points="20,12 28,28 20,23 12,28" fill="#05070d" opacity={0.5} />
            <Circle cx={20} cy={20} r={3} fill={def.glow} />
          </>
        )}
        {type === 'nova' && (
          <>
            <Path d="M6 30 A14 14 0 0 1 34 30 Z" fill={def.color} />
            <Rect x={17} y={6} width={6} height={16} rx={3} fill={def.color} />
            <Circle cx={20} cy={8} r={4} fill={def.glow} />
            <Rect x={8} y={30} width={24} height={5} rx={2} fill="#1e293b" />
          </>
        )}
        {type === 'cryo' && (
          <>
            <Circle cx={20} cy={20} r={14} fill="none" stroke={def.color} strokeWidth={3} />
            <Path d="M20 6 A14 14 0 0 1 34 20" fill="none" stroke={def.glow} strokeWidth={3} />
            <Circle cx={20} cy={20} r={6} fill={def.color} />
            <Circle cx={20} cy={20} r={2.5} fill="#05070d" />
          </>
        )}
        {type === 'engi' && (
          <>
            <Polygon
              points="20,5 29,10 33,20 29,30 20,35 11,30 7,20 11,10"
              fill={def.color}
            />
            <Circle cx={20} cy={20} r={7} fill="#05070d" opacity={0.6} />
            <Circle cx={20} cy={20} r={4} fill={def.glow} />
          </>
        )}
      </Svg>
      {rank > 0 && (
        <View style={styles.pips}>
          {Array.from({ length: rank }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.pip,
                {
                  width: Math.max(4, s * 0.09),
                  height: Math.max(4, s * 0.09),
                  backgroundColor: rank >= 4 ? '#fde047' : def.glow,
                },
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  glow: { position: 'absolute' },
  pips: {
    position: 'absolute',
    bottom: -2,
    flexDirection: 'row',
    gap: 2,
  },
  pip: { borderRadius: 99 },
});
