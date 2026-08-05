import { useEffect, useMemo, useRef, useState } from 'react';
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { Polyline } from 'react-native-svg';
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

const FIELD_ART = require('../../assets/images/battlefield-forest-v1.png');
const PATH_POINTS = FIELD.pathPoints.map(point => `${point.x * 1000},${point.y * 1000}`).join(' ');

const PATH_DETAILS = [
  { x: 0.38, y: 0.2, size: 5 },
  { x: 0.3, y: 0.37, size: 4 },
  { x: 0.63, y: 0.49, size: 5 },
  { x: 0.72, y: 0.68, size: 4 },
  { x: 0.41, y: 0.84, size: 5 },
  { x: 0.27, y: 1.04, size: 4 },
  { x: 0.58, y: 1.2, size: 5 },
];

export function FieldView({ battle, px, reduceMotion, damageNumbers, colorblind, onDragChange }: Props) {
  const b = battle;
  const [drag, setDrag] = useState<DragState | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const onDragChangeRef = useRef(onDragChange);

  useEffect(() => {
    onDragChangeRef.current = onDragChange;
  }, [onDragChange]);

  const cellPx = FIELD.gridDX * px;
  const unitPx = cellPx * 0.8;

  const gestures = useMemo(() => {
    const setDragBoth = (next: DragState | null) => {
      dragRef.current = next;
      setDrag(next);
      onDragChangeRef.current(next ? next.cell : null);
    };
    const interactive = () => b.phase === 'playing' || b.phase === 'tutorial';
    return Array.from({ length: 16 }, (_, i) => {
      const center = cellCenter(i);
      return Gesture.Pan()
        .runOnJS(true)
        .onUpdate(event => {
          if (!interactive() || !b.grid[i]) return;
          setDragBoth({ cell: i, dx: event.translationX, dy: event.translationY });
        })
        .onEnd(event => {
          const current = dragRef.current;
          setDragBoth(null);
          if (!current || current.cell !== i || !interactive()) return;
          const finalX = center.x + event.translationX / px;
          const finalY = center.y + event.translationY / px;
          let target = -1;
          let bestDistance = 0.12;
          for (let j = 0; j < 16; j++) {
            if (j === i) continue;
            const candidate = cellCenter(j);
            const distance = Math.hypot(candidate.x - finalX, candidate.y - finalY);
            if (distance < bestDistance) {
              bestDistance = distance;
              target = j;
            }
          }
          if (target >= 0 && tryMerge(b, i, target)) hapticMedium();
          else if (target >= 0) hapticError();
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

  const boardFull = b.grid.every(unit => unit !== null);
  const shakeX = !reduceMotion && b.shake > 0 ? (Math.random() - 0.5) * b.shake * 12 : 0;
  const shakeY = !reduceMotion && b.shake > 0 ? (Math.random() - 0.5) * b.shake * 12 : 0;

  return (
    <View
      style={[
        styles.field,
        {
          width: px,
          height: px * FIELD.height,
          transform: [{ translateX: shakeX }, { translateY: shakeY }],
        },
      ]}>
      <ImageBackground source={FIELD_ART} resizeMode="cover" style={StyleSheet.absoluteFill} />
      <View style={styles.environmentWash} pointerEvents="none" />

      <Svg
        width={px}
        height={px * FIELD.height}
        viewBox="0 0 1000 1500"
        style={StyleSheet.absoluteFill}
        pointerEvents="none">
        <Polyline
          points={PATH_POINTS}
          fill="none"
          stroke="#443426"
          strokeWidth={142}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.82}
        />
        <Polyline
          points={PATH_POINTS}
          fill="none"
          stroke={C.road}
          strokeWidth={116}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.96}
        />
        <Polyline
          points={PATH_POINTS}
          fill="none"
          stroke={C.roadLight}
          strokeWidth={78}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.52}
        />
        <Polyline
          points={PATH_POINTS}
          fill="none"
          stroke="#ead3a1"
          strokeWidth={5}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="10 26"
          opacity={0.32}
        />
      </Svg>

      {PATH_DETAILS.map((detail, index) => (
        <View
          key={`detail-${index}`}
          pointerEvents="none"
          style={[
            styles.pathStone,
            {
              left: detail.x * px - detail.size / 2,
              top: detail.y * px - detail.size / 2,
              width: detail.size,
              height: detail.size * 0.7,
            },
          ]}
        />
      ))}

      <View
        pointerEvents="none"
        style={[
          styles.gate,
          {
            left: FIELD.pathPoints[0].x * px - cellPx * 0.52,
            top: 0,
            width: cellPx * 1.04,
            height: cellPx * 0.58,
          },
        ]}>
        <View style={styles.gateOpening} />
        <View style={[styles.gatePillar, styles.gatePillarLeft]} />
        <View style={[styles.gatePillar, styles.gatePillarRight]} />
        <View style={styles.gateLintel} />
      </View>

      <View
        pointerEvents="none"
        style={[
          styles.heartstone,
          {
            left: FIELD.coreX * px - cellPx * 0.58,
            top: FIELD.coreY * px - cellPx * 0.46,
            width: cellPx * 1.16,
            height: cellPx * 0.78,
            borderColor: b.coreShield > 0 ? '#a8d7d8' : C.parchmentDark,
          },
        ]}>
        <View style={styles.shrineRoof} />
        <View style={styles.shrineBody}>
          <View
            style={[
              styles.heartGem,
              { backgroundColor: b.coreHp / b.coreMax > 0.35 ? '#83b66d' : C.crimson },
            ]}
          />
        </View>
        {b.coreShield > 0 ? <Text style={styles.coreShieldText}>WARD {b.coreShield}</Text> : null}
      </View>

      {b.grid.map((unit, i) => {
        const center = cellCenter(i);
        const highlight = drag !== null && validTargets.includes(i);
        return (
          <View
            key={`cell-${i}`}
            pointerEvents="none"
            style={[
              styles.buildPad,
              {
                left: center.x * px - cellPx * 0.48,
                top: center.y * px - cellPx * 0.48,
                width: cellPx * 0.96,
                height: cellPx * 0.96,
                borderColor: highlight ? C.yellow : unit ? '#a79667' : '#81775c',
                borderWidth: highlight ? 3 : 2,
                backgroundColor: highlight ? '#e6c15a55' : unit ? '#394a31cc' : '#586044aa',
                opacity: boardFull || unit || highlight ? 1 : 0.88,
              },
            ]}>
            <View style={[styles.padRune, highlight && { borderColor: C.yellow }]} />
          </View>
        );
      })}

      {b.enemies.map(enemy => {
        const definition = ENEMIES[enemy.type];
        const size = definition.size * px * 2;
        return (
          <Pressable
            key={enemy.id}
            onPress={() => setPriorityTarget(b, enemy.id)}
            hitSlop={10}
            style={{
              position: 'absolute',
              left: enemy.x * px - size / 2,
              top: enemy.y * px - size / 2 - 6,
              zIndex: 10,
            }}>
            <EnemySprite
              enemy={enemy}
              px={px}
              frozen={b.time < enemy.frozenUntil}
              slowed={b.time < enemy.slowUntil}
              colorblind={colorblind}
            />
          </Pressable>
        );
      })}

      {b.drones.map(drone => (
        <View
          key={drone.id}
          style={[
            styles.wisp,
            {
              left: drone.x * px - 7,
              top: drone.y * px - 7,
              backgroundColor: drone.enhanced ? '#f0d57a' : '#a8c86d',
              shadowColor: drone.enhanced ? '#f0d57a' : '#a8c86d',
            },
          ]}
        />
      ))}

      {b.projectiles.map(projectile => {
        const color =
          projectile.from === 'arc'
            ? '#b4d477'
            : projectile.from === 'nova'
              ? '#e28a43'
              : projectile.from === 'cryo'
                ? '#b9e2e6'
                : '#a8c86d';
        const size = projectile.from === 'nova' ? 10 : 6;
        return (
          <View
            key={projectile.id}
            style={[
              styles.projectile,
              {
                left: projectile.x * px - size / 2,
                top: projectile.y * px - size / 2,
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: projectile.crit ? C.yellow : color,
                shadowColor: projectile.crit ? C.yellow : color,
              },
            ]}
          />
        );
      })}

      {b.fx.map(effect => {
        const progress = effect.age / effect.dur;
        if (effect.kind === 'text') {
          if (!damageNumbers && effect.color === '#f1f5f9') return null;
          return (
            <Text
              key={effect.id}
              style={{
                position: 'absolute',
                left: effect.x * px - 30,
                top: (effect.y - progress * 0.05) * px,
                width: 60,
                textAlign: 'center',
                color: effect.color,
                fontSize: 12,
                fontWeight: '900',
                opacity: 1 - progress,
                textShadowColor: '#291b12',
                textShadowRadius: 2,
              }}>
              {effect.text}
            </Text>
          );
        }
        if (effect.kind === 'ring' || effect.kind === 'shock') {
          const size = effect.size * cellPx * (0.4 + progress * 0.9);
          return (
            <View
              key={effect.id}
              pointerEvents="none"
              style={{
                position: 'absolute',
                left: effect.x * px - size / 2,
                top: effect.y * px - size / 2,
                width: size,
                height: size,
                borderRadius: size / 2,
                borderWidth: effect.kind === 'shock' ? 3 : 2,
                borderColor: effect.color,
                opacity: (1 - progress) * 0.9,
              }}
            />
          );
        }
        if (effect.kind === 'portal') {
          const size = effect.size * cellPx * (1 - progress * 0.4);
          return (
            <View
              key={effect.id}
              pointerEvents="none"
              style={{
                position: 'absolute',
                left: effect.x * px - size / 2,
                top: effect.y * px - size / 2,
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: effect.color,
                opacity: (1 - progress) * 0.38,
              }}
            />
          );
        }
        if (effect.kind === 'flash') {
          const size = effect.size * px;
          return (
            <View
              key={effect.id}
              pointerEvents="none"
              style={{
                position: 'absolute',
                left: effect.x * px - size / 2,
                top: effect.y * px - size / 2,
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: effect.color,
                opacity: (1 - progress) * 0.55,
              }}
            />
          );
        }
        if (effect.kind === 'telegraph' || effect.kind === 'orbital') {
          const size = cellPx * (effect.kind === 'orbital' ? 1.6 : 2.2);
          return (
            <View
              key={effect.id}
              pointerEvents="none"
              style={{
                position: 'absolute',
                left: effect.x * px - size / 2,
                top: effect.y * px - size / 2,
                width: size,
                height: size,
                borderRadius: size / 2,
                borderWidth: 3,
                borderStyle: 'dashed',
                borderColor: effect.color,
                opacity: 0.35 + 0.5 * Math.abs(Math.sin(progress * 12)),
              }}
            />
          );
        }
        return null;
      })}

      {b.grid.map((unit, i) => {
        if (!unit) return null;
        const center = cellCenter(i);
        const isDragging = drag?.cell === i;
        const left = center.x * px - unitPx / 2 + (isDragging ? drag.dx : 0);
        const top = center.y * px - unitPx / 2 + (isDragging ? drag.dy : 0);

        return (
          <GestureDetector key={unit.id} gesture={gestures[i]}>
            <View
              style={{
                position: 'absolute',
                left,
                top,
                width: unitPx,
                height: unitPx,
                zIndex: isDragging ? 30 : 20,
                opacity: isDragging ? 0.9 : 1,
              }}>
              <GuardianSprite type={unit.type} size={unitPx} rank={unit.rank} />
              {b.time < unit.ultActiveUntil ? (
                <View style={[styles.ultRing, { borderColor: GUARDIANS[unit.type].glow }]} pointerEvents="none" />
              ) : null}
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
    borderRadius: 22,
    borderWidth: 3,
    borderColor: '#7c6b49',
    backgroundColor: '#4f713a',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  environmentWash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#20351c14',
  },
  pathStone: {
    position: 'absolute',
    borderRadius: 3,
    backgroundColor: '#6e553c',
    opacity: 0.55,
    transform: [{ rotate: '-12deg' }],
  },
  gate: {
    position: 'absolute',
    alignItems: 'center',
  },
  gateOpening: {
    position: 'absolute',
    bottom: 0,
    width: '48%',
    height: '58%',
    borderTopLeftRadius: 99,
    borderTopRightRadius: 99,
    backgroundColor: '#241d2b',
    borderWidth: 2,
    borderColor: '#9a7cab',
  },
  gatePillar: {
    position: 'absolute',
    bottom: 0,
    width: '22%',
    height: '66%',
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#5d594d',
    backgroundColor: '#928b72',
  },
  gatePillarLeft: { left: '10%' },
  gatePillarRight: { right: '10%' },
  gateLintel: {
    position: 'absolute',
    top: '12%',
    width: '82%',
    height: '24%',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#5d594d',
    backgroundColor: '#a19a7e',
  },
  heartstone: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderRadius: 12,
    borderWidth: 2,
  },
  shrineRoof: {
    width: '74%',
    height: '30%',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    backgroundColor: '#65452d',
    borderWidth: 2,
    borderColor: '#3b291e',
  },
  shrineBody: {
    width: '58%',
    height: '56%',
    backgroundColor: '#9b8c6b',
    borderWidth: 2,
    borderColor: '#5f5846',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartGem: {
    width: '42%',
    aspectRatio: 1,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#e8d8a8',
    shadowColor: '#e8d8a8',
    shadowOpacity: 0.85,
    shadowRadius: 9,
  },
  coreShieldText: {
    position: 'absolute',
    top: -15,
    color: '#d9f2e8',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  buildPad: {
    position: 'absolute',
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1d160e',
    shadowOpacity: 0.35,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  padRune: {
    width: '62%',
    height: '62%',
    borderRadius: 999,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#c3b48799',
  },
  wisp: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    opacity: 0.95,
    shadowOpacity: 1,
    shadowRadius: 7,
  },
  projectile: {
    position: 'absolute',
    shadowOpacity: 1,
    shadowRadius: 5,
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
