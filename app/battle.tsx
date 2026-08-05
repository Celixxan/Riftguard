import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { BattleState } from '@/game/sim/battle';
import { endBattle, getSpeed, setSpeed, startBattle, useBattleTicker } from '@/store/useBattle';
import { useMeta } from '@/store/useMeta';
import { BALANCE, FIELD } from '@/game/data/balance';
import { STAGES } from '@/game/data/stages';
import { seedFromString } from '@/game/rng';
import { FieldView } from '@/components/battle/FieldView';
import { HUD } from '@/components/battle/HUD';
import { BottomBar } from '@/components/battle/BottomBar';
import { EnhanceOverlay } from '@/components/battle/EnhanceOverlay';
import { PauseOverlay } from '@/components/battle/PauseOverlay';
import { ResultOverlay } from '@/components/battle/ResultOverlay';
import { TutorialOverlay } from '@/components/battle/TutorialOverlay';
import { DevOverlay } from '@/components/battle/DevOverlay';
import { C } from '@/theme/colors';

export default function BattleScreen() {
  const { stageId } = useLocalSearchParams<{ stageId: string }>();
  const stage = STAGES.find(s => s.id === Number(stageId)) ?? STAGES[0];
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const meta = useMeta();
  const [dragCell, setDragCell] = useState<number | null>(null);
  const [battleKey, setBattleKey] = useState(0);
  const rewardsRef = useRef<{ credits: number; data: number; firstClear: boolean } | null>(null);
  const grantedRef = useRef(false);

  const createNewBattle = useCallback((): BattleState => {
    const m = useMeta.getState();
    const seed = m.devSeed
      ? seedFromString(m.devSeed)
      : (Date.now() ^ Math.floor(Math.random() * 0xffffff)) >>> 0;
    grantedRef.current = false;
    rewardsRef.current = null;
    return startBattle({
      stageId: stage.id,
      seed,
      loadout: m.loadout,
      levels: m.levels,
      coreBonusHp: m.core.hp * BALANCE.coreUpgrades.hp.perLevel,
      coreBonusEnergy: m.core.energy * BALANCE.coreUpgrades.energy.perLevel,
      stabilityRateMul: 1 + m.core.stability * BALANCE.coreUpgrades.stability.perLevel,
      freeSummons: m.core.freeSummon,
      tutorial: !m.tutorialDone && stage.id === 1,
    });
  }, [stage.id]);

  const battleRef = useRef<BattleState | null>(null);
  if (!battleRef.current) {
    battleRef.current = createNewBattle();
  }

  const { battle } = useBattleTicker();
  const b = battle ?? battleRef.current;

  useEffect(() => {
    return () => endBattle();
  }, []);

  useEffect(() => {
    if (b && b.phase === 'victory' && b.result && !grantedRef.current) {
      grantedRef.current = true;
      const m = useMeta.getState();
      const firstClear = !m.stages[stage.id] || m.stages[stage.id].stars === 0;
      const ratio = firstClear ? 1 : BALANCE.replayRewardRatio;
      const credits = Math.round(stage.rewardCredits * ratio * (0.7 + 0.1 * b.result.stars));
      const data = Math.round(stage.rewardData * ratio);
      rewardsRef.current = { credits, data, firstClear };
      m.addRewards(credits, data);
      m.recordStage(stage.id, b.result.stars, b.result.timeUsed, b.result.coreLeft);
      if (!m.tutorialDone) m.setTutorialDone();
    }
  }, [b, b?.phase, stage]);

  const hudHeight = 88;
  const barHeight = 92;
  const availH = height - insets.top - insets.bottom - hudHeight - barHeight - 8;
  const fieldPx = Math.min(width - 12, availH / FIELD.height);

  const retry = useCallback(() => {
    battleRef.current = createNewBattle();
    setSpeed(1);
    setBattleKey(k => k + 1);
  }, [createNewBattle]);

  const exit = useCallback(() => {
    endBattle();
    router.replace('/hub');
  }, []);

  const speed = getSpeed();
  const toggleSpeed = useCallback(() => setSpeed(getSpeed() === 1 ? 2 : 1), []);

  if (!b) return <View style={styles.root} />;

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]} key={battleKey}>
      <HUD battle={b} speed={speed} onSpeedToggle={toggleSpeed} />
      <View style={styles.fieldWrap}>
        <FieldView
          battle={b}
          px={fieldPx}
          reduceMotion={meta.settings.reduceMotion}
          damageNumbers={meta.settings.damageNumbers}
          colorblind={meta.settings.colorblind}
          onDragChange={setDragCell}
        />
      </View>
      <BottomBar battle={b} dragCell={dragCell} />
      <TutorialOverlay battle={b} onDone={() => useMeta.getState().setTutorialDone()} />
      <EnhanceOverlay battle={b} />
      <PauseOverlay battle={b} onQuit={exit} />
      <ResultOverlay battle={b} rewards={rewardsRef.current} onRetry={retry} onExit={exit} />
      {meta.settings.showDiagnostics && <DevOverlay battle={b} />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  fieldWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
