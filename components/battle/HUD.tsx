import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BattleState, enhanceRequired, togglePause } from '@/game/sim/battle';
import { BALANCE } from '@/game/data/balance';
import { C } from '@/theme/colors';
import { hapticLight } from '@/utils/haptics';

interface Props {
  battle: BattleState;
  speed: number;
  onSpeedToggle: () => void;
}

function Bar({ value, max, color, label }: { value: number; max: number; color: string; label: string }) {
  const ratio = Math.max(0, Math.min(1, value / max));
  return (
    <View style={styles.barWrap}>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${ratio * 100}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.barLabel}>{label}</Text>
    </View>
  );
}

export function HUD({ battle, speed, onSpeedToggle }: Props) {
  const b = battle;
  const tutorialDelay = b.opts.tutorial ? 20 : 0;
  const remaining = Math.max(0, Math.ceil(BALANCE.battleDuration + tutorialDelay - b.time));
  const mm = Math.floor(remaining / 60);
  const ss = (remaining % 60).toString().padStart(2, '0');

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Pressable
          onPress={() => {
            hapticLight();
            togglePause(b);
          }}
          hitSlop={8}
          style={styles.iconBtn}>
          <Text style={styles.iconText}>{b.phase === 'paused' ? '▶' : '❚❚'}</Text>
        </Pressable>
        <View style={styles.center}>
          <Text style={styles.wave}>WAVE {Math.max(1, b.wave)}/10</Text>
          <Text style={styles.timer}>{mm}:{ss}</Text>
        </View>
        <Pressable
          onPress={() => {
            hapticLight();
            onSpeedToggle();
          }}
          hitSlop={8}
          style={[styles.iconBtn, speed === 2 && styles.iconBtnActive]}>
          <Text style={[styles.iconText, speed === 2 && { color: C.bg }]}>{speed}x</Text>
        </Pressable>
      </View>
      <View style={styles.bars}>
        <Bar value={b.coreHp} max={b.coreMax} color={b.coreHp / b.coreMax > 0.35 ? C.cyan : C.crimson} label={`CORE ${Math.max(0, Math.round(b.coreHp))}`} />
        <Bar value={b.enhance} max={enhanceRequired(b)} color={C.orange} label="ENHANCE" />
        <Bar value={b.stability} max={100} color={C.violet} label={`STABILITY ${b.stabCharges > 0 ? `(${b.stabCharges})` : ''}`} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 12, paddingTop: 4, gap: 6 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconBtn: {
    width: 44,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.borderBright,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.bgPanel,
  },
  iconBtnActive: { backgroundColor: C.cyan, borderColor: C.cyan },
  iconText: { color: C.text, fontSize: 13, fontWeight: '800' },
  center: { alignItems: 'center' },
  wave: { color: C.text, fontSize: 15, fontWeight: '800', letterSpacing: 2 },
  timer: { color: C.textDim, fontSize: 12, fontWeight: '700', fontVariant: ['tabular-nums'] },
  bars: { flexDirection: 'row', gap: 8 },
  barWrap: { flex: 1 },
  barTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1a2438',
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 4 },
  barLabel: { color: C.textFaint, fontSize: 9, fontWeight: '800', letterSpacing: 1, marginTop: 2 },
});
