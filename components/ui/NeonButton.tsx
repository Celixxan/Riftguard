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

export function NeonButton({ label, sub, onPress, color = C.yellow, disabled, style, small }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
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
        colors={disabled ? ['#3f4938', '#2b3529'] : [color, color + 'b8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.grad, small && styles.gradSmall]}>
        <Text style={[styles.label, small && styles.labelSmall, { color: disabled ? C.textFaint : '#302417' }]}>
          {label}
        </Text>
        {sub ? <Text style={[styles.sub, { color: disabled ? C.textFaint : '#5d4227' }]}>{sub}</Text> : null}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 2,
    borderRadius: 16,
    borderColor: '#f0d477',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
  small: { borderRadius: 10 },
  grad: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradSmall: { paddingVertical: 8, paddingHorizontal: 12 },
  label: { fontSize: 16, fontWeight: '900', letterSpacing: 1.3 },
  labelSmall: { fontSize: 13 },
  sub: { fontSize: 12, fontWeight: '800', marginTop: 2, color: '#5d4227' },
});
