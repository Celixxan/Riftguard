import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Ellipse, Path, Polygon, Rect } from 'react-native-svg';
import { ENEMIES } from '@/game/data/enemies';
import { Enemy } from '@/types/game';

interface Props {
  enemy: Enemy;
  px: number;
  frozen: boolean;
  slowed: boolean;
  colorblind: boolean;
}

export function EnemySprite({ enemy, px, frozen, slowed, colorblind }: Props) {
  const definition = ENEMIES[enemy.type];
  const size = definition.size * px * 2;
  const hpRatio = Math.max(0, enemy.hp / enemy.maxHp);
  const shieldRatio = enemy.maxShield > 0 ? Math.max(0, enemy.shield / enemy.maxShield) : 0;
  const color = frozen ? '#c9e8e8' : definition.color;

  return (
    <View style={{ width: size, height: size + 10, alignItems: 'center' }}>
      <View style={[styles.hpTrack, { width: Math.max(size, 24) }]}>
        <View
          style={[
            styles.hpFill,
            { width: `${hpRatio * 100}%`, backgroundColor: hpRatio > 0.4 ? '#80ad60' : '#c75a4c' },
          ]}
        />
        {shieldRatio > 0 ? (
          <View style={[styles.shieldFill, { width: `${shieldRatio * 100}%` }]} />
        ) : null}
      </View>

      <Svg width={size} height={size} viewBox="0 0 48 48">
        <Ellipse cx={24} cy={42} rx={13} ry={3.5} fill="#2b2117" opacity={0.35} />

        {definition.shape === 'blob' ? (
          <>
            <Path d="M10 38 Q8 19 16 13 Q24 7 32 13 Q40 20 38 38 Z" fill={color} />
            <Polygon points="15,14 11,5 21,12" fill={color} />
            <Polygon points="33,14 37,5 27,12" fill={color} />
            <Circle cx={18} cy={24} r={3} fill="#2a1d29" />
            <Circle cx={30} cy={24} r={3} fill="#2a1d29" />
            <Path d="M19 32 Q24 35 29 32" fill="none" stroke="#2a1d29" strokeWidth={2} />
          </>
        ) : null}

        {definition.shape === 'dart' ? (
          <>
            <Ellipse cx={23} cy={31} rx={15} ry={8} fill={color} />
            <Circle cx={34} cy={24} r={7} fill={color} />
            <Polygon points="30,20 31,10 36,18" fill={color} />
            <Polygon points="36,18 42,12 40,23" fill={color} />
            <Circle cx={37} cy={23} r={1.7} fill="#281d17" />
            <Path d="M10 31 Q4 25 6 20" fill="none" stroke={color} strokeWidth={4} />
            <Rect x={14} y={36} width={4} height={8} rx={2} fill="#50362c" />
            <Rect x={28} y={36} width={4} height={8} rx={2} fill="#50362c" />
          </>
        ) : null}

        {definition.shape === 'block' ? (
          <>
            <Rect x={9} y={20} width={30} height={23} rx={9} fill={color} />
            <Circle cx={24} cy={17} r={12} fill={color} />
            <Polygon points="15,12 10,4 20,9" fill="#d2c08d" />
            <Polygon points="33,12 38,4 28,9" fill="#d2c08d" />
            <Circle cx={19} cy={17} r={2.4} fill="#27301f" />
            <Circle cx={29} cy={17} r={2.4} fill="#27301f" />
            <Path d="M18 25 Q24 21 30 25" fill="none" stroke="#3a2c22" strokeWidth={2.5} />
          </>
        ) : null}

        {definition.shape === 'crystal' ? (
          <>
            <Circle cx={24} cy={24} r={18} fill="none" stroke="#d4ebe5" strokeWidth={2} opacity={0.8} />
            <Polygon points="24,4 39,23 24,42 9,23" fill={color} />
            <Polygon points="24,10 33,23 24,35 16,23" fill="#d4ebe5" opacity={0.55} />
            <Circle cx={24} cy={23} r={3} fill="#35545b" />
          </>
        ) : null}

        {definition.shape === 'cluster' ? (
          <>
            {[{ x: 15, y: 20 }, { x: 32, y: 21 }, { x: 24, y: 34 }].map((bug, index) => (
              <Path
                key={index}
                d={`M${bug.x - 6} ${bug.y + 5} Q${bug.x} ${bug.y - 8} ${bug.x + 6} ${bug.y + 5} Q${bug.x} ${bug.y + 10} ${bug.x - 6} ${bug.y + 5}`}
                fill={color}
              />
            ))}
            <Circle cx={15} cy={19} r={1.5} fill="#35291b" />
            <Circle cx={32} cy={20} r={1.5} fill="#35291b" />
            <Circle cx={24} cy={33} r={1.5} fill="#35291b" />
          </>
        ) : null}

        {definition.shape === 'boss' ? (
          <>
            <Rect x={6} y={17} width={36} height={27} rx={11} fill={enemy.enraged ? '#8b453b' : color} />
            <Circle cx={24} cy={17} r={14} fill={enemy.enraged ? '#8b453b' : color} />
            <Polygon points="13,11 5,2 18,7" fill="#d0b67d" />
            <Polygon points="35,11 43,2 30,7" fill="#d0b67d" />
            <Circle cx={18} cy={17} r={3} fill={enemy.enraged ? '#f0ce63' : '#2d211a'} />
            <Circle cx={30} cy={17} r={3} fill={enemy.enraged ? '#f0ce63' : '#2d211a'} />
            <Path d="M15 28 Q24 21 33 28" fill="none" stroke="#2d211a" strokeWidth={3} />
            <Rect x={2} y={24} width={9} height={7} rx={3.5} fill={enemy.enraged ? '#8b453b' : color} />
            <Rect x={37} y={24} width={9} height={7} rx={3.5} fill={enemy.enraged ? '#8b453b' : color} />
          </>
        ) : null}
      </Svg>

      {frozen || slowed ? (
        <View style={[styles.status, { backgroundColor: frozen ? '#c9e8e8' : '#779fb7' }]}>
          {colorblind ? <View style={frozen ? styles.freezeMark : styles.slowMark} /> : null}
        </View>
      ) : null}
      {enemy.priority ? <View style={styles.priorityRing} pointerEvents="none" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  hpTrack: {
    height: 5,
    backgroundColor: '#3c3326',
    borderRadius: 3,
    marginBottom: 1,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#241a12',
  },
  hpFill: { height: '100%', borderRadius: 2 },
  shieldFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    backgroundColor: '#a9d5d7',
    opacity: 0.9,
    borderRadius: 2,
  },
  status: {
    position: 'absolute',
    top: 8,
    right: -4,
    width: 11,
    height: 11,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#f5e9c8',
  },
  freezeMark: { width: 4, height: 4, backgroundColor: '#20333a', transform: [{ rotate: '45deg' }] },
  slowMark: { width: 5, height: 2, backgroundColor: '#20333a' },
  priorityRing: {
    position: 'absolute',
    top: 4,
    left: -4,
    right: -4,
    bottom: -4,
    borderWidth: 2,
    borderColor: '#e6c15a',
    borderRadius: 999,
  },
});
