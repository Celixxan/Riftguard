import { useEffect } from 'react';
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Shield } from 'lucide-react-native';
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

const forest = require('../assets/images/battlefield-forest-v1.png');

export default function TitleScreen() {
  const glow = useSharedValue(0.62);
  const drift = useSharedValue(0);
  const reduceMotion = useMeta(s => s.settings.reduceMotion);

  useEffect(() => {
    if (!reduceMotion) {
      glow.value = withRepeat(
        withSequence(withTiming(1, { duration: 1700 }), withTiming(0.62, { duration: 1700 })),
        -1
      );
      drift.value = withRepeat(
        withSequence(withTiming(-5, { duration: 2600 }), withTiming(5, { duration: 2600 })),
        -1,
        true
      );
    }
  }, [reduceMotion, glow, drift]);

  const glowStyle = useAnimatedStyle(() => ({ opacity: glow.value }));
  const driftStyle = useAnimatedStyle(() => ({ transform: [{ translateY: drift.value }] }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Begin Riftguard"
      style={styles.root}
      onPress={() => {
        hapticMedium();
        router.replace('/hub');
      }}>
      <ImageBackground source={forest} resizeMode="cover" style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={['#0b130ad9', '#10180a57', '#0a1009e8']}
        locations={[0, 0.48, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.frame} pointerEvents="none" />

      <Animated.View style={[styles.center, driftStyle]}>
        <Animated.View style={[styles.crest, glowStyle]}>
          <Shield color={C.parchment} size={42} strokeWidth={1.6} />
          <Text style={styles.crestRune}>✦</Text>
        </Animated.View>
        <Text style={styles.kicker}>THE WARDEN&apos;S PATH</Text>
        <Text style={styles.title}>RIFTGUARD</Text>
        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.leaf}>❦</Text>
          <View style={styles.divider} />
        </View>
        <Text style={styles.subtitle}>GUARD THE HEARTSTONE</Text>
      </Animated.View>

      <Animated.View style={[styles.tapWrap, glowStyle]}>
        <Text style={styles.tap}>TAP TO BEGIN</Text>
        <Text style={styles.tapSub}>A winding road awaits</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
  frame: {
    ...StyleSheet.absoluteFillObject,
    margin: 14,
    borderWidth: 1.5,
    borderColor: '#d3b96d66',
    borderRadius: 28,
  },
  center: { alignItems: 'center', paddingHorizontal: 22 },
  crest: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2,
    borderColor: C.parchmentDark,
    backgroundColor: '#263b24db',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.yellow,
    shadowOpacity: 0.6,
    shadowRadius: 20,
    marginBottom: 20,
  },
  crestRune: { position: 'absolute', color: C.yellow, fontSize: 14 },
  kicker: { color: C.parchmentDark, fontSize: 11, fontWeight: '900', letterSpacing: 3.8 },
  title: {
    color: C.parchment,
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: 4.5,
    marginTop: 8,
    textShadowColor: '#1a2416',
    textShadowRadius: 8,
    textShadowOffset: { width: 0, height: 3 },
  },
  dividerRow: { width: 260, flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  divider: { flex: 1, height: 1, backgroundColor: C.parchmentDark },
  leaf: { color: C.yellow, fontSize: 18 },
  subtitle: { color: C.parchment, fontSize: 13, fontWeight: '800', letterSpacing: 3.2, marginTop: 7 },
  tapWrap: { position: 'absolute', bottom: 70, alignItems: 'center' },
  tap: { color: C.parchment, fontSize: 14, fontWeight: '900', letterSpacing: 3 },
  tapSub: { color: C.parchmentDark, fontSize: 11, marginTop: 5, fontStyle: 'italic' },
});
