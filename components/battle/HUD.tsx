import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FastForward, Pause, Play } from 'lucide-react-native';
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
    <LinearGradient colors={['#243522', '#172419']} style={styles.wrap}>
      <View style={styles.row}>
        <Pressable
          onPress={() => {
            hapticLight();
            togglePause(b);
          }}
          hitSlop={8}
          style={styles.iconBtn}>
          {b.phase === 'paused' ? <Play color={C.text} size={16} fill={C.text} /> : <Pause color={C.text} size={17} fill={C.text} />}
        </Pressable>
        <View style={styles.center}>
          <Text style={styles.stage}>{b.stage.name.toUpperCase()}</Text>
          <Text style={styles.wave}>WAVE {Math.max(1, b.wave)} OF 10</Text>
          <Text style={styles.timer}>{mm}:{ss}</Text>
        </View>
        <Pressable
          onPress={() => {
            hapticLight();
            onSpeedToggle();
          }}
          hitSlop={8}
          style={[styles.iconBtn, speed === 2 && styles.iconBtnActive]}>
          <FastForward color={speed === 2 ? '#2b2117' : C.text} size={16} fill={speed === 2 ? '#2b2117' : C.text} />
          <Text style={[styles.speedText, speed === 2 && { color: '#2b2117' }]}>{speed}x</Text>
        </Pressable>
      </View>
      <View style={styles.bars}>
        <Bar value={b.coreHp} max={b.coreMax} color={b.coreHp / b.coreMax > 0.35 ? C.health : C.crimson} label={`HEARTSTONE ${Math.max(0, Math.round(b.coreHp))}`} />
        <Bar value={b.enhance} max={enhanceRequired(b)} color={C.orange} label="BLESSING" />
        <Bar value={b.stability} max={100} color={C.violet} label={`FATE ${b.stabCharges > 0 ? `· ${b.stabCharges}` : ''}`} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 8,
    gap: 7,
    borderBottomWidth: 2,
    borderBottomColor: '#6e6044',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    zIndex: 5,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconBtn: {
    width: 44,
    height: 36,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#897b59',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#364634',
    flexDirection: 'row',
    gap: 2,
  },
  iconBtnActive: { backgroundColor: C.yellow, borderColor: '#f0d477' },
  speedText: { color: C.text, fontSize: 9, fontWeight: '900' },
  center: { alignItems: 'center' },
  stage: { color: C.parchmentDark, fontSize: 8, fontWeight: '900', letterSpacing: 2 },
  wave: { color: C.text, fontSize: 13, fontWeight: '900', letterSpacing: 1.5, marginTop: 1 },
  timer: { color: C.yellow, fontSize: 11, fontWeight: '800', fontVariant: ['tabular-nums'] },
  bars: { flexDirection: 'row', gap: 8 },
  barWrap: { flex: 1 },
  barTrack: {
    height: 7,
    borderRadius: 4,
    backgroundColor: '#0f1710',
    borderWidth: 1,
    borderColor: '#3d4735',
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 4 },
  barLabel: { color: C.textDim, fontSize: 8, fontWeight: '900', letterSpacing: 0.8, marginTop: 2 },
});
