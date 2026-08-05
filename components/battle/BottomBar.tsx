import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BattleState, emptyCells, summonCost, trySummon } from '@/game/sim/battle';
import { GUARDIANS } from '@/game/data/guardians';
import { GuardianSprite } from '@/components/ui/GuardianSprite';
import { C } from '@/theme/colors';
import { hapticMedium, hapticError } from '@/utils/haptics';

interface Props {
  battle: BattleState;
  dragCell: number | null;
}

export function BottomBar({ battle, dragCell }: Props) {
  const b = battle;
  const cost = summonCost(b);
  const boardFull = emptyCells(b).length === 0;
  const free = b.freeSummons > 0;
  const canSummon = !boardFull && (free || b.energy >= cost);
  const interactive = b.phase === 'playing' || b.phase === 'tutorial';
  const stabilized = b.stabOn && b.stabCharges > 0;

  const dragUnit = dragCell !== null ? b.grid[dragCell] : null;

  return (
    <View style={styles.wrap}>
      {dragUnit ? (
        <View style={styles.preview}>
          <Text style={styles.previewTitle}>
            {stabilized ? 'STABILIZED — result is guaranteed:' : 'Merge result chances:'}
          </Text>
          <View style={styles.previewRow}>
            {b.opts.loadout.map(t => {
              const pct = stabilized ? (t === dragUnit.type ? 100 : 0) : 25;
              if (stabilized && t !== dragUnit.type) return null;
              return (
                <View key={t} style={styles.previewItem}>
                  <GuardianSprite type={t} size={30} rank={0} />
                  <Text style={[styles.previewPct, { color: GUARDIANS[t].color }]}>{pct}%</Text>
                </View>
              );
            })}
            <Text style={styles.previewRank}>→ Rank {Math.min(5, dragUnit.rank + 1)}</Text>
          </View>
        </View>
      ) : (
        <View style={styles.row}>
          <View style={styles.energyBox}>
            <Text style={styles.energyValue}>{Math.floor(b.energy)}</Text>
            <Text style={styles.energyLabel}>ENERGY</Text>
          </View>

          <Pressable
            disabled={!interactive}
            onPress={() => {
              if (trySummon(b)) hapticMedium();
              else hapticError();
            }}
            style={({ pressed }) => [
              styles.summonBtn,
              !canSummon && styles.summonDisabled,
              pressed && canSummon && { opacity: 0.85 },
            ]}>
            <Text style={styles.summonText}>{boardFull ? 'BOARD FULL' : 'SUMMON'}</Text>
            <Text style={styles.summonCost}>
              {boardFull ? 'merge to make room' : free ? 'FREE' : `${cost} energy`}
            </Text>
          </Pressable>

          <Pressable
            disabled={!interactive || b.stabCharges === 0}
            onPress={() => {
              hapticMedium();
              b.stabOn = !b.stabOn;
            }}
            style={[
              styles.stabBtn,
              b.stabCharges === 0 && { opacity: 0.4 },
              stabilized && styles.stabActive,
            ]}>
            <Text style={[styles.stabText, stabilized && { color: C.bg }]}>STABILIZE</Text>
            <Text style={[styles.stabCharges, stabilized && { color: C.bg }]}>
              {b.stabCharges} charge{b.stabCharges === 1 ? '' : 's'}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 12, paddingVertical: 8, minHeight: 84, justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  energyBox: {
    width: 74,
    height: 64,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.borderBright,
    backgroundColor: C.bgPanel,
    alignItems: 'center',
    justifyContent: 'center',
  },
  energyValue: { color: C.energy, fontSize: 20, fontWeight: '800', fontVariant: ['tabular-nums'] },
  energyLabel: { color: C.textFaint, fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  summonBtn: {
    flex: 1,
    height: 64,
    borderRadius: 14,
    backgroundColor: C.cyan,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summonDisabled: { backgroundColor: '#164e63' },
  summonText: { color: '#03131a', fontSize: 18, fontWeight: '900', letterSpacing: 2 },
  summonCost: { color: '#075985', fontSize: 12, fontWeight: '700' },
  stabBtn: {
    width: 92,
    height: 64,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: C.violet,
    backgroundColor: C.bgPanel,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stabActive: { backgroundColor: C.violet },
  stabText: { color: C.violet, fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  stabCharges: { color: C.textDim, fontSize: 10, fontWeight: '700', marginTop: 2 },
  preview: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.yellow,
    backgroundColor: '#fde04710',
    padding: 8,
  },
  previewTitle: { color: C.yellow, fontSize: 11, fontWeight: '800', marginBottom: 4 },
  previewRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  previewItem: { alignItems: 'center' },
  previewPct: { fontSize: 10, fontWeight: '800' },
  previewRank: { color: C.text, fontSize: 13, fontWeight: '800', marginLeft: 'auto' },
});
