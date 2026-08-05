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
            {stabilized ? 'FATE BOUND — the same Warden is guaranteed:' : 'Possible merge outcomes:'}
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
            <Text style={styles.previewRank}>→ Tier {Math.min(5, dragUnit.rank + 1)}</Text>
          </View>
        </View>
      ) : (
        <View style={styles.row}>
          <View style={styles.energyBox}>
            <Text style={styles.energyValue}>{Math.floor(b.energy)}</Text>
            <Text style={styles.energyLabel}>MANA</Text>
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
            <Text style={styles.summonText}>{boardFull ? 'CLEAR A PAD' : 'CALL WARDEN'}</Text>
            <Text style={styles.summonCost}>
              {boardFull ? 'merge matching Wardens' : free ? 'FREE CALL' : `${cost} mana`}
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
            <Text style={[styles.stabText, stabilized && { color: '#2b2117' }]}>BIND FATE</Text>
            <Text style={[styles.stabCharges, stabilized && { color: C.bg }]}>
              {b.stabCharges} token{b.stabCharges === 1 ? '' : 's'}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    minHeight: 86,
    justifyContent: 'center',
    backgroundColor: '#172419',
    borderTopWidth: 2,
    borderTopColor: '#6e6044',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  energyBox: {
    width: 74,
    height: 64,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#887755',
    backgroundColor: '#30402d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  energyValue: { color: '#a9d2d7', fontSize: 20, fontWeight: '900', fontVariant: ['tabular-nums'] },
  energyLabel: { color: C.textDim, fontSize: 8, fontWeight: '900', letterSpacing: 1.5 },
  summonBtn: {
    flex: 1,
    height: 64,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#f0d477',
    backgroundColor: C.yellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summonDisabled: { backgroundColor: '#596044', borderColor: '#73775e' },
  summonText: { color: '#302417', fontSize: 16, fontWeight: '900', letterSpacing: 1.4 },
  summonCost: { color: '#694a27', fontSize: 11, fontWeight: '800' },
  stabBtn: {
    width: 92,
    height: 64,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: C.violet,
    backgroundColor: '#30402d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stabActive: { backgroundColor: C.yellow, borderColor: '#f0d477' },
  stabText: { color: C.violet, fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  stabCharges: { color: C.textDim, fontSize: 9, fontWeight: '700', marginTop: 2 },
  preview: {
    borderRadius: 14,
    borderWidth: 2,
    borderColor: C.yellow,
    backgroundColor: '#3b3826',
    padding: 8,
  },
  previewTitle: { color: C.yellow, fontSize: 11, fontWeight: '800', marginBottom: 4 },
  previewRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  previewItem: { alignItems: 'center' },
  previewPct: { fontSize: 10, fontWeight: '800' },
  previewRank: { color: C.text, fontSize: 13, fontWeight: '800', marginLeft: 'auto' },
});
