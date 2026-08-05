import {
  BattlePhase,
  Drone,
  Enemy,
  EnemyTypeId,
  Fx,
  GuardianTypeId,
  Mods,
  Projectile,
  SpawnEvent,
  StageDef,
  TakenUpgrade,
  Unit,
  UpgradeDef,
} from '@/types/game';
import { createRng, Rng } from '@/game/rng';
import { BALANCE, cellCenter, FIELD, lanePos } from '@/game/data/balance';
import { GUARDIANS } from '@/game/data/guardians';
import { ENEMIES } from '@/game/data/enemies';
import { STAGES, WAVES } from '@/game/data/stages';
import { createMods, RARITY_WEIGHT, UPGRADES } from '@/game/data/upgrades';

export interface BattleOptions {
  stageId: number;
  seed: number;
  loadout: GuardianTypeId[];
  levels: Record<GuardianTypeId, number>;
  coreBonusHp: number;
  coreBonusEnergy: number;
  stabilityRateMul: number;
  freeSummons: number;
  tutorial: boolean;
}

export interface BattleState {
  opts: BattleOptions;
  stage: StageDef;
  rng: Rng;
  mods: Mods;
  phase: BattlePhase;
  prevPhase: BattlePhase;
  time: number;
  wave: number;
  spawnQueue: SpawnEvent[];
  spawnIndex: number;
  coreHp: number;
  coreMax: number;
  coreShield: number;
  energy: number;
  summons: number;
  freeSummons: number;
  enhance: number;
  enhanceLevel: number;
  rerollUsed: boolean;
  offer: UpgradeDef[] | null;
  taken: TakenUpgrade[];
  stability: number;
  stabCharges: number;
  stabOn: boolean;
  grid: (Unit | null)[];
  enemies: Enemy[];
  projectiles: Projectile[];
  drones: Drone[];
  fx: Fx[];
  nextId: number;
  kills: number;
  mergeCount: number;
  shake: number;
  bossSpawned: boolean;
  slowmoUntil: number;
  bossBlastAt: number;
  tutorialStep: number;
  lastEvent: string;
  result: { won: boolean; stars: number; timeUsed: number; coreLeft: number } | null;
}

function buildSpawnQueue(stage: StageDef, rng: Rng, tutorialDelay: number): SpawnEvent[] {
  const queue: SpawnEvent[] = [];
  for (let i = 0; i < WAVES.length; i++) {
    const spec = WAVES[i];
    const start = BALANCE.waveStartTimes[i] + tutorialDelay;
    const waveHpMul = (1 + 0.15 * i) * stage.hpMul;
    for (const entry of spec.entries) {
      let t = start + rng() * 0.8;
      for (let c = 0; c < entry.count; c++) {
        queue.push({
          time: t,
          type: entry.type,
          lane: Math.floor(rng() * 3),
          hpMul: entry.type === 'colossus' ? stage.hpMul * (stage.twoPhaseBoss ? 1.35 : 1) : waveHpMul,
          wave: spec.wave,
        });
        t += entry.interval;
      }
    }
  }
  queue.sort((a, b) => a.time - b.time);
  return queue;
}

export function createBattle(opts: BattleOptions): BattleState {
  const stage = STAGES.find(s => s.id === opts.stageId) ?? STAGES[0];
  const rng = createRng(opts.seed);
  const tutorialDelay = opts.tutorial ? 20 : 0;
  const coreMax = BALANCE.coreBaseHp + opts.coreBonusHp;
  return {
    opts,
    stage,
    rng,
    mods: createMods(),
    phase: opts.tutorial ? 'tutorial' : 'playing',
    prevPhase: 'playing',
    time: 0,
    wave: 0,
    spawnQueue: buildSpawnQueue(stage, rng, tutorialDelay),
    spawnIndex: 0,
    coreHp: coreMax,
    coreMax,
    coreShield: 0,
    energy: BALANCE.startEnergy + opts.coreBonusEnergy - (stage.energyPenalty > 0 ? 10 : 0),
    summons: 0,
    freeSummons: opts.freeSummons,
    enhance: 0,
    enhanceLevel: 0,
    rerollUsed: false,
    offer: null,
    taken: [],
    stability: 0,
    stabCharges: 0,
    stabOn: false,
    grid: new Array(16).fill(null),
    enemies: [],
    projectiles: [],
    drones: [],
    fx: [],
    nextId: 1,
    kills: 0,
    mergeCount: 0,
    shake: 0,
    bossSpawned: false,
    slowmoUntil: 0,
    bossBlastAt: 0,
    tutorialStep: opts.tutorial ? 1 : 0,
    lastEvent: '',
    result: null,
  };
}

