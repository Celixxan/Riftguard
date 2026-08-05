import { EnemyTypeId, StageDef } from '@/types/game';

export const STAGES: StageDef[] = [
  {
    id: 1,
    name: 'Fractured Gate',
    modifierName: 'Basic Invasion',
    modifierDesc: 'A standard incursion. Learn the rhythm of summon and merge.',
    hpMul: 1.24,
    speedMul: 1,
    shieldAll: false,
    energyPenalty: 0,
    twoPhaseBoss: false,
    rewardCredits: 90,
    rewardData: 3,
  },
  {
    id: 2,
    name: 'Velocity Rift',
    modifierName: 'Phase Surge',
    modifierDesc: 'All enemies move 25% faster. Control is king.',
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
    name: 'Prism Fields',
    modifierName: 'Hardlight Veil',
    modifierDesc: 'Every enemy spawns with an energy shield.',
    hpMul: 1.5,
    speedMul: 1,
    shieldAll: true,
    energyPenalty: 0,
    twoPhaseBoss: false,
    rewardCredits: 150,
    rewardData: 5,
  },
  {
    id: 4,
    name: 'Starved Expanse',
    modifierName: 'Energy Drought',
    modifierDesc: 'Kills grant 1 less energy and you start with 10 less.',
    hpMul: 1.8,
    speedMul: 1.05,
    shieldAll: false,
    energyPenalty: 1,
    twoPhaseBoss: false,
    rewardCredits: 180,
    rewardData: 6,
  },
  {
    id: 5,
    name: 'Colossus Throne',
    modifierName: 'Twin Phase',
    modifierDesc: 'The Rift Colossus fights in two enraged phases.',
    hpMul: 2.2,
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
