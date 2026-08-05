import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { advanceTutorial, BattleState, canMerge } from '@/game/sim/battle';
import { NeonButton } from '@/components/ui/NeonButton';

interface Props {
  battle: BattleState;
  onDone: () => void;
}

function hasMergePair(b: BattleState): boolean {
  for (let i = 0; i < 16; i++) {
    for (let j = i + 1; j < 16; j++) {
      if (canMerge(b, i, j)) return true;
    }
  }
  return false;
}

const STEP_TEXT: Record<number, { title: string; body: string }> = {
  1: { title: 'CALL A WARDEN', body: 'Tap CALL WARDEN below. It spends mana and places one of your Wardens on an open rune pad.' },
  2: { title: 'FORM A PAIR', body: 'Keep calling until two matching Wardens of the same tier stand beside the trail.' },
  3: { title: 'MERGE THEIR POWER', body: 'Drag one matching Warden onto the other to create a stronger, higher-tier defender.' },
  4: { title: 'CHOOSE A BLESSING', body: 'Your Blessing meter is full. Choose one boon from the old forest.' },
  5: { title: 'GUARD THE HEARTSTONE', body: 'Creatures follow the winding trail toward the Heartstone. Survive all 10 waves and defeat the Hollow Colossus.' },
};

export function TutorialOverlay({ battle, onDone }: Props) {
  const b = battle;
  const step = b.tutorialStep;

  useEffect(() => {
    if (step === 1 && b.summons >= 1) advanceTutorial(b);
    else if (step === 2 && hasMergePair(b)) advanceTutorial(b);
    else if (step === 3 && b.mergeCount >= 1) advanceTutorial(b);
    else if (step === 4 && b.taken.length >= 1) advanceTutorial(b);
  });

  if (step <= 0 || step > 5 || b.phase === 'upgrade' || b.phase === 'paused') return null;
  const text = STEP_TEXT[step];
  if (!text) return null;

  return (
    <View style={[styles.wrap, step <= 3 ? styles.top : styles.center]} pointerEvents="box-none">
      <View style={styles.card}>
        <Text style={styles.step}>TUTORIAL {step}/5</Text>
        <Text style={styles.title}>{text.title}</Text>
        <Text style={styles.body}>{text.body}</Text>
        {step === 5 && (
          <NeonButton
            label="OPEN THE TRAIL"
            small
            style={{ marginTop: 10 }}
            onPress={() => {
              advanceTutorial(b);
              onDone();
            }}
          />
        )}
      </View>
      {step === 1 && <View style={styles.arrowDown} />}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 16, right: 16, zIndex: 40, alignItems: 'center' },
  top: { top: 90 },
  center: { top: '35%' },
  card: {
    backgroundColor: '#efe2bdf5',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#8b6a3f',
    padding: 14,
    maxWidth: 340,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  step: { color: '#7a542e', fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  title: { color: '#302417', fontSize: 16, fontWeight: '900', marginTop: 4, letterSpacing: 1 },
  body: { color: '#6a573d', fontSize: 13, lineHeight: 19, marginTop: 6 },
  arrowDown: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#8b6a3f',
    marginTop: -1,
  },
});
