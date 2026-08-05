import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { CoreUpgrades, useMeta } from '@/store/useMeta';
import { BALANCE } from '@/game/data/balance';
import { C } from '@/theme/colors';
import { hapticSuccess, hapticError } from '@/utils/haptics';

const TRACKS: { key: keyof CoreUpgrades; name: string; desc: (lvl: number) => string; color: string }[] = [
  { key: 'hp', name: 'Stonebark Bastion', desc: l => `+${l * 12} starting Heartstone health`, color: C.cyan },
  { key: 'energy', name: 'Moonwell Spring', desc: l => `+${l * 10} starting mana`, color: C.energy },
  { key: 'stability', name: 'Fatewoven Roots', desc: l => `+${Math.round(l * 15)}% Fate from merges`, color: C.violet },
  { key: 'freeSummon', name: "Warden's Welcome", desc: l => (l > 0 ? '1 free Warden at journey start' : 'One free Warden at journey start'), color: C.orange },
];

export default function CoreScreen() {
  const insets = useSafeAreaInsets();
  const meta = useMeta();

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.back}>
          <ArrowLeft color={C.text} size={22} />
        </Pressable>
        <Text style={styles.title}>HEARTSTONE</Text>
        <Text style={styles.credits}>{meta.credits} GOLD</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.coreArt}>
          <View style={styles.coreAura}>
            <View style={styles.coreStone}>
              <Text style={styles.coreRune}>✦</Text>
            </View>
          </View>
          <Text style={styles.coreLabel}>ANCIENT HEARTSTONE</Text>
          <Text style={styles.coreLore}>Its roots bind every path in the realm.</Text>
        </View>
        {TRACKS.map(track => {
          const def = BALANCE.coreUpgrades[track.key];
          const level = meta.core[track.key];
          const maxed = level >= def.max;
          const cost = maxed ? 0 : def.costs[level];
          const affordable = meta.credits >= cost;
          return (
            <View key={track.key} style={[styles.card, { borderColor: track.color + '44' }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.name, { color: track.color }]}>{track.name}</Text>
                <Text style={styles.desc}>{track.desc(Math.max(level, 1))}</Text>
                <View style={styles.pips}>
                  {Array.from({ length: def.max }).map((_, i) => (
                    <View
                      key={i}
                      style={[styles.pip, { backgroundColor: i < level ? track.color : '#1a2438' }]}
                    />
                  ))}
                </View>
              </View>
              <Pressable
                disabled={maxed || !affordable}
                onPress={() => {
                  if (meta.upgradeCore(track.key)) hapticSuccess();
                  else hapticError();
                }}
                style={[styles.buyBtn, (maxed || !affordable) && { opacity: 0.4 }]}>
                <Text style={styles.buyText}>{maxed ? 'MAX' : 'UPGRADE'}</Text>
                {!maxed && <Text style={styles.buyCost}>{cost} GOLD</Text>}
              </Pressable>
            </View>
          );
        })}
      </ScrollView>
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
  title: { color: C.text, fontSize: 18, fontWeight: '900', letterSpacing: 3 },
  credits: { color: C.yellow, fontSize: 13, fontWeight: '800', width: 70, textAlign: 'right' },
  scroll: { padding: 16, gap: 14 },
  coreArt: { alignItems: 'center', paddingVertical: 18, gap: 9 },
  coreAura: {
    width: 116,
    height: 116,
    borderRadius: 58,
    borderWidth: 1.5,
    borderColor: '#8eb27666',
    backgroundColor: '#40583b',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.green,
    shadowOpacity: 0.65,
    shadowRadius: 24,
  },
  coreStone: {
    width: 76,
    height: 88,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: '#e4cf8d',
    backgroundColor: '#7ea262',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '45deg' }],
  },
  coreRune: { color: '#fff4c5', fontSize: 32, transform: [{ rotate: '-45deg' }] },
  coreLabel: { color: C.parchment, fontSize: 11, fontWeight: '900', letterSpacing: 2.5, marginTop: 8 },
  coreLore: { color: C.parchmentDark, fontSize: 11, fontStyle: 'italic' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.bgCard,
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 14,
    gap: 12,
  },
  name: { fontSize: 15, fontWeight: '800' },
  desc: { color: C.textDim, fontSize: 12, marginTop: 3, lineHeight: 17 },
  pips: { flexDirection: 'row', gap: 4, marginTop: 8 },
  pip: { width: 22, height: 6, borderRadius: 3 },
  buyBtn: {
    backgroundColor: C.yellow,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    minWidth: 84,
  },
  buyText: { color: '#302417', fontSize: 12, fontWeight: '900' },
  buyCost: { color: '#684b28', fontSize: 9, fontWeight: '800' },
});
