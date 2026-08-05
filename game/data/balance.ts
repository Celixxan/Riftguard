export const BALANCE = {
  battleDuration: 180,
  tickRate: 30,
  coreBaseHp: 100,
  startEnergy: 50,
  summonBaseCost: 10,
  summonCostStep: 2,
  summonCostEvery: 3,
  summonCostMax: 30,
  maxRank: 5,
  gridCols: 4,
  gridRows: 4,
  stabilityPerMerge: 25,
  stabilityMaxCharges: 2,
  enhancePerKill: 7,
  enhanceMax: 100,
  critMultiplier: 2,
  rankDamageMul: [1, 2.2, 4.8, 10.5, 23],
  rankIntervalMul: [1, 0.95, 0.9, 0.85, 0.78],
  rankRangeBonus: [0, 0.03, 0.06, 0.09, 0.12],
  levelDamageBonus: 0.04,
  freezeStacksNeeded: 4,
  freezeDuration: 1.0,
  cryoSlowPct: 0.3,
  cryoSlowDuration: 2.0,
  engiAuraPct: 0.2,
  engiDroneLife: 8,
  engiDroneInterval: 6,
  engiDroneDamage: 4,
  bossCoreHitInterval: 1.5,
  bossCoreHitDamage: 12,
  starThresholds: { three: 0.7, two: 0.35 },
  replayRewardRatio: 0.4,
  waveStartTimes: [0, 15, 30, 45, 62, 78, 95, 112, 130, 148],
  coreUpgrades: {
    hp: { max: 3, perLevel: 12, costs: [80, 160, 280] },
    energy: { max: 3, perLevel: 10, costs: [80, 160, 280] },
    stability: { max: 2, perLevel: 0.15, costs: [120, 240] },
    freeSummon: { max: 1, perLevel: 1, costs: [200] },
  },
  guardianLevelCosts: [0, 40, 70, 110, 160, 220, 290, 370, 460, 560],
};

export const FIELD = {
  width: 1,
  height: 1.5,
  portalY: 0.06,
  portalXs: [0.2, 0.5, 0.8],
  coreX: 0.5,
  coreY: 1.4,
  gridX0: 0.2,
  gridDX: 0.2,
  gridY0: 0.62,
  gridDY: 0.185,
};

export function cellCenter(cell: number): { x: number; y: number } {
  const col = cell % BALANCE.gridCols;
  const row = Math.floor(cell / BALANCE.gridCols);
  return { x: FIELD.gridX0 + col * FIELD.gridDX, y: FIELD.gridY0 + row * FIELD.gridDY };
}

export function lanePos(lane: number, t: number): { x: number; y: number } {
  const px = FIELD.portalXs[lane];
  return {
    x: px + (FIELD.coreX - px) * t,
    y: FIELD.portalY + (FIELD.coreY - FIELD.portalY) * t,
  };
}