export function enhanceRequired(b: BattleState): number {
  return BALANCE.enhanceMax * (1 + 0.35 * b.enhanceLevel);
}

export function summonCost(b: BattleState): number {
  if (b.tutorialStep > 0) return BALANCE.summonBaseCost;
  const every = b.mods.costEveryN || BALANCE.summonCostEvery;
  const cost =
    BALANCE.summonBaseCost + BALANCE.summonCostStep * Math.floor(b.summons / every);
  return Math.min(cost, BALANCE.summonCostMax);
}

export function emptyCells(b: BattleState): number[] {
  const out: number[] = [];
  for (let i = 0; i < 16; i++) if (!b.grid[i]) out.push(i);
  return out;
}

function addFx(b: BattleState, fx: Omit<Fx, 'id' | 'age'>) {
  if (b.fx.length > 60) b.fx.shift();
  b.fx.push({ ...fx, id: b.nextId++, age: 0 });
}

function damageText(b: BattleState, x: number, y: number, text: string, color: string) {
  addFx(b, { kind: 'text', x, y, text, color, dur: 0.7, size: 1 });
}

export function trySummon(b: BattleState): boolean {
  const cells = emptyCells(b);
  const cost = b.freeSummons > 0 ? 0 : summonCost(b);
  if (cells.length === 0 || b.energy < cost) return false;
  if (b.freeSummons > 0) {
    b.freeSummons--;
  } else {
    b.energy -= cost;
    b.summons++;
  }
  const type = b.opts.loadout[Math.floor(b.rng() * b.opts.loadout.length)];
  const cell = cells[Math.floor(b.rng() * cells.length)];
  const rank = b.rng() < b.mods.rank2Chance ? 2 : 1;
  b.grid[cell] = {
    id: b.nextId++,
    type,
    rank,
    cell,
    cd: 0.4,
    ultCd: GUARDIANS[type].ultInterval,
    ultActiveUntil: 0,
  };
  const p = cellCenter(cell);
  addFx(b, { kind: 'portal', x: p.x, y: p.y, color: GUARDIANS[type].color, dur: 0.5, size: 1 });
  b.lastEvent = 'summon';
  return true;
}

export function canMerge(b: BattleState, fromCell: number, toCell: number): boolean {
  const a = b.grid[fromCell];
  const c = b.grid[toCell];
  return !!(
    a &&
    c &&
    fromCell !== toCell &&
    a.type === c.type &&
    a.rank === c.rank &&
    a.rank < BALANCE.maxRank
  );
}

export function validMergeTargets(b: BattleState, fromCell: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < 16; i++) if (canMerge(b, fromCell, i)) out.push(i);
  return out;
}

