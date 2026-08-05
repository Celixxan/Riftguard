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
        {won ? 'RIFT SEALED' : 'CORE LOST'}
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
        <Row label="Core remaining" value={`${b.result.coreLeft}%`} />
        <Row label="Enemies defeated" value={`${b.kills}`} />
        <Row label="Merges" value={`${b.mergeCount}`} />
        {rewards && won && (
          <>
            <View style={styles.divider} />
            <Row label="Credits earned" value={`+${rewards.credits}`} accent={C.yellow} />
            <Row label="Guardian Data" value={`+${rewards.data}`} accent={C.cyan} />
            {rewards.firstClear && <Text style={styles.firstClear}>FIRST CLEAR BONUS</Text>}
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
        <NeonButton label={won ? 'BATTLE AGAIN' : 'RETRY'} onPress={onRetry} />
        <NeonButton label="RETURN TO HUB" color={C.textDim} onPress={onExit} />
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
    backgroundColor: '#05070df5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    zIndex: 70,
  },
  title: { fontSize: 30, fontWeight: '900', letterSpacing: 6 },
  stars: { flexDirection: 'row', gap: 8, marginTop: 8 },
  star: { fontSize: 34 },
  panel: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: C.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    marginTop: 18,
    gap: 8,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  rowLabel: { color: C.textDim, fontSize: 14 },
  rowValue: { color: C.text, fontSize: 14, fontWeight: '800' },
  divider: { height: 1, backgroundColor: C.border, marginVertical: 4 },
  firstClear: { color: C.orange, fontSize: 11, fontWeight: '900', letterSpacing: 2, textAlign: 'center', marginTop: 4 },
  takenWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12, maxWidth: 340, justifyContent: 'center' },
  taken: { fontSize: 11, fontWeight: '700' },
  buttons: { width: '100%', maxWidth: 340, gap: 10, marginTop: 20 },
});
