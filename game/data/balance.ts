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
  portalY: 0.035,
  portalXs: [0.5, 0.52, 0.54],
  coreX: 0.52,
  coreY: 1.43,
  gridX0: 0,
  gridDX: 0.18,
  gridY0: 0,
  gridDY: 0,
  pathPoints: [
    { x: 0.52, y: 0.035 },
    { x: 0.32, y: 0.16 },
    { x: 0.22, y: 0.34 },
    { x: 0.72, y: 0.51 },
    { x: 0.78, y: 0.72 },
    { x: 0.3, y: 0.88 },
    { x: 0.24, y: 1.08 },
    { x: 0.7, y: 1.22 },
    { x: 0.52, y: 1.43 },
  ],
  buildPads: [
    { x: 0.13, y: 0.11 },
    { x: 0.81, y: 0.12 },
    { x: 0.56, y: 0.25 },
    { x: 0.88, y: 0.34 },
    { x: 0.1, y: 0.49 },
    { x: 0.4, y: 0.55 },
    { x: 0.91, y: 0.59 },
    { x: 0.11, y: 0.69 },
    { x: 0.48, y: 0.72 },
    { x: 0.9, y: 0.83 },
    { x: 0.09, y: 0.92 },
    { x: 0.56, y: 0.96 },
    { x: 0.87, y: 1.06 },
    { x: 0.11, y: 1.14 },
    { x: 0.43, y: 1.2 },
    { x: 0.86, y: 1.28 },
  ],
};

export function cellCenter(cell: number): { x: number; y: number } {
  return FIELD.buildPads[cell] ?? FIELD.buildPads[0];
}

export function lanePos(lane: number, t: number): { x: number; y: number } {
  const clamped = Math.max(0, Math.min(1, t));
  const points = FIELD.pathPoints;
  const lengths: number[] = [];
  let total = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const len = Math.hypot(points[i + 1].x - points[i].x, points[i + 1].y - points[i].y);
    lengths.push(len);
    total += len;
  }

  let distance = clamped * total;
  let segment = 0;
  while (segment < lengths.length - 1 && distance > lengths[segment]) {
    distance -= lengths[segment];
    segment++;
  }

  const a = points[segment];
  const b = points[segment + 1];
  const segT = lengths[segment] > 0 ? distance / lengths[segment] : 0;
  const baseX = a.x + (b.x - a.x) * segT;
  const baseY = a.y + (b.y - a.y) * segT;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const mag = Math.hypot(dx, dy) || 1;
  const laneOffset = (lane - 1) * 0.018;

  return {
    x: baseX + (-dy / mag) * laneOffset,
    y: baseY + (dx / mag) * laneOffset,
  };
}
