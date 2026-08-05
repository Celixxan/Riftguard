import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BattleState, chooseUpgrade, rerollOffer } from '@/game/sim/battle';
import { RARITY_COLOR } from '@/game/data/upgrades';
import { C } from '@/theme/colors';
import { hapticSuccess, hapticLight } from '@/utils/haptics';

interface Props {
  battle: BattleState;
}

export function EnhanceOverlay({ battle }: Props) {
  const b = battle;
  if (b.phase !== 'upgrade' || !b.offer) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.flourishRow}>
        <View style={styles.flourish} />
        <Text style={styles.flourishMark}>❦</Text>
        <View style={styles.flourish} />
      </View>
      <Text style={styles.title}>CHOOSE A BLESSING</Text>
      <Text style={styles.sub}>The old forest offers one boon for this journey</Text>
      <View style={styles.cards}>
        {b.offer.map(u => {
          const color = RARITY_COLOR[u.rarity];
          return (
            <Pressable
              key={u.id}
              onPress={() => {
                hapticSuccess();
                chooseUpgrade(b, u.id);
              }}
              style={({ pressed }) => [
                styles.card,
                { borderColor: color, shadowColor: color },
                u.rarity === 'epic' && styles.epicCard,
                pressed && { transform: [{ scale: 0.97 }] },
              ]}>
              <View style={[styles.rarityPill, { backgroundColor: color }]}>
                <Text style={styles.rarity}>{u.rarity.toUpperCase()}</Text>
              </View>
              <Text style={styles.name}>{u.name}</Text>
              <Text style={styles.desc}>{u.desc}</Text>
            </Pressable>
          );
        })}
      </View>
      <Pressable
        disabled={b.rerollUsed}
        onPress={() => {
          hapticLight();
          rerollOffer(b);
        }}
        style={[styles.reroll, b.rerollUsed && { opacity: 0.4 }]}>
        <Text style={styles.rerollText}>
          {b.rerollUsed ? 'FATE ALREADY TURNED' : 'RESHUFFLE FATE · 1 FREE'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0d160ff2',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    zIndex: 50,
  },
  flourishRow: { flexDirection: 'row', alignItems: 'center', gap: 10, width: 230, marginBottom: 8 },
  flourish: { flex: 1, height: 1, backgroundColor: C.parchmentDark },
  flourishMark: { color: C.yellow, fontSize: 18 },
  title: { color: C.parchment, fontSize: 23, fontWeight: '900', letterSpacing: 3.5, textAlign: 'center' },
  sub: { color: C.parchmentDark, fontSize: 12, marginTop: 6, marginBottom: 20, textAlign: 'center' },
  cards: { gap: 12, width: '100%', maxWidth: 380 },
  card: {
    borderWidth: 2,
    borderRadius: 18,
    backgroundColor: C.parchment,
    padding: 15,
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  epicCard: { backgroundColor: '#f3d9aa' },
  rarityPill: { alignSelf: 'flex-start', borderRadius: 20, paddingHorizontal: 9, paddingVertical: 3 },
  rarity: { color: '#241a12', fontSize: 9, fontWeight: '900', letterSpacing: 1.6 },
  name: { color: '#302417', fontSize: 17, fontWeight: '900', marginTop: 7 },
  desc: { color: '#6a573d', fontSize: 13, marginTop: 3, lineHeight: 18 },
  reroll: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.parchmentDark,
    backgroundColor: '#2c3d2b',
  },
  rerollText: { color: C.parchment, fontSize: 12, fontWeight: '900', letterSpacing: 1 },
});
