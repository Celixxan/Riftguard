import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BattleState, togglePause } from '@/game/sim/battle';
import { NeonButton } from '@/components/ui/NeonButton';
import { SettingsPanel } from '@/components/SettingsPanel';
import { C } from '@/theme/colors';

interface Props {
  battle: BattleState;
  onQuit: () => void;
}

export function PauseOverlay({ battle, onQuit }: Props) {
  if (battle.phase !== 'paused') return null;

  return (
    <View style={styles.overlay}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>PAUSED</Text>
        <View style={styles.inner}>
          <SettingsPanel />
          <NeonButton label="RESUME" onPress={() => togglePause(battle)} />
          <NeonButton label="ABANDON BATTLE" color={C.crimson} onPress={onQuit} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#05070df2',
    zIndex: 60,
  },
  scroll: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { color: C.text, fontSize: 26, fontWeight: '900', letterSpacing: 8, marginBottom: 18 },
  inner: { width: '100%', maxWidth: 360, gap: 12 },
});
