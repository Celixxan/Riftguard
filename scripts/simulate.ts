// Headless balance harness: plays stages with a bot and reports metrics.
// Run: npx tsx scripts/simulate.ts [stageId|all] [runs] [bot]
//   stageId: 1-5 or "all" (default all)
//   runs: seeded runs per stage (default 500)
//   bot: "smart" | "naive" | "both" (default smart)
import {
  createBattle,
  update,
  trySummon,
  tryMerge,
  canMerge,
  chooseUpgrade,
  BattleState,
} from '../game/sim/battle';
type BotKind = 'smart' | 'naive';

// offense-first: losses are almost always timeouts, so damage wins battles
const UPGRADE_PRIORITY = [
  'boss_dmg', 'chain', 'arc_dmg', 'nova_dmg', 'arc_speed', 'crit', 'explode',
  'rank2_summon', 'nova_radius', 'engi_aura', 'energy_kill', 'cost_scale',
  'cryo_freeze', 'cryo_slow', 'engi_drone', 'stability', 'wave_repair',
  'core_dr', 'rank4_shield',
];

const DMG_TYPE: Record<string, number> = { arc: 3, nova: 2, engi: 1, cryo: 0 };

function findMerge(b: BattleState, smart: boolean): [number, number] | null {
  let best: [number, number] | null = null;
  let bestScore = -1;
  for (let i = 0; i < 16; i++) {
    for (let j = 0; j < 16; j++) {
      if (i === j || !canMerge(b, i, j)) continue;
      if (!smart) return [i, j];
      const u = b.grid[i]!;
      // prefer merging damage dealers, then higher ranks
      const score = DMG_TYPE[u.type] * 100 + u.rank * 10;
      if (score > bestScore) {
        bestScore = score;
        best = [i, j];
      }
    }
  }
  return best;
}

function botStep(b: BattleState, kind: BotKind) {
  if (b.phase === 'upgrade' && b.offer) {
    if (kind === 'smart') {
      const sorted = [...b.offer].sort(
        (a, c) => UPGRADE_PRIORITY.indexOf(a.id) - UPGRADE_PRIORITY.indexOf(c.id),
      );
      chooseUpgrade(b, sorted[0].id);
    } else {
      chooseUpgrade(b, b.offer[Math.floor(b.rng() * b.offer.length)].id);
    }
    return;
  }
  trySummon(b);
  const m = findMerge(b, kind === 'smart');
  if (m) {
    // stabilize only merges that lock in a damage type
    if (kind === 'smart') b.stabOn = b.stabCharges > 0 && DMG_TYPE[b.grid[m[0]]!.type] >= 2;
    tryMerge(b, m[0], m[1]);
  }
}

interface StageResult {
  stage: number;
  bot: BotKind;
  runs: number;
  winRate: number;
  avgDuration: number;
  avgSummons: number;
  avgMerges: number;
  avgEnhance: number;
  avgCoreLeft: number;
}

function runStage(stageId: number, runs: number, kind: BotKind): StageResult {
  let wins = 0;
  let dur = 0;
  let summons = 0;
  let merges = 0;
  let enhance = 0;
  let coreLeft = 0;
  for (let r = 0; r < runs; r++) {
    const b = createBattle({
      stageId,
      seed: 1000 + r * 7919,
      loadout: ['arc', 'nova', 'cryo', 'engi'],
      levels: { arc: 1, nova: 1, cryo: 1, engi: 1 },
      coreBonusHp: 0,
      coreBonusEnergy: 0,
      stabilityRateMul: 1,
      freeSummons: 0,
      tutorial: false,
    });
    const dt = 1 / 30;
    let guard = 0;
    while (b.phase !== 'victory' && b.phase !== 'defeat' && guard < 30 * 400) {
      update(b, dt);
      if (guard % 15 === 0) botStep(b, kind);
      guard++;
    }
    if (b.result?.won) wins++;
    dur += b.result?.timeUsed ?? b.time;
    summons += b.summons + b.opts.freeSummons;
    merges += b.mergeCount;
    enhance += b.enhanceLevel;
    coreLeft += b.result?.coreLeft ?? Math.max(0, (b.coreHp / b.coreMax) * 100);
  }
  return {
    stage: stageId,
    bot: kind,
    runs,
    winRate: (wins / runs) * 100,
    avgDuration: dur / runs,
    avgSummons: summons / runs,
    avgMerges: merges / runs,
    avgEnhance: enhance / runs,
    avgCoreLeft: coreLeft / runs,
  };
}

const stageArg = process.argv[2] ?? 'all';
const runs = Number(process.argv[3] ?? 500);
const botArg = (process.argv[4] ?? 'smart') as BotKind | 'both';

const stages = stageArg === 'all' ? [1, 2, 3, 4, 5] : [Number(stageArg)];
const bots: BotKind[] = botArg === 'both' ? ['smart', 'naive'] : [botArg];

console.log('stage | bot   | win%  | dur(s) | summons | merges | enhance | core%');
for (const s of stages) {
  for (const kind of bots) {
    const r = runStage(s, runs, kind);
    console.log(
      `${String(r.stage).padEnd(5)} | ${r.bot.padEnd(5)} | ${r.winRate.toFixed(1).padStart(5)} | ${r.avgDuration.toFixed(0).padStart(6)} | ${r.avgSummons.toFixed(1).padStart(7)} | ${r.avgMerges.toFixed(1).padStart(6)} | ${r.avgEnhance.toFixed(1).padStart(7)} | ${r.avgCoreLeft.toFixed(0).padStart(5)}`,
    );
  }
}
