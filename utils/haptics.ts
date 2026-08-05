import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useMeta } from '@/store/useMeta';

function enabled(): boolean {
  return Platform.OS !== 'web' && useMeta.getState().settings.haptics;
}

export function hapticLight() {
  if (enabled()) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export function hapticMedium() {
  if (enabled()) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}

export function hapticHeavy() {
  if (enabled()) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
}

export function hapticSuccess() {
  if (enabled()) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

export function hapticError() {
  if (enabled()) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
}
