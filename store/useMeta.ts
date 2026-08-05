import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GuardianTypeId } from '@/types/game';
import { BALANCE } from '@/game/data/balance';

export interface StageRecord {
  stars: number;
  bestTime: number;
  bestCore: number;
}

export interface Settings {
  haptics: boolean;
  sound: boolean;
  music: boolean;
  reduceMotion: boolean;
  damageNumbers: boolean;
  colorblind: boolean;
  showDiagnostics: boolean;
}

export interface CoreUpgrades {
  hp: number;
  energy: number;
  stability: number;
  freeSummon: number;
}

interface MetaState {
  version: number;
  credits: number;
  data: number;
  unlocked: number;
  stages: Record<number, StageRecord>;
  levels: Record<GuardianTypeId, number>;
  loadout: GuardianTypeId[];
  core: CoreUpgrades;
  settings: Settings;
  tutorialDone: boolean;
  devSeed: string;
  addRewards: (credits: number, data: number) => void;
  recordStage: (id: number, stars: number, time: number, core: number) => void;
  levelUpGuardian: (id: GuardianTypeId) => boolean;
  upgradeCore: (key: keyof CoreUpgrades) => boolean;
  setLoadout: (loadout: GuardianTypeId[]) => void;
  setSetting: (key: keyof Settings, value: boolean) => void;
  setTutorialDone: () => void;
  setDevSeed: (seed: string) => void;
}

export const useMeta = create<MetaState>()(
  persist(
    (set, get) => ({
      version: 1,
      credits: 0,
      data: 0,
      unlocked: 1,
      stages: {},
      levels: { arc: 1, nova: 1, cryo: 1, engi: 1 },
      loadout: ['arc', 'nova', 'cryo', 'engi'],
      core: { hp: 0, energy: 0, stability: 0, freeSummon: 0 },
      settings: {
        haptics: true,
        sound: true,
        music: true,
        reduceMotion: false,
        damageNumbers: true,
        colorblind: false,
        showDiagnostics: false,
      },
      tutorialDone: false,
      devSeed: '',
      addRewards: (credits, data) =>
        set(s => ({ credits: s.credits + credits, data: s.data + data })),
      recordStage: (id, stars, time, core) =>
        set(s => {
          const prev = s.stages[id];
          return {
            stages: {
              ...s.stages,
              [id]: {
                stars: Math.max(prev?.stars ?? 0, stars),
                bestTime: prev?.bestTime ? Math.min(prev.bestTime, time) : time,
                bestCore: Math.max(prev?.bestCore ?? 0, core),
              },
            },
            unlocked: Math.max(s.unlocked, Math.min(5, id + 1)),
          };
        }),
      levelUpGuardian: id => {
        const s = get();
        const level = s.levels[id];
        if (level >= 10) return false;
        const cost = BALANCE.guardianLevelCosts[level];
        if (s.credits < cost) return false;
        set({
          credits: s.credits - cost,
          levels: { ...s.levels, [id]: level + 1 },
        });
        return true;
      },
      upgradeCore: key => {
        const s = get();
        const def = BALANCE.coreUpgrades[key];
        const level = s.core[key];
        if (level >= def.max) return false;
        const cost = def.costs[level];
        if (s.credits < cost) return false;
        set({
          credits: s.credits - cost,
          core: { ...s.core, [key]: level + 1 },
        });
        return true;
      },
      setLoadout: loadout => set({ loadout }),
      setSetting: (key, value) =>
        set(s => ({ settings: { ...s.settings, [key]: value } })),
      setTutorialDone: () => set({ tutorialDone: true }),
      setDevSeed: seed => set({ devSeed: seed }),
    }),
    {
      name: 'riftguard-save-v1',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<MetaState>;
        return {
          ...current,
          ...p,
          settings: { ...current.settings, ...(p.settings ?? {}) },
          core: { ...current.core, ...(p.core ?? {}) },
          levels: { ...current.levels, ...(p.levels ?? {}) },
        };
      },
    }
  )
);