export function tryMerge(b: BattleState, fromCell: number, toCell: number): boolean {
  if (!canMerge(b, fromCell, toCell)) return false;
  const dest = b.grid[toCell]!;
  const newRank = dest.rank + 1;
  let type: GuardianTypeId;
  if (b.stabOn && b.stabCharges > 0) {
    b.stabCharges--;
    type = dest.type;
    if (b.stabCharges === 0) b.stabOn = false;
  } else {
    type = b.opts.loadout[Math.floor(b.rng() * b.opts.loadout.length)];
  }
  b.grid[fromCell] = null;
  b.grid[toCell] = {
    id: b.nextId++,
    type,
    rank: newRank,
    cell: toCell,
    cd: 0.3,
    ultCd: GUARDIANS[type].ultInterval * 0.7,
    ultActiveUntil: 0,
  };
  b.mergeCount++;
  const gain =
    (BALANCE.stabilityPerMerge + b.mods.stabilityPerMergeBonus) * b.opts.stabilityRateMul;
  b.stability += gain;
  while (b.stability >= 100 && b.stabCharges < BALANCE.stabilityMaxCharges) {
    b.stability -= 100;
    b.stabCharges++;
  }
  if (b.stabCharges >= BALANCE.stabilityMaxCharges) b.stability = Math.min(b.stability, 99);
  if (newRank >= 4 && b.mods.shieldOnRank4) {
    b.coreShield = Math.min(b.coreShield + 25, 50);
    addFx(b, { kind: 'ring', x: FIELD.coreX, y: FIELD.coreY, color: '#38bdf8', dur: 0.6, size: 1.4 });
  }
  const p = cellCenter(toCell);
  addFx(b, { kind: 'shock', x: p.x, y: p.y, color: GUARDIANS[type].color, dur: 0.55, size: 0.8 + newRank * 0.25 });
  b.shake = Math.max(b.shake, 0.25 + newRank * 0.06);
  if (b.tutorialStep === 3) b.enhance = enhanceRequired(b);
  b.lastEvent = 'merge';
  return true;
}

export function setPriorityTarget(b: BattleState, enemyId: number) {
  for (const e of b.enemies) e.priority = e.id === enemyId ? !e.priority : false;
}

function weightedUpgradeOffer(b: BattleState): UpgradeDef[] {
  const pool = UPGRADES.filter(u => !b.taken.some(t => t.id === u.id));
  const offer: UpgradeDef[] = [];
  const avail = [...pool];
  while (offer.length < 3 && avail.length > 0) {
    const total = avail.reduce((s, u) => s + RARITY_WEIGHT[u.rarity], 0);
    let r = b.rng() * total;
    let idx = 0;
    for (let i = 0; i < avail.length; i++) {
      r -= RARITY_WEIGHT[avail[i].rarity];
      if (r <= 0) {
        idx = i;
        break;
      }
    }
    offer.push(avail[idx]);
    avail.splice(idx, 1);
  }
  return offer;
}

export function chooseUpgrade(b: BattleState, id: string) {
  if (!b.offer) return;
  const up = b.offer.find(u => u.id === id);
  if (!up) return;
  up.apply(b.mods);
  b.taken.push({ id: up.id, name: up.name, rarity: up.rarity });
  b.offer = null;
  b.phase = b.tutorialStep > 0 && b.tutorialStep < 6 ? 'tutorial' : 'playing';
  b.lastEvent = 'upgraded';
}

export function rerollOffer(b: BattleState): boolean {
  if (!b.offer || b.rerollUsed) return false;
  b.rerollUsed = true;
  b.offer = weightedUpgradeOffer(b);
  return true;
}

export function togglePause(b: BattleState) {
  if (b.phase === 'paused') {
    b.phase = b.prevPhase;
  } else if (b.phase === 'playing' || b.phase === 'tutorial') {
    b.prevPhase = b.phase;
    b.phase = 'paused';
  }
}

export function advanceTutorial(b: BattleState) {
  if (b.tutorialStep > 0) {
    b.tutorialStep++;
    if (b.tutorialStep >= 6) {
      b.tutorialStep = 0;
      if (b.phase === 'tutorial') b.phase = 'playing';
    }
  }
}

function spawnEnemy(b: BattleState, type: EnemyTypeId, lane: number, hpMul: number, t = 0) {
  const def = ENEMIES[type];
  const hp = Math.round(def.hp * hpMul);
  const shieldRatio = b.stage.shieldAll && !def.isBoss ? Math.max(def.shieldRatio, 0.3) : def.shieldRatio;
  const shield = Math.round(hp * shieldRatio);
  const pos = lanePos(lane, t);
  b.enemies.push({
    id: b.nextId++,
    type,
    hp,
    maxHp: hp,
    shield,
    maxShield: shield,
    t,
    lane,
    speed: def.speed * b.stage.speedMul,
    slowUntil: 0,
    slowPct: 0,
    hitStacks: 0,
    frozenUntil: 0,
    priority: false,
    coreCd: 0,
    atCore: false,
    enraged: false,
    x: pos.x,
    y: pos.y,
    telegraphUntil: 0,
  });
  if (def.isBoss) {
    b.bossSpawned = true;
    b.shake = Math.max(b.shake, 0.6);
    addFx(b, { kind: 'ring', x: pos.x, y: pos.y, color: def.color, dur: 1.2, size: 2.2 });
    b.lastEvent = 'boss';
  } else {
    addFx(b, { kind: 'portal', x: pos.x, y: pos.y, color: def.color, dur: 0.4, size: 0.7 });
  }
}

