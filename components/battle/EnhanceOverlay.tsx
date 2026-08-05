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
      <Text style={styles.title}>ENHANCE</Text>
      <Text style={styles.sub}>Choose one upgrade for this battle</Text>
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
              <Text style={[styles.rarity, { color }]}>{u.rarity.toUpperCase()}</Text>
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
          {b.rerollUsed ? 'REROLL USED' : 'REROLL (1 free)'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#05070df2',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    zIndex: 50,
  },
  title: { color: C.orange, fontSize: 26, fontWeight: '900', letterSpacing: 6 },
  sub: { color: C.textDim, fontSize: 13, marginTop: 4, marginBottom: 20 },
  cards: { gap: 12, width: '100%', maxWidth: 380 },
  card: {
    borderWidth: 1.5,
    borderRadius: 14,
    backgroundColor: C.bgCard,
    padding: 14,
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  epicCard: { backgroundColor: '#1c1408' },
  rarity: { fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  name: { color: C.text, fontSize: 17, fontWeight: '800', marginTop: 4 },
  desc: { color: C.textDim, fontSize: 13, marginTop: 4, lineHeight: 19 },
  reroll: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.borderBright,
  },
  rerollText: { color: C.textDim, fontSize: 13, fontWeight: '800', letterSpacing: 1 },
});
