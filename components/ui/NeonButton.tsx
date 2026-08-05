import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { C } from '@/theme/colors';
import { hapticLight } from '@/utils/haptics';

interface Props {
  label: string;
  sub?: string;
  onPress: () => void;
  color?: string;
  disabled?: boolean;
  style?: ViewStyle;
  small?: boolean;
}

export function NeonButton({ label, sub, onPress, color = C.cyan, disabled, style, small }: Props) {
  return (
    <Pressable
      onPress={() => {
        if (!disabled) {
          hapticLight();
          onPress();
        }
      }}
      disabled={disabled}
      style={({ pressed }) => [
        styles.wrap,
        small && styles.small,
        { borderColor: disabled ? C.border : color, opacity: disabled ? 0.45 : pressed ? 0.8 : 1 },
        style,
      ]}>
      <LinearGradient
        colors={[disabled ? '#111827' : color + '33', '#0b101c']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.grad, small && styles.gradSmall]}>
        <Text style={[styles.label, small && styles.labelSmall, { color: disabled ? C.textFaint : C.text }]}>
          {label}
        </Text>
        {sub ? <Text style={[styles.sub, { color: disabled ? C.textFaint : color }]}>{sub}</Text> : null}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1.5,
    borderRadius: 14,
    overflow: 'hidden',
  },
  small: { borderRadius: 10 },
  grad: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradSmall: { paddingVertical: 8, paddingHorizontal: 12 },
  label: { fontSize: 16, fontWeight: '700', letterSpacing: 1 },
  labelSmall: { fontSize: 13 },
  sub: { fontSize: 12, fontWeight: '600', marginTop: 2 },
});
