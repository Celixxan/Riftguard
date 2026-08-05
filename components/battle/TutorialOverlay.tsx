import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { advanceTutorial, BattleState, canMerge } from '@/game/sim/battle';
import { NeonButton } from '@/components/ui/NeonButton';
import { C } from '@/theme/colors';

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
  1: { title: 'SUMMON A GUARDIAN', body: 'Tap the SUMMON button below. It spends energy and deploys a random Guardian from your squad.' },
  2: { title: 'BUILD A PAIR', body: 'Keep summoning until two matching Guardians of the same rank appear on the grid.' },
  3: { title: 'MERGE THEM', body: 'Drag one matching Guardian onto the other. Merging creates a stronger, higher-rank unit.' },
  4: { title: 'ENHANCE', body: 'Your Enhance meter is full. Pick one of the three upgrade cards.' },
  5: { title: 'DEFEND THE CORE', body: 'Corrupted creatures will pour from the portals above. If they reach your Core, it takes damage. Survive all 10 waves and defeat the Colossus.' },
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
            label="BEGIN DEFENSE"
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
    backgroundColor: '#0b101cf0',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: C.cyan,
    padding: 14,
    maxWidth: 340,
    shadowColor: C.cyan,
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  step: { color: C.cyan, fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  title: { color: C.text, fontSize: 16, fontWeight: '900', marginTop: 4, letterSpacing: 1 },
  body: { color: C.textDim, fontSize: 13, lineHeight: 19, marginTop: 6 },
  arrowDown: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: C.cyan,
    marginTop: -1,
  },
});
