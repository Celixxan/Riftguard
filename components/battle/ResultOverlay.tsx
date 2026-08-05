import { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BattleState } from '@/game/sim/battle';
import { NeonButton } from '@/components/ui/NeonButton';
import { RARITY_COLOR } from '@/game/data/upgrades';
import { C } from '@/theme/colors';
import { hapticSuccess, hapticError } from '@/utils/haptics';

interface Props {
  battle: BattleState;
  rewards: { credits: number; data: number; firstClear: boolean } | null;
  onRetry: () => void;
  onExit: () => void;
}

export function ResultOverlay({ battle, rewards, onRetry, onExit }: Props) {
  const b = battle;
  const done = b.phase === 'victory' || b.phase === 'defeat';
  const fired = useRef(false);

  useEffect(() => {
    if (done && !fired.current) {
      fired.current = true;
      if (b.phase === 'victory') hapticSuccess();
      else hapticError();
    }
  }, [done, b.phase]);

  if (!done || !b.result) return null;
  const won = b.result.won;

  return (
    <View style={styles.overlay}>
      <Text style={[styles.title, { color: won ? C.cyan : C.crimson }]}>
        {won ? 'TRAIL SECURED' : 'HEARTSTONE FALLEN'}
      </Text>
      {won && (
        <View style={styles.stars}>
          {[1, 2, 3].map(i => (
            <Text key={i} style={[styles.star, { color: i <= b.result!.stars ? C.yellow : '#334155' }]}>
              ★
            </Text>
          ))}
        </View>
      )}
      <View style={styles.panel}>
        <Row label="Time" value={`${b.result.timeUsed}s`} />
        <Row label="Heartstone remaining" value={`${b.result.coreLeft}%`} />
        <Row label="Creatures defeated" value={`${b.kills}`} />
        <Row label="Merges" value={`${b.mergeCount}`} />
        {rewards && won && (
          <>
            <View style={styles.divider} />
            <Row label="Gold earned" value={`+${rewards.credits}`} accent={C.yellow} />
            <Row label="Warden essence" value={`+${rewards.data}`} accent={C.cyan} />
            {rewards.firstClear && <Text style={styles.firstClear}>FIRST JOURNEY REWARD</Text>}
          </>
        )}
      </View>
      {b.taken.length > 0 && (
        <View style={styles.takenWrap}>
          {b.taken.map((t, i) => (
            <Text key={i} style={[styles.taken, { color: RARITY_COLOR[t.rarity] }]}>
              {t.name}
            </Text>
          ))}
        </View>
      )}
      <View style={styles.buttons}>
        <NeonButton label={won ? 'WALK THE TRAIL AGAIN' : 'TRY THE TRAIL AGAIN'} onPress={onRetry} />
        <NeonButton label="RETURN TO THE LODGE" color={C.parchmentDark} onPress={onExit} />
      </View>
    </View>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, accent ? { color: accent } : null]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0b140df5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    zIndex: 70,
  },
  title: { fontSize: 27, fontWeight: '900', letterSpacing: 3.5, textAlign: 'center' },
  stars: { flexDirection: 'row', gap: 8, marginTop: 8 },
  star: { fontSize: 34 },
  panel: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: C.parchment,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#8b6a3f',
    padding: 16,
    marginTop: 18,
    gap: 8,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  rowLabel: { color: '#6a573d', fontSize: 14 },
  rowValue: { color: '#302417', fontSize: 14, fontWeight: '900' },
  divider: { height: 1, backgroundColor: '#bba77c', marginVertical: 4 },
  firstClear: { color: '#995523', fontSize: 11, fontWeight: '900', letterSpacing: 2, textAlign: 'center', marginTop: 4 },
  takenWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12, maxWidth: 340, justifyContent: 'center' },
  taken: { fontSize: 11, fontWeight: '700' },
  buttons: { width: '100%', maxWidth: 340, gap: 10, marginTop: 20 },
});
