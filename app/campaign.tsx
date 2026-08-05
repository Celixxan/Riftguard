import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Lock, Map } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
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
        <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.back()} hitSlop={10} style={styles.back}>
          <ArrowLeft color={C.parchment} size={22} />
        </Pressable>
        <View style={styles.heading}>
          <Text style={styles.kicker}>THE WARDEN&apos;S</Text>
          <Text style={styles.title}>JOURNEY</Text>
        </View>
        <View style={styles.mapSeal}>
          <Map color={C.yellow} size={20} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>Follow the old road through five cursed lands. Each clearing brings the Heartstone closer to safety.</Text>
        <View style={styles.route}>
          <Svg width="100%" height={610} viewBox="0 0 100 610" style={styles.routeSvg} pointerEvents="none">
            <Path
              d="M18 61 C18 112 82 124 82 183 C82 236 18 248 18 305 C18 360 82 372 82 427 C82 482 18 500 18 549"
              stroke="#33271b"
              strokeWidth={6}
              fill="none"
              strokeLinecap="round"
            />
            <Path
              d="M18 61 C18 112 82 124 82 183 C82 236 18 248 18 305 C18 360 82 372 82 427 C82 482 18 500 18 549"
              stroke="#b58a55"
              strokeWidth={3.2}
              fill="none"
              strokeLinecap="round"
              strokeDasharray="3 3"
            />
          </Svg>

          {STAGES.map(stage => {
            const unlocked = stage.id <= meta.unlocked;
            const record = meta.stages[stage.id];
            const nodeLeft = stage.id % 2 === 1;
            return (
              <View key={stage.id} style={[styles.stopRow, nodeLeft ? styles.cardRight : styles.cardLeft]}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${stage.name}${unlocked ? '' : ', locked'}`}
                  disabled={!unlocked}
                  onPress={() => {
                    hapticLight();
                    router.push({ pathname: '/battle', params: { stageId: String(stage.id) } });
                  }}
                  style={({ pressed }) => [
                    styles.stage,
                    !unlocked && styles.locked,
                    pressed && unlocked && { transform: [{ scale: 0.98 }] },
                  ]}>
                  <View style={styles.stageTop}>
                    <Text style={styles.chapter}>CHAPTER {stage.id}</Text>
                    <View style={styles.stars}>
                      {[1, 2, 3].map(i => (
                        <Text key={i} style={[styles.star, { color: (record?.stars ?? 0) >= i ? C.yellow : '#62604e' }]}>★</Text>
                      ))}
                    </View>
                  </View>
                  <Text style={[styles.stageName, !unlocked && { color: C.textFaint }]}>{stage.name}</Text>
                  <Text style={styles.stageMod}>{stage.modifierName}</Text>
                  {record ? <Text style={styles.record}>Best {record.bestTime}s · Heartstone {record.bestCore}%</Text> : null}
                </Pressable>

                <View style={[styles.node, nodeLeft ? styles.nodeLeft : styles.nodeRight, !unlocked && styles.nodeLocked]}>
                  {unlocked ? <Text style={styles.nodeText}>{stage.id}</Text> : <Lock color={C.textFaint} size={18} />}
                </View>
              </View>
            );
          })}
        </View>
        <View style={styles.destination}>
          <Text style={styles.destinationRune}>✦</Text>
          <View>
            <Text style={styles.destinationLabel}>FINAL DESTINATION</Text>
            <Text style={styles.destinationName}>The Heartstone Sanctuary</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 10 },
  back: { width: 42, height: 42, borderRadius: 21, borderWidth: 1.5, borderColor: '#887755', backgroundColor: '#263426', alignItems: 'center', justifyContent: 'center' },
  heading: { alignItems: 'center' },
  kicker: { color: C.parchmentDark, fontSize: 8, fontWeight: '900', letterSpacing: 2.3 },
  title: { color: C.parchment, fontSize: 19, fontWeight: '900', letterSpacing: 3.5, marginTop: 1 },
  mapSeal: { width: 42, height: 42, borderRadius: 21, borderWidth: 1.5, borderColor: '#887755', backgroundColor: '#263426', alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 34 },
  intro: { color: C.textDim, fontSize: 12, lineHeight: 18, textAlign: 'center', paddingHorizontal: 20, marginBottom: 8 },
  route: { height: 610, position: 'relative' },
  routeSvg: { ...StyleSheet.absoluteFillObject },
  stopRow: { height: 122, justifyContent: 'center', position: 'relative' },
  cardRight: { paddingLeft: 92 },
  cardLeft: { paddingRight: 92 },
  stage: { backgroundColor: '#293629f2', borderRadius: 17, borderWidth: 1.5, borderColor: '#776b4e', padding: 12, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 4, shadowOffset: { width: 0, height: 3 } },
  locked: { opacity: 0.56 },
  stageTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chapter: { color: C.parchmentDark, fontSize: 8, fontWeight: '900', letterSpacing: 1.4 },
  stageName: { color: C.parchment, fontSize: 15, fontWeight: '900', marginTop: 3 },
  stageMod: { color: C.orange, fontSize: 10, fontWeight: '800', marginTop: 2 },
  record: { color: C.textFaint, fontSize: 9, marginTop: 3 },
  stars: { flexDirection: 'row', gap: 1 },
  star: { fontSize: 12 },
  node: { position: 'absolute', top: 37, width: 48, height: 48, borderRadius: 24, backgroundColor: C.yellow, borderWidth: 3, borderColor: '#f0dda3', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 5 },
  nodeLeft: { left: '11%' },
  nodeRight: { right: '11%' },
  nodeLocked: { backgroundColor: '#364035', borderColor: '#68705b' },
  nodeText: { color: '#352719', fontSize: 18, fontWeight: '900' },
  destination: { flexDirection: 'row', alignItems: 'center', alignSelf: 'center', gap: 12, borderTopWidth: 1, borderColor: '#776b4e', paddingTop: 15, paddingHorizontal: 16 },
  destinationRune: { color: C.yellow, fontSize: 28 },
  destinationLabel: { color: C.parchmentDark, fontSize: 8, fontWeight: '900', letterSpacing: 1.8 },
  destinationName: { color: C.parchment, fontSize: 13, fontWeight: '800', marginTop: 2 },
});
