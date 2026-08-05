import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Settings2, X } from 'lucide-react-native';
import { useMeta } from '@/store/useMeta';
import { STAGES } from '@/game/data/stages';
import { SettingsPanel } from '@/components/SettingsPanel';
import { C } from '@/theme/colors';
import { hapticLight } from '@/utils/haptics';

export default function HubScreen() {
  const insets = useSafeAreaInsets();
  const meta = useMeta();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const nextStage =
    STAGES.find(s => s.id <= meta.unlocked && !(meta.stages[s.id]?.stars > 0)) ??
    STAGES[Math.min(meta.unlocked, 5) - 1];

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>RIFTGUARD</Text>
          <Text style={styles.role}>Rift Warden Command</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.currency}>
            <Text style={styles.currencyValue}>{meta.credits}</Text>
            <Text style={styles.currencyLabel}>CREDITS</Text>
          </View>
          <View style={styles.currency}>
            <Text style={[styles.currencyValue, { color: C.cyan }]}>{meta.data}</Text>
            <Text style={styles.currencyLabel}>DATA</Text>
          </View>
          <Pressable
            onPress={() => {
              hapticLight();
              setSettingsOpen(true);
            }}
            hitSlop={8}
            style={styles.gear}>
            <Settings2 color={C.textDim} size={22} />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Pressable
          onPress={() => {
            hapticLight();
            router.push({ pathname: '/battle', params: { stageId: String(nextStage.id) } });
          }}
          style={styles.nextBattle}>
          <LinearGradient
            colors={['#0e7490', '#0b101c']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.9, y: 1 }}
            style={styles.nextGrad}>
            <Text style={styles.nextKicker}>NEXT BATTLE</Text>
            <Text style={styles.nextName}>
              {nextStage.id}. {nextStage.name}
            </Text>
            <Text style={styles.nextMod}>{nextStage.modifierName}</Text>
            <Text style={styles.nextDesc}>{nextStage.modifierDesc}</Text>
            <View style={styles.deployBtn}>
              <Text style={styles.deployText}>DEPLOY</Text>
            </View>
          </LinearGradient>
        </Pressable>

        <View style={styles.grid}>
          <MenuCard label="CAMPAIGN" sub={`${Object.keys(meta.stages).length}/5 cleared`} onPress={() => router.push('/campaign')} color={C.cyan} />
          <MenuCard label="LOADOUT" sub="4 Guardian slots" onPress={() => router.push('/loadout')} color={C.orange} />
          <MenuCard label="GUARDIANS" sub="Level your squad" onPress={() => router.push('/guardians')} color={C.green} />
          <MenuCard label="CORE" sub="Upgrade defenses" onPress={() => router.push('/core')} color={C.violet} />
        </View>
      </ScrollView>

      <Modal visible={settingsOpen} transparent animationType="fade" onRequestClose={() => setSettingsOpen(false)}>
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>SETTINGS</Text>
              <Pressable onPress={() => setSettingsOpen(false)} hitSlop={10}>
                <X color={C.textDim} size={22} />
              </Pressable>
            </View>
            <SettingsPanel showDevSeed />
          </View>
        </View>
      </Modal>
    </View>
  );
}

function MenuCard({ label, sub, onPress, color }: { label: string; sub: string; onPress: () => void; color: string }) {
  return (
    <Pressable
      onPress={() => {
        hapticLight();
        onPress();
      }}
      style={({ pressed }) => [styles.card, { borderColor: color + '55' }, pressed && { opacity: 0.8 }]}>
      <Text style={[styles.cardLabel, { color }]}>{label}</Text>
      <Text style={styles.cardSub}>{sub}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  title: { color: C.text, fontSize: 20, fontWeight: '900', letterSpacing: 3 },
  role: { color: C.textFaint, fontSize: 11, fontWeight: '600' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  currency: { alignItems: 'flex-end' },
  currencyValue: { color: C.yellow, fontSize: 16, fontWeight: '800', fontVariant: ['tabular-nums'] },
  currencyLabel: { color: C.textFaint, fontSize: 8, fontWeight: '800', letterSpacing: 1 },
  gear: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { padding: 16, gap: 16 },
  nextBattle: { borderRadius: 18, overflow: 'hidden', borderWidth: 1.5, borderColor: C.cyanDim },
  nextGrad: { padding: 20 },
  nextKicker: { color: C.cyan, fontSize: 11, fontWeight: '900', letterSpacing: 3 },
  nextName: { color: C.text, fontSize: 24, fontWeight: '900', marginTop: 6 },
  nextMod: { color: C.orange, fontSize: 13, fontWeight: '800', marginTop: 4 },
  nextDesc: { color: C.textDim, fontSize: 13, marginTop: 4, lineHeight: 19 },
  deployBtn: {
    marginTop: 16,
    backgroundColor: C.cyan,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  deployText: { color: '#03131a', fontSize: 16, fontWeight: '900', letterSpacing: 3 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    width: '47%',
    flexGrow: 1,
    backgroundColor: C.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  cardLabel: { fontSize: 15, fontWeight: '900', letterSpacing: 2 },
  cardSub: { color: C.textFaint, fontSize: 11, marginTop: 4 },
  modalBg: { flex: 1, backgroundColor: '#000000aa', alignItems: 'center', justifyContent: 'center', padding: 20 },
  modalCard: { width: '100%', maxWidth: 380, backgroundColor: C.bgPanel, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalTitle: { color: C.text, fontSize: 16, fontWeight: '900', letterSpacing: 3 },
});
