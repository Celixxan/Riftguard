import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BattleState } from '@/game/sim/battle';

export function DevOverlay({ battle }: { battle: BattleState }) {
  const frames = useRef(0);
  const [fps, setFps] = useState(0);
  frames.current++;

  useEffect(() => {
    const id = setInterval(() => {
      setFps(frames.current);
      frames.current = 0;
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const ms = fps > 0 ? (1000 / fps).toFixed(1) : '-';
  const units = battle.grid.filter(Boolean).length;

  return (
    <View pointerEvents="none" style={styles.box}>
      <Text style={styles.line}>ui {fps}/s ({ms}ms)  seed {battle.opts.seed}</Text>
      <Text style={styles.line}>
        phase {battle.phase}  t {battle.time.toFixed(1)}s  wave {battle.wave}
      </Text>
      <Text style={styles.line}>
        enemies {battle.enemies.length}  proj {battle.projectiles.length}  units {units}  drones{' '}
        {battle.drones.length}  fx {battle.fx.length}
      </Text>
      <Text style={styles.line}>
        upgrades [{battle.taken.map(t => t.name).join(', ') || 'none'}]
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    position: 'absolute',
    top: 80,
    left: 8,
    backgroundColor: 'rgba(2,6,16,0.75)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
    maxWidth: 280,
  },
  line: { color: '#7dd3fc', fontSize: 10, fontFamily: 'monospace' as never, lineHeight: 14 },
});
