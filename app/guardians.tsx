import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useMeta } from '@/store/useMeta';
import { GUARDIAN_IDS, GUARDIANS } from '@/game/data/guardians';
import { BALANCE } from '@/game/data/balance';
import { GuardianSprite } from '@/components/ui/GuardianSprite';
import { C } from '@/theme/colors';
import { hapticSuccess, hapticError } from '@/utils/haptics';

export default function GuardiansScreen() {
  const insets = useSafeAreaInsets();
  const meta = useMeta();

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.back}>
          <ArrowLeft color={C.text} size={22} />
        </Pressable>
        <Text style={styles.title}>WARDENS</Text>
        <Text style={styles.credits}>{meta.credits} GOLD</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.hint}>
          Spend gold to train Wardens up to level 10. Each level grants +4% damage on the trail.
        </Text>
        {GUARDIAN_IDS.map(id => {
          const def = GUARDIANS[id];
          const level = meta.levels[id];
          const maxed = level >= 10;
          const cost = maxed ? 0 : BALANCE.guardianLevelCosts[level];
          const affordable = meta.credits >= cost;
          return (
            <View key={id} style={[styles.card, { borderColor: def.color + '44' }]}>
              <View style={styles.cardTop}>
                <GuardianSprite type={id} size={54} rank={0} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.name, { color: def.color }]}>{def.name}</Text>
                  <Text style={styles.role}>{def.role}</Text>
                  <View style={styles.levelTrack}>
                    <View style={[styles.levelFill, { width: `${level * 10}%`, backgroundColor: def.color }]} />
                  </View>
                  <Text style={styles.level}>Level {level} / 10</Text>
                </View>
                <Pressable
                  disabled={maxed || !affordable}
                  onPress={() => {
                    if (meta.levelUpGuardian(id)) hapticSuccess();
                    else hapticError();
                  }}
                  style={[styles.levelBtn, (maxed || !affordable) && { opacity: 0.4 }]}>
                  <Text style={styles.levelBtnText}>{maxed ? 'MAX' : 'LEVEL UP'}</Text>
                  {!maxed && <Text style={styles.levelBtnCost}>{cost} GOLD</Text>}
                </Pressable>
              </View>
              <View style={styles.stats}>
                <Stat label="DMG" value={def.baseDamage.toString()} />
                <Stat label="RATE" value={`${(1 / def.attackInterval).toFixed(1)}/s`} />
                <Stat label="RANGE" value={def.range.toFixed(2)} />
                <Stat label="ULT" value={`${def.ultInterval}s`} />
              </View>
              <Text style={styles.passive}>{def.passive}</Text>
              <Text style={styles.tags}>{def.tags.map(t => `#${t}`).join('  ')}</Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { color: C.text, fontSize: 18, fontWeight: '900', letterSpacing: 4 },
  credits: { color: C.yellow, fontSize: 13, fontWeight: '800', width: 70, textAlign: 'right' },
  scroll: { padding: 16, gap: 14 },
  hint: { color: C.textDim, fontSize: 13, lineHeight: 19 },
  card: {
    backgroundColor: C.bgCard,
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 14,
    gap: 10,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  name: { fontSize: 16, fontWeight: '900' },
  role: { color: C.textFaint, fontSize: 11, fontWeight: '700' },
  levelTrack: { height: 5, backgroundColor: '#1a2438', borderRadius: 3, marginTop: 6, overflow: 'hidden' },
  levelFill: { height: '100%', borderRadius: 3 },
  level: { color: C.textDim, fontSize: 11, fontWeight: '700', marginTop: 3 },
  levelBtn: {
    backgroundColor: C.yellow,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    minWidth: 84,
  },
  levelBtnText: { color: '#302417', fontSize: 12, fontWeight: '900' },
  levelBtnCost: { color: '#684b28', fontSize: 9, fontWeight: '800' },
  stats: { flexDirection: 'row', gap: 8 },
  stat: {
    flex: 1,
    backgroundColor: C.bgPanel,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  statValue: { color: C.text, fontSize: 13, fontWeight: '800' },
  statLabel: { color: C.textFaint, fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  passive: { color: C.textDim, fontSize: 12, lineHeight: 18 },
  tags: { color: C.textFaint, fontSize: 10, fontWeight: '700' },
});
