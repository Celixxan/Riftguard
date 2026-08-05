import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Lock } from 'lucide-react-native';
import { useMeta } from '@/store/useMeta';
import { STAGES } from '@/game/data/stages';
import { C } from '@/theme/colors';
import { hapticLight } from '@/utils/haptics';

export default function CampaignScreen() {
  const insets = useSafeAreaInsets();
  const meta = useMeta();

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.back}>
          <ArrowLeft color={C.text} size={22} />
        </Pressable>
        <Text style={styles.title}>CAMPAIGN</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {STAGES.map(stage => {
          const unlocked = stage.id <= meta.unlocked;
          const record = meta.stages[stage.id];
          return (
            <Pressable
              key={stage.id}
              disabled={!unlocked}
              onPress={() => {
                hapticLight();
                router.push({ pathname: '/battle', params: { stageId: String(stage.id) } });
              }}
              style={({ pressed }) => [
                styles.stage,
                !unlocked && styles.locked,
                pressed && unlocked && { opacity: 0.8 },
              ]}>
              <View style={styles.stageNum}>
                {unlocked ? (
                  <Text style={styles.stageNumText}>{stage.id}</Text>
                ) : (
                  <Lock color={C.textFaint} size={18} />
                )}
              </View>
              <View style={styles.stageInfo}>
                <Text style={[styles.stageName, !unlocked && { color: C.textFaint }]}>{stage.name}</Text>
                <Text style={styles.stageMod}>{stage.modifierName}</Text>
                {record && (
                  <Text style={styles.record}>
                    Best: {record.bestTime}s · Core {record.bestCore}%
                  </Text>
                )}
              </View>
              <View style={styles.stars}>
                {[1, 2, 3].map(i => (
                  <Text key={i} style={[styles.star, { color: (record?.stars ?? 0) >= i ? C.yellow : '#26324a' }]}>
                    ★
                  </Text>
                ))}
              </View>
            </Pressable>
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
  title: { color: C.text, fontSize: 18, fontWeight: '900', letterSpacing: 4 },
  scroll: { padding: 16, gap: 12 },
  stage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    gap: 12,
  },
  locked: { opacity: 0.55 },
  stageNum: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: C.bgPanel,
    borderWidth: 1,
    borderColor: C.borderBright,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageNumText: { color: C.cyan, fontSize: 18, fontWeight: '900' },
  stageInfo: { flex: 1 },
  stageName: { color: C.text, fontSize: 16, fontWeight: '800' },
  stageMod: { color: C.orange, fontSize: 11, fontWeight: '700', marginTop: 2 },
  record: { color: C.textFaint, fontSize: 11, marginTop: 2 },
  stars: { flexDirection: 'row', gap: 2 },
  star: { fontSize: 16 },
});
