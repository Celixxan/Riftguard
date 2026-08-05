import { useEffect } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useMeta } from '@/store/useMeta';
import { C } from '@/theme/colors';
import { hapticMedium } from '@/utils/haptics';

export default function TitleScreen() {
  const glow = useSharedValue(0.4);
  const drift = useSharedValue(0);
  const reduceMotion = useMeta(s => s.settings.reduceMotion);

  useEffect(() => {
    if (!reduceMotion) {
      glow.value = withRepeat(
        withSequence(withTiming(1, { duration: 1400 }), withTiming(0.4, { duration: 1400 })),
        -1
      );
      drift.value = withRepeat(
        withSequence(withTiming(-8, { duration: 2600 }), withTiming(8, { duration: 2600 })),
        -1,
        true
      );
    }
  }, [reduceMotion, glow, drift]);

  const glowStyle = useAnimatedStyle(() => ({ opacity: glow.value }));
  const driftStyle = useAnimatedStyle(() => ({ transform: [{ translateY: drift.value }] }));

  return (
    <Pressable
      style={styles.root}
      onPress={() => {
        hapticMedium();
        router.replace('/hub');
      }}>
      <LinearGradient colors={['#05070d', '#0a1020', '#05070d']} style={StyleSheet.absoluteFill} />
      {[
        { top: '18%', left: '10%', rot: '-24deg', color: C.cyan },
        { top: '32%', left: '55%', rot: '14deg', color: C.violet },
        { top: '68%', left: '20%', rot: '8deg', color: C.orange },
        { top: '80%', left: '60%', rot: '-12deg', color: C.crimson },
      ].map((c, i) => (
        <Animated.View
          key={i}
          style={[
            styles.crack,
            glowStyle,
            { top: c.top as any, left: c.left as any, transform: [{ rotate: c.rot }], backgroundColor: c.color },
          ]}
        />
      ))}
      <Animated.View style={[styles.center, driftStyle]}>
        <Text style={styles.kicker}>A RIFT WARDEN RISES</Text>
        <Text style={styles.title}>RIFTGUARD</Text>
        <Text style={styles.subtitle}>MERGE SIEGE</Text>
        <Animated.View style={[styles.orb, glowStyle]} />
      </Animated.View>
      <Animated.Text style={[styles.tap, glowStyle]}>TAP TO START</Animated.Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
  crack: { position: 'absolute', width: 140, height: 3, borderRadius: 2 },
  center: { alignItems: 'center' },
  kicker: { color: C.violet, fontSize: 12, fontWeight: '800', letterSpacing: 4 },
  title: {
    color: C.text,
    fontSize: 52,
    fontWeight: '900',
    letterSpacing: 6,
    marginTop: 8,
    textShadowColor: C.cyan,
    textShadowRadius: 24,
    textShadowOffset: { width: 0, height: 0 },
  },
  subtitle: { color: C.cyan, fontSize: 20, fontWeight: '800', letterSpacing: 12, marginTop: 4 },
  orb: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: C.cyan,
    marginTop: 40,
    shadowColor: C.cyan,
    shadowOpacity: 1,
    shadowRadius: 30,
  },
  tap: {
    position: 'absolute',
    bottom: 80,
    color: C.textDim,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 4,
  },
});
