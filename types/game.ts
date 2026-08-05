export type GuardianTypeId = 'arc' | 'nova' | 'cryo' | 'engi';

export type EnemyTypeId =
  | 'riftling'
  | 'runner'
  | 'brute'
  | 'prism'
  | 'swarm'
  | 'shardling'
  | 'colossus';

export type BattlePhase =
  | 'loading'
  | 'tutorial'
  | 'playing'
  | 'upgrade'
  | 'paused'
  | 'victory'
  | 'defeat';

export type Rarity = 'common' | 'rare' | 'epic';

export interface GuardianDef {
  id: GuardianTypeId;
  name: string;
  role: string;
  color: string;
  glow: string;
  shape: 'chevron' | 'dome' | 'spiral' | 'gear';
  desc: string;
  passive: string;
  ultName: string;
  ultDesc: string;
  baseDamage: number;
  attackInterval: number;
  range: number;
  projectileSpeed: number;
  ultInterval: number;
  tags: string[];
}

export interface EnemyDef {
  id: EnemyTypeId;
  name: string;
  hp: number;
  speed: number;
  coreDamage: number;
  energy: number;
  size: number;
  color: string;
  shape: 'blob' | 'dart' | 'block' | 'crystal' | 'cluster' | 'boss';
  shieldRatio: number;
  splitsInto?: { type: EnemyTypeId; count: number };
  isBoss?: boolean;
  isElite?: boolean;
  enhanceFill: number;
}

export interface StageDef {
  id: number;
  name: string;
  modifierName: string;
  modifierDesc: string;
  hpMul: number;
  speedMul: number;
  shieldAll: boolean;
  energyPenalty: number;
  twoPhaseBoss: boolean;
  rewardCredits: number;
  rewardData: number;
}

export interface Mods {
  atkSpeed: Record<GuardianTypeId, number>;
  dmg: Record<GuardianTypeId, number>;
  novaRadius: number;
  cryoFreezeChance: number;
  cryoSlowBonus: number;
  droneDurationMul: number;
  engiAuraBonus: number;
  crit: number;
  coreDR: number;
  energyKillBonus: number;
  costEveryN: number;
  bossDmgMul: number;
  chainChance: number;
  explodeOnDeath: number;
  shieldOnRank4: boolean;
  stabilityPerMergeBonus: number;
  rank2Chance: number;
  coreRepairWave: number;
}

export interface UpgradeDef {
  id: string;
  name: string;
  desc: string;
  rarity: Rarity;
  icon: string;
  apply: (m: Mods) => void;
}

export interface Unit {
  id: number;
  type: GuardianTypeId;
  rank: number;
  cell: number;
  cd: number;
  ultCd: number;
  ultActiveUntil: number;
}

export interface Drone {
  id: number;
  x: number;
  y: number;
  life: number;
  cd: number;
  dmg: number;
  enhanced: boolean;
}

export interface Enemy {
  id: number;
  type: EnemyTypeId;
  hp: number;
  maxHp: number;
  shield: number;
  maxShield: number;
  t: number;
  lane: number;
  speed: number;
  slowUntil: number;
  slowPct: number;
  hitStacks: number;
  frozenUntil: number;
  priority: boolean;
  coreCd: number;
  atCore: boolean;
  enraged: boolean;
  x: number;
  y: number;
  telegraphUntil: number;
}

export interface Projectile {
  id: number;
  x: number;
  y: number;
  targetId: number;
  speed: number;
  dmg: number;
  from: GuardianTypeId | 'drone';
  radius: number;
  chainsLeft: number;
  crit: boolean;
  slows: boolean;
}

export interface Fx {
  id: number;
  kind: 'text' | 'ring' | 'flash' | 'portal' | 'shock' | 'telegraph' | 'orbital';
  x: number;
  y: number;
  text?: string;
  color: string;
  age: number;
  dur: number;
  size: number;
}

export interface SpawnEvent {
  time: number;
  type: EnemyTypeId;
  lane: number;
  hpMul: number;
  wave: number;
}

export interface BattleResult {
  won: boolean;
  stars: number;
  timeUsed: number;
  coreLeft: number;
  credits: number;
  data: number;
  firstClear: boolean;
}

export interface TakenUpgrade {
  id: string;
  name: string;
  rarity: Rarity;
}
