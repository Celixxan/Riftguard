import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Path, Polygon, Rect } from 'react-native-svg';
import { GUARDIANS } from '@/game/data/guardians';
import { GuardianTypeId } from '@/types/game';

interface Props {
  type: GuardianTypeId;
  size: number;
  rank?: number;
}

export function GuardianSprite({ type, size, rank = 1 }: Props) {
  const definition = GUARDIANS[type];
  const glow = Math.min(0.62, 0.18 + rank * 0.09);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={[
          styles.base,
          {
            width: size * 0.94,
            height: size * 0.52,
            borderRadius: size,
            backgroundColor: '#26361f',
            borderColor: definition.glow,
          },
        ]}
      />
      <View
        style={[
          styles.aura,
          {
            width: size * 0.92,
            height: size * 0.92,
            borderRadius: size,
            backgroundColor: definition.glow,
            opacity: glow * 0.28,
          },
        ]}
      />
      <Svg width={size} height={size} viewBox="0 0 48 48">
        {type === 'arc' ? (
          <>
            <Polygon points="13,42 18,21 30,21 36,42" fill="#355d3a" />
            <Path d="M15 22 Q24 7 33 22 Q29 18 24 18 Q19 18 15 22" fill="#294b31" />
            <Circle cx={24} cy={19} r={5.2} fill="#d9b98d" />
            <Path d="M17 21 Q24 10 31 21 Q24 16 17 21" fill="#416d43" />
            <Path d="M37 11 Q45 24 37 39" fill="none" stroke="#8a5e34" strokeWidth={2.4} />
            <Line x1={37} y1={11} x2={37} y2={39} stroke="#ead9a5" strokeWidth={0.8} />
            <Line x1={11} y1={29} x2={39} y2={22} stroke="#d9c99c" strokeWidth={1.5} />
            <Polygon points="39,22 35,20 36,24" fill={definition.glow} />
          </>
        ) : null}

        {type === 'nova' ? (
          <>
            <Polygon points="12,42 18,21 30,21 37,42" fill="#8c3f28" />
            <Circle cx={24} cy={18} r={5.4} fill="#dfb37e" />
            <Path d="M16 20 Q24 7 32 20 Q24 15 16 20" fill="#6e3024" />
            <Line x1={35} y1={14} x2={35} y2={41} stroke="#6f4a2d" strokeWidth={2.8} />
            <Circle cx={35} cy={11} r={5.5} fill="#f2bd62" opacity={0.95} />
            <Path d="M35 3 C31 8 32 13 35 15 C40 11 40 7 35 3" fill="#e56d30" />
            <Circle cx={22} cy={29} r={3.4} fill={definition.glow} opacity={0.8} />
          </>
        ) : null}

        {type === 'cryo' ? (
          <>
            <Polygon points="12,42 18,22 30,22 37,42" fill="#4b6f86" />
            <Circle cx={24} cy={19} r={5.2} fill="#d8c1a0" />
            <Path d="M16 21 Q24 8 32 21 Q24 15 16 21" fill="#385c72" />
            <Line x1={36} y1={14} x2={36} y2={42} stroke="#72583d" strokeWidth={2.5} />
            <Polygon points="36,3 41,10 36,17 31,10" fill="#c5e4e9" />
            <Polygon points="36,6 39,10 36,14 33,10" fill="#78a9bf" />
            <Path d="M16 31 Q24 25 31 32" fill="none" stroke="#d2eef0" strokeWidth={1.5} />
          </>
        ) : null}

        {type === 'engi' ? (
          <>
            <Polygon points="11,42 17,22 31,22 38,42" fill="#4e6b32" />
            <Circle cx={24} cy={19} r={5.2} fill="#caa77a" />
            <Path d="M16 21 Q24 8 32 21 Q24 15 16 21" fill="#385327" />
            <Path d="M17 14 Q11 9 13 5 M31 14 Q37 9 35 5" fill="none" stroke="#8a7041" strokeWidth={2} />
            <Path d="M13 7 Q8 6 8 2 M35 7 Q40 6 40 2" fill="none" stroke="#8a7041" strokeWidth={1.5} />
            <Circle cx={36} cy={27} r={5} fill="#9fc760" opacity={0.85} />
            <Path d="M36 21 Q43 27 36 34 Q29 27 36 21" fill="#b7ce72" />
            <Line x1={36} y1={24} x2={36} y2={31} stroke="#4b6a31" strokeWidth={1} />
          </>
        ) : null}

        <Rect x={12} y={40} width={25} height={3.5} rx={1.75} fill="#30251b" opacity={0.75} />
      </Svg>

      {rank > 0 ? (
        <View style={styles.pips}>
          {Array.from({ length: rank }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.pip,
                {
                  width: Math.max(5, size * 0.085),
                  height: Math.max(5, size * 0.085),
                  backgroundColor: rank >= 4 ? '#e6c15a' : definition.glow,
                },
              ]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    position: 'absolute',
    bottom: '3%',
    borderWidth: 1.5,
    opacity: 0.92,
    transform: [{ scaleY: 0.42 }],
  },
  aura: { position: 'absolute' },
  pips: {
    position: 'absolute',
    bottom: -2,
    flexDirection: 'row',
    gap: 2,
  },
  pip: {
    borderRadius: 1,
    borderWidth: 0.5,
    borderColor: '#fff1c9',
    transform: [{ rotate: '45deg' }],
  },
});