function findTarget(b: BattleState, x: number, y: number, range: number): Enemy | null {
  let best: Enemy | null = null;
  let bestScore = -1;
  for (const e of b.enemies) {
    if (e.hp <= 0) continue;
    const dx = e.x - x;
    const dy = e.y - y;
    if (dx * dx + dy * dy > range * range) continue;
    const score = (e.priority ? 10 : 0) + e.t;
    if (score > bestScore) {
      bestScore = score;
      best = e;
    }
  }
  return best;
}

function fireProjectile(
  b: BattleState,
  from: GuardianTypeId | 'drone',
  x: number,
  y: number,
  target: Enemy,
  dmg: number,
  opts?: { radius?: number; chainsLeft?: number; slows?: boolean }
) {
  const crit = b.rng() < b.mods.crit;
  if (b.projectiles.length > 80) b.projectiles.shift();
  b.projectiles.push({
    id: b.nextId++,
    x,
    y,
    targetId: target.id,
    speed: from === 'drone' ? 1.4 : GUARDIANS[from as GuardianTypeId]?.projectileSpeed ?? 1.2,
    dmg: crit ? dmg * BALANCE.critMultiplier : dmg,
    from,
    radius: opts?.radius ?? 0,
    chainsLeft: opts?.chainsLeft ?? 0,
    crit,
    slows: opts?.slows ?? false,
  });
}

function unitDamage(b: BattleState, u: Unit): number {
  const def = GUARDIANS[u.type];
  const level = b.opts.levels[u.type] ?? 1;
  return (
    def.baseDamage *
    BALANCE.rankDamageMul[u.rank - 1] *
    b.mods.dmg[u.type] *
    (1 + BALANCE.levelDamageBonus * (level - 1))
  );
}

function engiAuraMul(b: BattleState, cell: number): number {
  let mul = 1;
  const col = cell % 4;
  const row = Math.floor(cell / 4);
  for (let i = 0; i < 16; i++) {
    const u = b.grid[i];
    if (!u || u.type !== 'engi' || i === cell) continue;
    const dc = Math.abs((i % 4) - col);
    const dr = Math.abs(Math.floor(i / 4) - row);
    if (dc <= 1 && dr <= 1) {
      mul *= 1 + (BALANCE.engiAuraPct + b.mods.engiAuraBonus) * (1 + 0.15 * (u.rank - 1));
    }
  }
  return mul;
}

function applyHit(b: BattleState, e: Enemy, p: Projectile) {
  const def = ENEMIES[e.type];
  let dmg = p.dmg;
  if (def.isBoss || def.isElite) dmg *= b.mods.bossDmgMul;
  dealDamage(b, e, dmg, p.crit);
  if (p.from === 'cryo' || p.slows) {
    e.slowPct = Math.min(0.6, BALANCE.cryoSlowPct + b.mods.cryoSlowBonus);
    e.slowUntil = b.time + BALANCE.cryoSlowDuration;
    e.hitStacks++;
    const freezeRoll = b.rng() < b.mods.cryoFreezeChance;
    if ((e.hitStacks >= BALANCE.freezeStacksNeeded || freezeRoll) && !def.isBoss) {
      e.frozenUntil = b.time + BALANCE.freezeDuration;
      e.hitStacks = 0;
      addFx(b, { kind: 'flash', x: e.x, y: e.y, color: '#bfdbfe', dur: 0.3, size: def.size * 2.4 });
    }
  }
  if (p.radius > 0) {
    addFx(b, { kind: 'ring', x: e.x, y: e.y, color: '#fb923c', dur: 0.4, size: p.radius * 2 });
    for (const other of b.enemies) {
      if (other.id === e.id || other.hp <= 0) continue;
      const dx = other.x - e.x;
      const dy = other.y - e.y;
      if (dx * dx + dy * dy <= p.radius * p.radius) {
        dealDamage(b, other, dmg * 0.6, false);
      }
    }
  }
  if (p.chainsLeft > 0 || b.rng() < b.mods.chainChance) {
    const next = b.enemies.find(o => o.id !== e.id && o.hp > 0 && Math.hypot(o.x - e.x, o.y - e.y) < 0.3);
    if (next) {
      fireProjectile(b, p.from, e.x, e.y, next, p.dmg * 0.6, { chainsLeft: Math.max(0, p.chainsLeft - 1) });
    }
  }
}

