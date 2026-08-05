import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { BattleState, setPriorityTarget, tryMerge, validMergeTargets } from '@/game/sim/battle';
import { cellCenter, FIELD } from '@/game/data/balance';
import { ENEMIES } from '@/game/data/enemies';
import { GUARDIANS } from '@/game/data/guardians';
import { EnemySprite } from '@/components/battle/EnemySprite';
import { GuardianSprite } from '@/components/ui/GuardianSprite';
import { C } from '@/theme/colors';
import { hapticMedium, hapticError } from '@/utils/haptics';

interface Props {
  battle: BattleState;
  px: number;
  reduceMotion: boolean;
  damageNumbers: boolean;
  colorblind: boolean;
  onDragChange: (cell: number | null) => void;
}

interface DragState {
  cell: number;
  dx: number;
  dy: number;
}

export function FieldView({ battle, px, reduceMotion, damageNumbers, colorblind, onDragChange }: Props) {
  const b = battle;
  const [drag, setDrag] = useState<DragState | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const onDragChangeRef = useRef(onDragChange);

  useEffect(() => {
    onDragChangeRef.current = onDragChange;
  }, [onDragChange]);

  const cellPx = FIELD.gridDX * px;
  const unitPx = cellPx * 0.72;

  const gestures = useMemo(() => {
    const setDragBoth = (d: DragState | null) => {
      dragRef.current = d;
      setDrag(d);
      onDragChangeRef.current(d ? d.cell : null);
    };
    const interactive = () => b.phase === 'playing' || b.phase === 'tutorial';
    return Array.from({ length: 16 }, (_, i) => {
      const c = cellCenter(i);
      return Gesture.Pan()
        .runOnJS(true)
        .onUpdate(ev => {
          if (!interactive() || !b.grid[i]) return;
          setDragBoth({ cell: i, dx: ev.translationX, dy: ev.translationY });
        })
        .onEnd(ev => {
          const d = dragRef.current;
          setDragBoth(null);
          if (!d || d.cell !== i || !interactive()) return;
          const fx = c.x + ev.translationX / px;
          const fy = c.y + ev.translationY / px;
          let target = -1;
          let bestDist = 0.11;
          for (let j = 0; j < 16; j++) {
            if (j === i) continue;
            const cc = cellCenter(j);
            const dist = Math.hypot(cc.x - fx, cc.y - fy);
            if (dist < bestDist) {
              bestDist = dist;
              target = j;
            }
          }
          if (target >= 0 && tryMerge(b, i, target)) {
            hapticMedium();
          } else if (target >= 0) {
            hapticError();
          }
        })
        .onFinalize(() => {
          if (dragRef.current) setDragBoth(null);
        });
    });
  }, [b, px]);

  const validTargets = useMemo(
    () => (drag ? validMergeTargets(b, drag.cell) : []),
    [drag, b]
  );

  const boardFull = b.grid.every(u => u !== null);

  const shakeX = !reduceMotion && b.shake > 0 ? (Math.random() - 0.5) * b.shake * 14 : 0;
  const shakeY = !reduceMotion && b.shake > 0 ? (Math.random() - 0.5) * b.shake * 14 : 0;

  return (
    <View
      style={[
        styles.field,
        { width: px, height: px * FIELD.height, transform: [{ translateX: shakeX }, { translateY: shakeY }] },
      ]}>
      <LinearGradient
        colors={['#0a0d1a', '#0b101c', '#0d1220']}
        style={StyleSheet.absoluteFill}
      />
      {[0.25, 0.55, 0.85].map((y, i) => (
        <View
          key={i}
          style={[
            styles.crack,
            {
              top: y * px * FIELD.height,
              left: (0.1 + i * 0.25) * px,
              width: px * 0.35,
              transform: [{ rotate: `${-18 + i * 16}deg` }],
              backgroundColor: i === 1 ? '#8b5cf6' : C.cyan,
              opacity: 0.12,
            },
          ]}
        />
      ))}

      {FIELD.portalXs.map((x, i) => (
        <View
          key={i}
          style={[
            styles.portal,
            {
              left: x * px - cellPx * 0.32,
              top: FIELD.portalY * px - 10,
              width: cellPx * 0.64,
              height: cellPx * 0.4,
            },
          ]}>
          <View style={styles.portalInner} />
        </View>
      ))}

      <View
        style={[
          styles.core,
          {
            left: FIELD.coreX * px - cellPx * 0.42,
            top: FIELD.coreY * px - cellPx * 0.32,
            width: cellPx * 0.84,
            height: cellPx * 0.64,
            borderColor: b.coreShield > 0 ? '#7dd3fc' : C.cyan,
          },
        ]}>
        <View style={[styles.coreOrb, { backgroundColor: b.coreHp / b.coreMax > 0.35 ? C.cyan : C.crimson }]} />
        {b.coreShield > 0 && <Text style={styles.coreShieldText}>{b.coreShield}</Text>}
      </View>

      {b.grid.map((u, i) => {
        const c = cellCenter(i);
        const highlight = drag !== null && validTargets.includes(i);
        return (
          <View
            key={`cell${i}`}
            style={[
              styles.cell,
              {
                left: c.x * px - cellPx * 0.46,
                top: c.y * px - cellPx * 0.46,
                width: cellPx * 0.92,
                height: cellPx * 0.92,
                borderColor: highlight ? C.yellow : boardFull && !u ? C.border : '#1a2438',
                borderWidth: highlight ? 2 : 1,
                backgroundColor: highlight ? '#fde04715' : '#0f172a55',
              },
            ]}
          />
        );
      })}

      {b.enemies.map(e => {
        const def = ENEMIES[e.type];
        const s = def.size * px * 2;
        return (
          <Pressable
            key={e.id}
            onPress={() => setPriorityTarget(b, e.id)}
            hitSlop={10}
            style={{
              position: 'absolute',
              left: e.x * px - s / 2,
              top: e.y * px - s / 2 - 6,
            }}>
            <EnemySprite
              enemy={e}
              px={px}
              frozen={b.time < e.frozenUntil}
              slowed={b.time < e.slowUntil}
              colorblind={colorblind}
            />
          </Pressable>
        );
      })}

      {b.drones.map(d => (
        <View
          key={d.id}
          style={[
            styles.drone,
            {
              left: d.x * px - 7,
              top: d.y * px - 7,
              backgroundColor: d.enhanced ? '#fde047' : '#a3e635',
            },
          ]}
        />
      ))}

      {b.projectiles.map(p => {
        const color =
          p.from === 'arc' ? C.cyan : p.from === 'nova' ? C.orange : p.from === 'cryo' ? C.blue : '#a3e635';
        const size = p.from === 'nova' ? 10 : 6;
        return (
          <View
            key={p.id}
            style={{
              position: 'absolute',
              left: p.x * px - size / 2,
              top: p.y * px - size / 2,
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: p.crit ? C.yellow : color,
            }}
          />
        );
      })}

      {b.fx.map(f => {
        const prog = f.age / f.dur;
        if (f.kind === 'text') {
          if (!damageNumbers && f.color === '#f1f5f9') return null;
          return (
            <Text
              key={f.id}
              style={{
                position: 'absolute',
                left: f.x * px - 30,
                top: (f.y - prog * 0.05) * px,
                width: 60,
                textAlign: 'center',
                color: f.color,
                fontSize: 12,
                fontWeight: '800',
                opacity: 1 - prog,
              }}>
              {f.text}
            </Text>
          );
        }
        if (f.kind === 'ring' || f.kind === 'shock') {
          const size = f.size * cellPx * (0.4 + prog * 0.9);
          return (
            <View
              key={f.id}
              pointerEvents="none"
              style={{
                position: 'absolute',
                left: f.x * px - size / 2,
                top: f.y * px - size / 2,
                width: size,
                height: size,
                borderRadius: size / 2,
                borderWidth: f.kind === 'shock' ? 3 : 2,
                borderColor: f.color,
                opacity: (1 - prog) * 0.9,
              }}
            />
          );
        }
        if (f.kind === 'portal') {
          const size = f.size * cellPx * (1 - prog * 0.4);
          return (
            <View
              key={f.id}
              pointerEvents="none"
              style={{
                position: 'absolute',
                left: f.x * px - size / 2,
                top: f.y * px - size / 2,
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: f.color,
                opacity: (1 - prog) * 0.45,
              }}
            />
          );
        }
        if (f.kind === 'flash') {
          const size = f.size * px;
          return (
            <View
              key={f.id}
              pointerEvents="none"
              style={{
                position: 'absolute',
                left: f.x * px - size / 2,
                top: f.y * px - size / 2,
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: f.color,
                opacity: (1 - prog) * 0.6,
              }}
            />
          );
        }
        if (f.kind === 'telegraph' || f.kind === 'orbital') {
          const size = cellPx * (f.kind === 'orbital' ? 1.6 : 2.2);
          return (
            <View
              key={f.id}
              pointerEvents="none"
              style={{
                position: 'absolute',
                left: f.x * px - size / 2,
                top: f.y * px - size / 2,
                width: size,
                height: size,
                borderRadius: size / 2,
                borderWidth: 3,
                borderStyle: 'dashed',
                borderColor: f.color,
                opacity: 0.35 + 0.5 * Math.abs(Math.sin(prog * 12)),
              }}
            />
          );
        }
        return null;
      })}

      {b.grid.map((u, i) => {
        if (!u) return null;
        const c = cellCenter(i);
        const isDragging = drag?.cell === i;
        const left = c.x * px - unitPx / 2 + (isDragging ? drag.dx : 0);
        const top = c.y * px - unitPx / 2 + (isDragging ? drag.dy : 0);

        return (
          <GestureDetector key={u.id} gesture={gestures[i]}>
            <View
              style={{
                position: 'absolute',
                left,
                top,
                width: unitPx,
                height: unitPx,
                zIndex: isDragging ? 20 : 5,
                opacity: isDragging ? 0.9 : 1,
              }}>
              <GuardianSprite type={u.type} size={unitPx} rank={u.rank} />
              {b.time < u.ultActiveUntil && (
                <View style={[styles.ultRing, { borderColor: GUARDIANS[u.type].glow }]} pointerEvents="none" />
              )}
            </View>
          </GestureDetector>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    overflow: 'hidden',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#16213a',
  },
  crack: {
    position: 'absolute',
    height: 2,
    borderRadius: 1,
  },
  portal: {
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#8b5cf6',
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8b5cf622',
  },
  portalInner: {
    width: '55%',
    height: '45%',
    borderRadius: 999,
    backgroundColor: '#8b5cf6',
    opacity: 0.5,
  },
  core: {
    position: 'absolute',
    borderRadius: 14,
    borderWidth: 2,
    backgroundColor: '#0e749022',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coreOrb: {
    width: '42%',
    height: '55%',
    borderRadius: 999,
    opacity: 0.9,
  },
  coreShieldText: {
    position: 'absolute',
    top: -16,
    color: '#7dd3fc',
    fontSize: 10,
    fontWeight: '800',
  },
  cell: {
    position: 'absolute',
    borderRadius: 10,
  },
  drone: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 4,
    transform: [{ rotate: '45deg' }],
    opacity: 0.9,
  },
  ultRing: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 999,
    borderWidth: 2,
  },
});
