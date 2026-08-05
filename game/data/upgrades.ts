import { Mods, UpgradeDef } from '@/types/game';

export function createMods(): Mods {
  return {
    atkSpeed: { arc: 1, nova: 1, cryo: 1, engi: 1 },
    dmg: { arc: 1, nova: 1, cryo: 1, engi: 1 },
    novaRadius: 1,
    cryoFreezeChance: 0,
    cryoSlowBonus: 0,
    droneDurationMul: 1,
    engiAuraBonus: 0,
    crit: 0,
    coreDR: 0,
    energyKillBonus: 0,
    costEveryN: 0,
    bossDmgMul: 1,
    chainChance: 0,
    explodeOnDeath: 0,
    shieldOnRank4: false,
    stabilityPerMergeBonus: 0,
    rank2Chance: 0,
    coreRepairWave: 0,
  };
}

export const UPGRADES: UpgradeDef[] = [
  { id: 'arc_speed', name: 'Overclocked Bow', desc: 'Arc Ranger attack speed +25%', rarity: 'common', icon: 'zap', apply: m => { m.atkSpeed.arc *= 1.25; } },
  { id: 'arc_dmg', name: 'Charged Arrows', desc: 'Arc Ranger damage +30%', rarity: 'common', icon: 'target', apply: m => { m.dmg.arc *= 1.3; } },
  { id: 'nova_radius', name: 'Expanding Plasma', desc: 'Nova Cannon explosion radius +30%', rarity: 'rare', icon: 'circle', apply: m => { m.novaRadius *= 1.3; } },
  { id: 'nova_dmg', name: 'Dense Payload', desc: 'Nova Cannon damage +30%', rarity: 'common', icon: 'flame', apply: m => { m.dmg.nova *= 1.3; } },
  { id: 'cryo_freeze', name: 'Deep Frost', desc: 'Cryo hits: +15% chance to instantly freeze', rarity: 'rare', icon: 'snowflake', apply: m => { m.cryoFreezeChance += 0.15; } },
  { id: 'cryo_slow', name: 'Glacial Threads', desc: 'Cryo slow is 15% stronger', rarity: 'common', icon: 'wind', apply: m => { m.cryoSlowBonus += 0.15; } },
  { id: 'engi_drone', name: 'Extended Cells', desc: 'Rift Engineer drones last 50% longer', rarity: 'common', icon: 'bot', apply: m => { m.droneDurationMul *= 1.5; } },
  { id: 'engi_aura', name: 'Resonant Field', desc: 'Engineer aura grants +15% more attack speed', rarity: 'rare', icon: 'radio', apply: m => { m.engiAuraBonus += 0.15; } },
  { id: 'crit', name: 'Rift Precision', desc: 'All Guardians: +10% critical-hit chance', rarity: 'rare', icon: 'crosshair', apply: m => { m.crit += 0.1; } },
  { id: 'core_dr', name: 'Core Plating', desc: 'Core takes 25% less damage', rarity: 'rare', icon: 'shield', apply: m => { m.coreDR = 1 - (1 - m.coreDR) * 0.75; } },
  { id: 'energy_kill', name: 'Soul Siphon', desc: '+1 energy from every kill', rarity: 'common', icon: 'battery', apply: m => { m.energyKillBonus += 1; } },
  { id: 'cost_scale', name: 'Efficient Rifts', desc: 'Summon cost rises every 4 summons instead of 3', rarity: 'rare', icon: 'trending-down', apply: m => { m.costEveryN = 4; } },
  { id: 'boss_dmg', name: 'Giantbane Code', desc: '+40% damage against elites and bosses', rarity: 'rare', icon: 'sword', apply: m => { m.bossDmgMul *= 1.4; } },
  { id: 'chain', name: 'Fork Current', desc: '20% chance projectiles chain to another enemy', rarity: 'epic', icon: 'git-branch', apply: m => { m.chainChance += 0.2; } },
  { id: 'explode', name: 'Volatile Ends', desc: 'Defeated enemies explode for 8 area damage', rarity: 'epic', icon: 'bomb', apply: m => { m.explodeOnDeath += 8; } },
  { id: 'rank4_shield', name: 'Apex Ward', desc: 'Creating a rank 4+ unit shields the Core for 25', rarity: 'epic', icon: 'shield-plus', apply: m => { m.shieldOnRank4 = true; } },
  { id: 'stability', name: 'Anchor Protocol', desc: '+15 extra Stability from every merge', rarity: 'common', icon: 'anchor', apply: m => { m.stabilityPerMergeBonus += 15; } },
  { id: 'rank2_summon', name: 'Gifted Rifts', desc: '15% chance summons arrive at rank 2', rarity: 'epic', icon: 'sparkles', apply: m => { m.rank2Chance += 0.15; } },
  { id: 'wave_repair', name: 'Pulse Mend', desc: 'Core repairs 3 health after every wave', rarity: 'rare', icon: 'heart', apply: m => { m.coreRepairWave += 3; } },
];

export const RARITY_WEIGHT: Record<string, number> = { common: 60, rare: 30, epic: 10 };
export const RARITY_COLOR: Record<string, string> = {
  common: '#94a3b8',
  rare: '#38bdf8',
  epic: '#fb923c',
};