function dealDamage(b: BattleState, e: Enemy, dmg: number, crit: boolean) {
  let remaining = dmg;
  if (e.shield > 0) {
    const absorbed = Math.min(e.shield, remaining);
    e.shield -= absorbed;
    remaining -= absorbed;
    if (e.shield <= 0) {
      addFx(b, { kind: 'flash', x: e.x, y: e.y, color: '#7dd3fc', dur: 0.25, size: ENEMIES[e.type].size * 2.6 });
    }
  }
  if (remaining > 0) e.hp -= remaining;
  damageText(b, e.x, e.y - 0.03, `${Math.round(dmg)}`, crit ? '#fde047' : '#f1f5f9');
  if (crit) addFx(b, { kind: 'flash', x: e.x, y: e.y, color: '#fde047', dur: 0.2, size: ENEMIES[e.type].size * 2 });
  if (e.hp <= 0) onDeath(b, e);
}

function onDeath(b: BattleState, e: Enemy) {
  const def = ENEMIES[e.type];
  b.kills++;
  const energy = Math.max(
    def.energy > 0 ? 1 : 0,
    def.energy + b.mods.energyKillBonus - b.stage.energyPenalty
  );
  b.energy += energy;
  if (energy > 0) damageText(b, e.x, e.y - 0.06, `+${energy}`, '#4ade80');
  if (b.phase !== 'victory') {
    b.enhance = Math.min(enhanceRequired(b), b.enhance + def.enhanceFill);
  }
  addFx(b, { kind: 'ring', x: e.x, y: e.y, color: def.color, dur: 0.45, size: def.size * 3.2 });
  if (b.mods.explodeOnDeath > 0) {
    for (const other of b.enemies) {
      if (other.id === e.id || other.hp <= 0) continue;
      if (Math.hypot(other.x - e.x, other.y - e.y) < 0.14) {
        other.hp -= b.mods.explodeOnDeath;
        if (other.hp <= 0) onDeath(b, other);
      }
    }
  }
  if (def.splitsInto) {
    for (let i = 0; i < def.splitsInto.count; i++) {
      spawnEnemy(b, def.splitsInto.type, e.lane, b.stage.hpMul * (1 + 0.15 * (b.wave - 1)), Math.max(0, e.t - 0.02 - i * 0.02));
    }
  }
  if (def.isBoss) {
    b.slowmoUntil = b.time + 1.4;
    b.shake = 1;
    addFx(b, { kind: 'shock', x: e.x, y: e.y, color: '#f43f5e', dur: 1.2, size: 3 });
  }
}

