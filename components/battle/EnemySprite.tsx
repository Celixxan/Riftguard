import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Polygon, Rect } from 'react-native-svg';
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
  const def = ENEMIES[enemy.type];
  const s = def.size * px * 2;
  const hpRatio = Math.max(0, enemy.hp / enemy.maxHp);
  const shieldRatio = enemy.maxShield > 0 ? Math.max(0, enemy.shield / enemy.maxShield) : 0;
  const color = frozen ? '#bfdbfe' : def.color;

  return (
    <View style={{ width: s, height: s + 10, alignItems: 'center' }}>
      <View style={[styles.hpTrack, { width: Math.max(s, 22) }]}>
        <View style={[styles.hpFill, { width: `${hpRatio * 100}%`, backgroundColor: hpRatio > 0.4 ? '#4ade80' : '#f87171' }]} />
        {shieldRatio > 0 && (
          <View style={[styles.shieldFill, { width: `${shieldRatio * 100}%` }]} />
        )}
      </View>
      <Svg width={s} height={s} viewBox="0 0 40 40">
        {def.shape === 'blob' && (
          <>
            <Circle cx={20} cy={22} r={14} fill={color} />
            <Circle cx={15} cy={19} r={3} fill="#05070d" />
            <Circle cx={25} cy={19} r={3} fill="#05070d" />
          </>
        )}
        {def.shape === 'dart' && (
          <>
            <Polygon points="20,4 32,36 20,28 8,36" fill={color} />
            <Circle cx={20} cy={18} r={3} fill="#05070d" />
          </>
        )}
        {def.shape === 'block' && (
          <>
            <Rect x={6} y={8} width={28} height={28} rx={5} fill={color} />
            <Rect x={12} y={16} width={6} height={6} fill="#05070d" />
            <Rect x={22} y={16} width={6} height={6} fill="#05070d" />
            <Rect x={13} y={27} width={14} height={4} rx={2} fill="#05070d" />
          </>
        )}
        {def.shape === 'crystal' && (
          <>
            <Polygon points="20,3 34,20 20,37 6,20" fill={color} />
            <Polygon points="20,10 28,20 20,30 12,20" fill="#05070d" opacity={0.45} />
          </>
        )}
        {def.shape === 'cluster' && (
          <>
            <Circle cx={14} cy={16} r={8} fill={color} />
            <Circle cx={27} cy={18} r={7} fill={color} opacity={0.85} />
            <Circle cx={20} cy={28} r={8} fill={color} opacity={0.9} />
          </>
        )}
        {def.shape === 'boss' && (
          <>
            <Polygon points="20,2 36,12 36,30 20,38 4,30 4,12" fill={enemy.enraged ? '#ff2d55' : color} />
            <Polygon points="20,8 30,14 30,26 20,32 10,26 10,14" fill="#05070d" opacity={0.5} />
            <Circle cx={20} cy={20} r={5} fill={enemy.enraged ? '#fde047' : '#f9a8d4'} />
          </>
        )}
      </Svg>
      {(frozen || slowed) && (
        <View style={[styles.status, { backgroundColor: frozen ? '#bfdbfe' : '#60a5fa' }]}>
          {colorblind && <View style={frozen ? styles.freezeMark : styles.slowMark} />}
        </View>
      )}
      {enemy.priority && <View style={styles.priorityRing} pointerEvents="none" />}
    </View>
  );
}

const styles = StyleSheet.create({
  hpTrack: {
    height: 4,
    backgroundColor: '#1e293b',
    borderRadius: 2,
    marginBottom: 2,
    overflow: 'hidden',
  },
  hpFill: { height: '100%', borderRadius: 2 },
  shieldFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    backgroundColor: '#7dd3fc',
    opacity: 0.9,
    borderRadius: 2,
  },
  status: {
    position: 'absolute',
    top: 8,
    right: -4,
    width: 10,
    height: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  freezeMark: { width: 4, height: 4, backgroundColor: '#05070d', transform: [{ rotate: '45deg' }] },
  slowMark: { width: 5, height: 2, backgroundColor: '#05070d' },
  priorityRing: {
    position: 'absolute',
    top: 4,
    left: -4,
    right: -4,
    bottom: -4,
    borderWidth: 2,
    borderColor: '#fde047',
    borderRadius: 999,
  },
});
