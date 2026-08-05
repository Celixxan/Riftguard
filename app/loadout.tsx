import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useMeta } from '@/store/useMeta';
import { GUARDIANS } from '@/game/data/guardians';
import { GuardianSprite } from '@/components/ui/GuardianSprite';
import { C } from '@/theme/colors';
import { hapticLight, hapticMedium } from '@/utils/haptics';

export default function LoadoutScreen() {
  const insets = useSafeAreaInsets();
  const loadout = useMeta(s => s.loadout);
  const setLoadout = useMeta(s => s.setLoadout);
  const levels = useMeta(s => s.levels);
  const [selected, setSelected] = useState<number | null>(null);

  const swap = (i: number) => {
    hapticLight();
    if (selected === null) {
      setSelected(i);
    } else if (selected === i) {
      setSelected(null);
    } else {
      const next = [...loadout];
      [next[selected], next[i]] = [next[i], next[selected]];
      setLoadout(next);
      setSelected(null);
      hapticMedium();
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.back}>
          <ArrowLeft color={C.text} size={22} />
        </Pressable>
        <Text style={styles.title}>LOADOUT</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.hint}>
          These four Guardians enter every battle. Tap two slots to swap their summon order.
        </Text>
        <View style={styles.slots}>
          {loadout.map((type, i) => {
            const def = GUARDIANS[type];
            const isSel = selected === i;
            return (
              <Pressable
                key={i}
                onPress={() => swap(i)}
                style={[styles.slot, { borderColor: isSel ? C.yellow : def.color + '66' }, isSel && styles.slotSel]}>
                <Text style={styles.slotNum}>SLOT {i + 1}</Text>
                <GuardianSprite type={type} size={56} rank={0} />
                <Text style={[styles.slotName, { color: def.color }]}>{def.name}</Text>
                <Text style={styles.slotLevel}>Lv {levels[type]}</Text>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.details}>
          {loadout.map(type => {
            const def = GUARDIANS[type];
            return (
              <View key={type} style={styles.detailCard}>
                <View style={styles.detailHeader}>
                  <GuardianSprite type={type} size={34} rank={0} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.detailName, { color: def.color }]}>{def.name}</Text>
                    <Text style={styles.detailRole}>{def.role}</Text>
                  </View>
                </View>
                <Text style={styles.detailDesc}>{def.desc}</Text>
                <Text style={styles.detailUlt}>
                  ULT — {def.ultName}: {def.ultDesc}
                </Text>
              </View>
            );
          })}
        </View>
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
  title: { color: C.text, fontSize: 18, fontWeight: '900', letterSpacing: 4 },
  scroll: { padding: 16, gap: 16 },
  hint: { color: C.textDim, fontSize: 13, lineHeight: 19 },
  slots: { flexDirection: 'row', gap: 10 },
  slot: {
    flex: 1,
    backgroundColor: C.bgCard,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  slotSel: { backgroundColor: '#fde04712' },
  slotNum: { color: C.textFaint, fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  slotName: { fontSize: 10, fontWeight: '800', textAlign: 'center' },
  slotLevel: { color: C.textDim, fontSize: 10, fontWeight: '700' },
  details: { gap: 12 },
  detailCard: {
    backgroundColor: C.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    gap: 8,
  },
  detailHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  detailName: { fontSize: 15, fontWeight: '800' },
  detailRole: { color: C.textFaint, fontSize: 11, fontWeight: '700' },
  detailDesc: { color: C.textDim, fontSize: 12, lineHeight: 18 },
  detailUlt: { color: C.orange, fontSize: 11, lineHeight: 17, fontWeight: '600' },
});
