import { ReactNode, useState } from 'react';
import { ImageBackground, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Backpack, Gem, Map, Settings2, Shield, Users, X } from 'lucide-react-native';
import { useMeta } from '@/store/useMeta';
import { STAGES } from '@/game/data/stages';
import { SettingsPanel } from '@/components/SettingsPanel';
import { C } from '@/theme/colors';
import { hapticLight } from '@/utils/haptics';

const forest = require('../assets/images/battlefield-forest-v1.png');

export default function HubScreen() {
  const insets = useSafeAreaInsets();
  const meta = useMeta();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const nextStage =
    STAGES.find(s => s.id <= meta.unlocked && !(meta.stages[s.id]?.stars > 0)) ??
    STAGES[Math.min(meta.unlocked, 5) - 1];

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8, paddingBottom: insets.bottom }]}>
      <ImageBackground source={forest} resizeMode="cover" style={styles.background} imageStyle={styles.backgroundImage} />
      <LinearGradient colors={['#101b13d9', '#101b13f5', C.bg]} locations={[0, 0.42, 1]} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>WARDEN&apos;S LODGE</Text>
          <Text style={styles.title}>RIFTGUARD</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.currency}>
            <Text style={styles.currencyValue}>{meta.credits}</Text>
            <Text style={styles.currencyLabel}>GOLD</Text>
          </View>
          <View style={styles.currency}>
            <Text style={[styles.currencyValue, { color: C.cyan }]}>{meta.data}</Text>
            <Text style={styles.currencyLabel}>ESSENCE</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open settings"
            onPress={() => {
              hapticLight();
              setSettingsOpen(true);
            }}
            hitSlop={8}
            style={styles.gear}>
            <Settings2 color={C.parchment} size={21} />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Begin ${nextStage.name}`}
          onPress={() => {
            hapticLight();
            router.push({ pathname: '/battle', params: { stageId: String(nextStage.id) } });
          }}
          style={({ pressed }) => [styles.nextBattle, pressed && { transform: [{ scale: 0.985 }] }]}>
          <LinearGradient
            colors={['#4d673eeb', '#263a27f5', '#1c291dee']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.nextGrad}>
            <View style={styles.nextHeader}>
              <View style={styles.questSeal}>
                <Map color="#3f321d" size={22} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.nextKicker}>NEXT STEP ON THE TRAIL</Text>
                <Text style={styles.nextName}>{nextStage.name}</Text>
              </View>
              <Text style={styles.stageNo}>I{nextStage.id}</Text>
            </View>
            <Text style={styles.nextMod}>{nextStage.modifierName}</Text>
            <Text style={styles.nextDesc}>{nextStage.modifierDesc}</Text>
            <View style={styles.deployBtn}>
              <Text style={styles.deployText}>FOLLOW THE TRAIL</Text>
            </View>
          </LinearGradient>
        </Pressable>

        <Text style={styles.sectionTitle}>THE LODGE</Text>
        <View style={styles.grid}>
          <MenuCard icon={<Map size={21} color={C.cyan} />} label="JOURNEY" sub={`${Object.keys(meta.stages).length}/5 paths cleared`} onPress={() => router.push('/campaign')} color={C.cyan} />
          <MenuCard icon={<Backpack size={21} color={C.orange} />} label="WAR BAND" sub="Arrange your Wardens" onPress={() => router.push('/loadout')} color={C.orange} />
          <MenuCard icon={<Users size={21} color={C.green} />} label="WARDENS" sub="Train your fellowship" onPress={() => router.push('/guardians')} color={C.green} />
          <MenuCard icon={<Gem size={21} color={C.violet} />} label="HEARTSTONE" sub="Strengthen the sanctuary" onPress={() => router.push('/core')} color={C.violet} />
        </View>
        <View style={styles.loreCard}>
          <Shield color={C.parchmentDark} size={20} />
          <Text style={styles.loreText}>Every road leads home. Keep the Heartstone burning.</Text>
        </View>
      </ScrollView>

      <Modal visible={settingsOpen} transparent animationType="fade" onRequestClose={() => setSettingsOpen(false)}>
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalKicker}>TRAVELER&apos;S OPTIONS</Text>
                <Text style={styles.modalTitle}>SETTINGS</Text>
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel="Close settings" onPress={() => setSettingsOpen(false)} hitSlop={10}>
                <X color={C.parchment} size={24} />
              </Pressable>
            </View>
            <SettingsPanel showDevSeed />
          </View>
        </View>
      </Modal>
    </View>
  );
}

function MenuCard({ icon, label, sub, onPress, color }: { icon: ReactNode; label: string; sub: string; onPress: () => void; color: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => {
        hapticLight();
        onPress();
      }}
      style={({ pressed }) => [styles.card, { borderColor: color + '66' }, pressed && { transform: [{ scale: 0.97 }] }]}>
      <View style={[styles.cardIcon, { backgroundColor: color + '22' }]}>{icon}</View>
      <Text style={[styles.cardLabel, { color }]}>{label}</Text>
      <Text style={styles.cardSub}>{sub}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  background: { ...StyleSheet.absoluteFillObject, height: 430 },
  backgroundImage: { opacity: 0.48 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  eyebrow: { color: C.parchmentDark, fontSize: 8, fontWeight: '900', letterSpacing: 2.2 },
  title: { color: C.parchment, fontSize: 20, fontWeight: '900', letterSpacing: 2.5, marginTop: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  currency: { alignItems: 'flex-end' },
  currencyValue: { color: C.yellow, fontSize: 16, fontWeight: '900', fontVariant: ['tabular-nums'] },
  currencyLabel: { color: C.parchmentDark, fontSize: 7, fontWeight: '900', letterSpacing: 0.8 },
  gear: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#927c50',
    backgroundColor: '#223122cc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { padding: 16, paddingBottom: 36, gap: 15 },
  nextBattle: {
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#b49c62',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  nextGrad: { padding: 18 },
  nextHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  questSeal: { width: 46, height: 46, borderRadius: 23, backgroundColor: C.yellow, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#f2dda0' },
  nextKicker: { color: C.parchmentDark, fontSize: 9, fontWeight: '900', letterSpacing: 2 },
  nextName: { color: C.parchment, fontSize: 23, fontWeight: '900', marginTop: 2 },
  stageNo: { color: '#d3bf84', fontSize: 21, fontWeight: '900', fontStyle: 'italic' },
  nextMod: { color: C.orange, fontSize: 13, fontWeight: '900', marginTop: 12 },
  nextDesc: { color: C.textDim, fontSize: 13, marginTop: 3, lineHeight: 19 },
  deployBtn: { marginTop: 16, backgroundColor: C.yellow, borderRadius: 13, paddingVertical: 13, alignItems: 'center', borderWidth: 1.5, borderColor: '#f3dfa5' },
  deployText: { color: '#302417', fontSize: 14, fontWeight: '900', letterSpacing: 2.2 },
  sectionTitle: { color: C.parchmentDark, fontSize: 10, fontWeight: '900', letterSpacing: 3, marginTop: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    width: '47%',
    flexGrow: 1,
    minHeight: 126,
    backgroundColor: '#253426f2',
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 14,
  },
  cardIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', marginBottom: 11 },
  cardLabel: { fontSize: 14, fontWeight: '900', letterSpacing: 1.5 },
  cardSub: { color: C.textDim, fontSize: 10, marginTop: 4, lineHeight: 14 },
  loreCard: { flexDirection: 'row', alignItems: 'center', gap: 10, borderTopWidth: 1, borderColor: '#6e6044', paddingTop: 14, marginTop: 2 },
  loreText: { color: C.parchmentDark, fontSize: 11, fontStyle: 'italic', flex: 1 },
  modalBg: { flex: 1, backgroundColor: '#081009dd', alignItems: 'center', justifyContent: 'center', padding: 20 },
  modalCard: { width: '100%', maxWidth: 380, backgroundColor: '#1c2a1d', borderRadius: 22, padding: 16, borderWidth: 2, borderColor: '#8a7853' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalKicker: { color: C.parchmentDark, fontSize: 8, fontWeight: '900', letterSpacing: 2 },
  modalTitle: { color: C.parchment, fontSize: 17, fontWeight: '900', letterSpacing: 3, marginTop: 2 },
});
