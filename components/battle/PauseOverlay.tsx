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
        <Text style={styles.kicker}>THE FOREST WAITS</Text>
        <Text style={styles.title}>TRAIL PAUSED</Text>
        <View style={styles.inner}>
          <SettingsPanel />
          <NeonButton label="RETURN TO THE TRAIL" onPress={() => togglePause(battle)} />
          <NeonButton label="LEAVE THIS JOURNEY" color={C.crimson} onPress={onQuit} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0d160ff2',
    zIndex: 60,
  },
  scroll: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  kicker: { color: C.parchmentDark, fontSize: 10, fontWeight: '900', letterSpacing: 3, marginBottom: 5 },
  title: { color: C.parchment, fontSize: 25, fontWeight: '900', letterSpacing: 4, marginBottom: 18 },
  inner: { width: '100%', maxWidth: 360, gap: 12 },
});