function castUltimate(b: BattleState, u: Unit) {
  const p = cellCenter(u.cell);
  const dmg = unitDamage(b, u);
  addFx(b, { kind: 'ring', x: p.x, y: p.y, color: GUARDIANS[u.type].glow, dur: 0.6, size: 1.6 });
  if (u.type === 'arc') {
    u.ultActiveUntil = b.time + 3;
  } else if (u.type === 'nova') {
    let bx = FIELD.coreX;
    let by = 0.5;
    let bestCount = -1;
    for (const e of b.enemies) {
      if (e.hp <= 0) continue;
      let count = 0;
      for (const o of b.enemies) {
        if (o.hp > 0 && Math.hypot(o.x - e.x, o.y - e.y) < 0.22) count++;
      }
      if (count > bestCount) {
        bestCount = count;
        bx = e.x;
        by = e.y;
      }
    }
    if (bestCount >= 0) {
      addFx(b, { kind: 'orbital', x: bx, y: by, color: '#fb923c', dur: 1.5, size: 0.5 });
      const strikeX = bx;
      const strikeY = by;
      const strikeDmg = dmg * 3;
      pendingStrikes(b).push({ time: b.time + 1.5, x: strikeX, y: strikeY, dmg: strikeDmg, radius: 0.24 });
    }
  } else if (u.type === 'cryo') {
    for (const e of b.enemies) {
      if (e.hp > 0 && !ENEMIES[e.type].isBoss) {
        e.frozenUntil = b.time + 1.6;
        addFx(b, { kind: 'flash', x: e.x, y: e.y, color: '#bfdbfe', dur: 0.4, size: ENEMIES[e.type].size * 2.4 });
      }
    }
    b.shake = Math.max(b.shake, 0.2);
  } else if (u.type === 'engi') {
    const heal = Math.round(b.coreMax * 0.05);
    b.coreHp = Math.min(b.coreMax, b.coreHp + heal);
    damageText(b, FIELD.coreX, FIELD.coreY - 0.05, `+${heal}`, '#4ade80');
    for (let i = 0; i < 2; i++) {
      b.drones.push({
        id: b.nextId++,
        x: p.x + (i === 0 ? -0.06 : 0.06),
        y: p.y - 0.08,
        life: BALANCE.engiDroneLife * b.mods.droneDurationMul * 1.5,
        cd: 0.3,
        dmg: BALANCE.engiDroneDamage * 2.5 * BALANCE.rankDamageMul[u.rank - 1] * 0.5,
        enhanced: true,
      });
    }
  }
}

interface PendingStrike {
  time: number;
  x: number;
  y: number;
  dmg: number;
  radius: number;
}
const strikeMap = new WeakMap<BattleState, PendingStrike[]>();
function pendingStrikes(b: BattleState): PendingStrike[] {
  let arr = strikeMap.get(b);
  if (!arr) {
    arr = [];
    strikeMap.set(b, arr);
  }
  return arr;
}

