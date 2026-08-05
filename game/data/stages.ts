import { EnemyTypeId, StageDef } from '@/types/game';

export const STAGES: StageDef[] = [
  {
    id: 1,
    name: 'Whispering Trail',
    modifierName: 'First Footsteps',
    modifierDesc: 'Guard the woodland road and learn the rhythm of calling and merging.',
    hpMul: 1.36,
    speedMul: 1,
    shieldAll: false,
    energyPenalty: 0,
    twoPhaseBoss: false,
    rewardCredits: 90,
    rewardData: 3,
  },
  {
    id: 2,
    name: 'Windfall Pass',
    modifierName: 'Fleetfoot Curse',
    modifierDesc: 'All creatures move 25% faster. Slows and smart placement matter.',
    hpMul: 2.1,
    speedMul: 1.25,
    shieldAll: false,
    energyPenalty: 0,
    twoPhaseBoss: false,
    rewardCredits: 120,
    rewardData: 4,
  },
  {
    id: 3,
    name: 'Crystal Glade',
    modifierName: 'Glassbark Ward',
    modifierDesc: 'Every creature enters the trail protected by a crystal ward.',
    hpMul: 1.58,
    speedMul: 1,
    shieldAll: true,
    energyPenalty: 0,
    twoPhaseBoss: false,
    rewardCredits: 150,
    rewardData: 5,
  },
  {
    id: 4,
    name: 'Ashen Moor',
    modifierName: 'Fading Magic',
    modifierDesc: 'Defeated creatures grant less mana and you begin with fewer reserves.',
    hpMul: 1.92,
    speedMul: 1.05,
    shieldAll: false,
    energyPenalty: 1,
    twoPhaseBoss: false,
    rewardCredits: 180,
    rewardData: 6,
  },
  {
    id: 5,
    name: "Titan's Hollow",
    modifierName: 'Ancient Fury',
    modifierDesc: 'The Hollow Colossus awakens a second, enraged form.',
    hpMul: 2.32,
    speedMul: 1.1,
    shieldAll: false,
    energyPenalty: 0,
    twoPhaseBoss: true,
    rewardCredits: 240,
    rewardData: 8,
  },
];

export interface WaveSpec {
  wave: number;
  entries: { type: EnemyTypeId; count: number; interval: number }[];
}

export const WAVES: WaveSpec[] = [
  { wave: 1, entries: [{ type: 'riftling', count: 5, interval: 1.6 }] },
  { wave: 2, entries: [{ type: 'riftling', count: 5, interval: 1.4 }, { type: 'runner', count: 2, interval: 2.2 }] },
  { wave: 3, entries: [{ type: 'riftling', count: 5, interval: 1.2 }, { type: 'runner', count: 3, interval: 1.8 }] },
  { wave: 4, entries: [{ type: 'riftling', count: 4, interval: 1.2 }, { type: 'prism', count: 3, interval: 2.0 }] },
  { wave: 5, entries: [{ type: 'brute', count: 1, interval: 1 }, { type: 'riftling', count: 5, interval: 1.4 }] },
  { wave: 6, entries: [{ type: 'swarm', count: 3, interval: 2.0 }, { type: 'runner', count: 4, interval: 1.4 }] },
  { wave: 7, entries: [{ type: 'prism', count: 4, interval: 1.8 }, { type: 'riftling', count: 5, interval: 1.1 }] },
  { wave: 8, entries: [{ type: 'brute', count: 2, interval: 4 }, { type: 'swarm', count: 3, interval: 1.8 }] },
  { wave: 9, entries: [{ type: 'runner', count: 6, interval: 1.0 }, { type: 'prism', count: 3, interval: 1.8 }, { type: 'riftling', count: 4, interval: 1.2 }] },
  { wave: 10, entries: [{ type: 'colossus', count: 1, interval: 1 }, { type: 'riftling', count: 4, interval: 3.5 }] },
];