export function update(b: BattleState, rawDt: number) {
  if (b.phase !== 'playing' && b.phase !== 'tutorial') return;
  const dt = b.time < b.slowmoUntil ? rawDt * 0.3 : rawDt;
  b.time += dt;
  b.shake = Math.max(0, b.shake - dt * 2.5);

  while (b.spawnIndex < b.spawnQueue.length && b.spawnQueue[b.spawnIndex].time <= b.time) {
    const ev = b.spawnQueue[b.spawnIndex++];
    if (ev.wave > b.wave) {
      if (b.wave > 0 && b.mods.coreRepairWave > 0) {
        b.coreHp = Math.min(b.coreMax, b.coreHp + b.mods.coreRepairWave);
        damageText(b, FIELD.coreX, FIELD.coreY - 0.05, `+${b.mods.coreRepairWave}`, '#4ade80');
      }
      b.wave = ev.wave;
      b.lastEvent = `wave${ev.wave}`;
    }
    spawnEnemy(b, ev.type, ev.lane, ev.hpMul);
  }

  for (const e of b.enemies) {
    if (e.hp <= 0) continue;
    const def = ENEMIES[e.type];
    if (def.isBoss && !e.enraged && e.hp <= e.maxHp * 0.5) {
      e.enraged = true;
      e.speed *= 1.5;
      b.shake = Math.max(b.shake, 0.7);
      addFx(b, { kind: 'shock', x: e.x, y: e.y, color: '#f43f5e', dur: 0.8, size: 2 });
      spawnEnemy(b, 'shardling', 0, b.stage.hpMul, Math.max(0, e.t - 0.05));
      spawnEnemy(b, 'shardling', 2, b.stage.hpMul, Math.max(0, e.t - 0.05));
      if (b.stage.twoPhaseBoss) e.telegraphUntil = b.time + 1.2;
    }
    if (b.stage.twoPhaseBoss && def.isBoss && e.enraged) {
      if (e.telegraphUntil > 0 && b.time >= e.telegraphUntil) {
        e.telegraphUntil = 0;
        const raw = 6;
        const dmgToCore = Math.round(raw * (1 - b.mods.coreDR));
        applyCoreDamage(b, dmgToCore, e);
        b.bossBlastAt = b.time + 8;
      } else if (e.telegraphUntil === 0 && b.bossBlastAt > 0 && b.time >= b.bossBlastAt) {
        e.telegraphUntil = b.time + 1.2;
        b.bossBlastAt = 0;
        addFx(b, { kind: 'telegraph', x: FIELD.coreX, y: FIELD.coreY, color: '#f43f5e', dur: 1.2, size: 1 });
      } else if (e.telegraphUntil === 0 && b.bossBlastAt === 0) {
        b.bossBlastAt = b.time + 8;
      }
    }
    if (b.time < e.frozenUntil) continue;
    if (e.atCore) {
      e.coreCd -= dt;
      if (e.coreCd <= 0) {
        e.coreCd = BALANCE.bossCoreHitInterval;
        applyCoreDamage(b, Math.round(BALANCE.bossCoreHitDamage * (1 - b.mods.coreDR)), e);
      }
      continue;
    }
    const slowMul = b.time < e.slowUntil ? 1 - e.slowPct : 1;
    e.t += (e.speed * slowMul * dt) / 1.36;
    const pos = lanePos(e.lane, Math.min(e.t, 1));
    e.x = pos.x;
    e.y = pos.y;
    if (e.t >= 1) {
      if (def.isBoss) {
        e.atCore = true;
        e.coreCd = 0.2;
      } else {
        applyCoreDamage(b, Math.round(def.coreDamage * (1 - b.mods.coreDR)), e);
        e.hp = 0;
      }
    }
  }
  b.enemies = b.enemies.filter(e => e.hp > 0);

  for (let i = 0; i < 16; i++) {
    const u = b.grid[i];
    if (!u) continue;
    const def = GUARDIANS[u.type];
    const p = cellCenter(i);
    const auraMul = engiAuraMul(b, i);
    const interval =
      (def.attackInterval * BALANCE.rankIntervalMul[u.rank - 1]) /
      (b.mods.atkSpeed[u.type] * auraMul);
    u.cd -= dt;
    u.ultCd -= dt;
    if (u.ultCd <= 0) {
      u.ultCd = def.ultInterval;
      castUltimate(b, u);
    }
    if (u.cd <= 0) {
      const range = def.range + BALANCE.rankRangeBonus[u.rank - 1];
      const target = findTarget(b, p.x, p.y, range);
      if (target) {
        u.cd = interval;
        const dmg = unitDamage(b, u);
        if (u.type === 'nova') {
          fireProjectile(b, 'nova', p.x, p.y, target, dmg, { radius: 0.13 * b.mods.novaRadius });
        } else if (u.type === 'cryo') {
          fireProjectile(b, 'cryo', p.x, p.y, target, dmg, { slows: true });
        } else if (u.type === 'arc') {
          const chains = b.time < u.ultActiveUntil ? 2 : 0;
          fireProjectile(b, 'arc', p.x, p.y, target, dmg, { chainsLeft: chains });
        } else {
          fireProjectile(b, 'engi', p.x, p.y, target, dmg);
          if (b.drones.length < 6 && b.rng() < 0.35) {
            b.drones.push({
              id: b.nextId++,
              x: p.x + (b.rng() - 0.5) * 0.1,
              y: p.y - 0.07,
              life: BALANCE.engiDroneLife * b.mods.droneDurationMul,
              cd: 0.4,
              dmg: BALANCE.engiDroneDamage * BALANCE.rankDamageMul[u.rank - 1] * 0.5,
              enhanced: false,
            });
          }
        }
      }
    }
  }

  for (const d of b.drones) {
    d.life -= dt;
    d.cd -= dt;
    if (d.cd <= 0) {
      const target = findTarget(b, d.x, d.y, 0.4);
      if (target) {
        d.cd = d.enhanced ? 0.6 : 0.9;
        fireProjectile(b, 'drone', d.x, d.y, target, d.dmg);
      } else {
        d.cd = 0.3;
      }
    }
  }
  b.drones = b.drones.filter(d => d.life > 0);

  const strikes = pendingStrikes(b);
  for (let i = strikes.length - 1; i >= 0; i--) {
    const s = strikes[i];
    if (b.time >= s.time) {
      strikes.splice(i, 1);
      b.shake = Math.max(b.shake, 0.5);
      addFx(b, { kind: 'shock', x: s.x, y: s.y, color: '#fb923c', dur: 0.7, size: s.radius * 6 });
      for (const e of b.enemies) {
        if (e.hp > 0 && Math.hypot(e.x - s.x, e.y - s.y) <= s.radius) {
          dealDamage(b, e, s.dmg, false);
        }
      }
      b.enemies = b.enemies.filter(e => e.hp > 0);
    }
  }

  for (let i = b.projectiles.length - 1; i >= 0; i--) {
    const p = b.projectiles[i];
    const target = b.enemies.find(e => e.id === p.targetId && e.hp > 0);
    if (!target) {
      b.projectiles.splice(i, 1);
      continue;
    }
    const dx = target.x - p.x;
    const dy = target.y - p.y;
    const dist = Math.hypot(dx, dy);
    const step = p.speed * dt;
    if (dist <= step + 0.02) {
      b.projectiles.splice(i, 1);
      applyHit(b, target, p);
    } else {
      p.x += (dx / dist) * step;
      p.y += (dy / dist) * step;
    }
  }
  b.enemies = b.enemies.filter(e => e.hp > 0);

  for (let i = b.fx.length - 1; i >= 0; i--) {
    b.fx[i].age += rawDt;
    if (b.fx[i].age >= b.fx[i].dur) b.fx.splice(i, 1);
  }

  if (b.enhance >= enhanceRequired(b) && !b.offer) {
    b.enhance = 0;
    b.enhanceLevel++;
    b.offer = weightedUpgradeOffer(b);
    b.prevPhase = b.phase;
    b.phase = 'upgrade';
    return;
  }

  if (b.coreHp <= 0) {
    b.coreHp = 0;
    finish(b, false);
    return;
  }
  const bossAlive = b.enemies.some(e => ENEMIES[e.type].isBoss);
  if (b.bossSpawned && !bossAlive && b.time >= b.slowmoUntil) {
    finish(b, true);
    return;
  }
  const tutorialDelay = b.opts.tutorial ? 20 : 0;
  if (b.time >= BALANCE.battleDuration + tutorialDelay) {
    finish(b, false);
  }
}

function applyCoreDamage(b: BattleState, dmg: number, e: Enemy) {
  let remaining = dmg;
  if (b.coreShield > 0) {
    const absorbed = Math.min(b.coreShield, remaining);
    b.coreShield -= absorbed;
    remaining -= absorbed;
  }
  b.coreHp -= remaining;
  b.shake = Math.max(b.shake, 0.35);
  addFx(b, { kind: 'flash', x: FIELD.coreX, y: FIELD.coreY, color: '#f43f5e', dur: 0.3, size: 0.3 });
  damageText(b, FIELD.coreX, FIELD.coreY - 0.06, `-${dmg}`, '#f87171');
}

function finish(b: BattleState, won: boolean) {
  const coreLeft = Math.max(0, b.coreHp) / b.coreMax;
  let stars = 1;
  if (coreLeft >= BALANCE.starThresholds.three) stars = 3;
  else if (coreLeft >= BALANCE.starThresholds.two) stars = 2;
  b.result = {
    won,
    stars: won ? stars : 0,
    timeUsed: Math.round(b.time - (b.opts.tutorial ? 20 : 0)),
    coreLeft: Math.round(coreLeft * 100),
  };
  b.phase = won ? 'victory' : 'defeat';
}
