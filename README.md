# Riftguard: Merge Siege

An original short-session merge-and-evolve roguelike tower defense for iOS and Android, built with Expo, React Native, and TypeScript. You are a Rift Warden defending an unstable dimensional Core against waves of corrupted creatures pouring out of three portals. Summon Guardians, merge them into higher ranks, pick roguelike Enhancements mid-battle, and defeat the Rift Colossus before the timer or your Core runs out.

## Running the game

The dev server runs automatically in this environment. To run it yourself elsewhere:

```bash
npm install
npx expo start
```

Then scan the QR code with the Expo Go app (iOS or Android), or press `w` to play in the browser. The game is portrait-only. All dependencies are aligned to Expo SDK 54 (`npx expo install --check` reports up to date), so the project loads in Expo Go without custom native builds.

## Controls

- **Tap SUMMON** — spends energy, deploys a random Guardian from your loadout on a random empty grid cell. Cost is shown on the button and rises as you summon.
- **Drag a Guardian onto a matching one** (same type, same rank) — merges them into one higher-rank unit. The result is a random Guardian from your loadout; valid targets glow yellow while dragging, and the outcome odds are shown at the bottom.
- **STABILIZE toggle** — each merge fills the Stability meter; a full meter grants a charge (max 2). With Stabilize on, your next merge keeps the destination unit's type and consumes one charge.
- **Tap an enemy** — marks it as a priority target for all Guardians.
- **Pause / 1x-2x** — top corners. The game auto-pauses when backgrounded.
- **Enhance** — kills fill the orange meter; when full, combat pauses and you pick one of three upgrade cards (one free reroll per battle). Each successive Enhance requires more fill, pacing a normal battle at 3-4 picks.

## Screens

Title → Hub → Campaign (5 stages with modifiers) / Loadout (swap summon order) / Guardians (level 1-10 with Credits) / Core (permanent upgrade tree) → Battle → Victory/Defeat.

## Architecture

Simulation and rendering are fully separated:

- `game/sim/battle.ts` — the entire battle simulation: pure TypeScript, no React. Fixed-timestep updates (30 ticks/s), deterministic seeded RNG (`game/rng.ts`), a battle-state machine (`loading | tutorial | playing | upgrade | paused | victory | defeat`), and all player actions (summon, merge, stabilize, priority target, upgrade choice).
- `store/useBattle.ts` — the driver: holds the mutable sim, accumulates real time into fixed steps (clamped, so backgrounding or pausing can never fast-forward or duplicate ticks), supports 1x/2x speed, and pauses on app background. React re-renders read a snapshot each tick.
- `store/useMeta.ts` — persistent progression via Zustand + AsyncStorage (versioned save: credits, Guardian Data, stage records/stars, Guardian levels, Core upgrades, settings, tutorial flag).
- `components/battle/*` — rendering only: field, enemies, projectiles, effects, HUD, overlays. Drag-and-drop merging uses react-native-gesture-handler with gestures created once per battle, not per render.

## Balance data

All tunable values live in typed data files — nothing is hardcoded in components:

- `game/data/balance.ts` — energy, costs, ranks, meters, wave timings, star thresholds, upgrade costs, field geometry.
- `game/data/guardians.ts` — the four Guardians (Arc Ranger, Nova Cannon, Cryo Weaver, Rift Engineer): stats, ultimates, tags.
- `game/data/enemies.ts` — six enemy types plus the Shardling split.
- `game/data/stages.ts` — five campaign stages with modifiers, plus the ten wave compositions.
- `game/data/upgrades.ts` — nineteen Enhance upgrades across Common/Rare/Epic rarities.

## Testing and simulation

- `npm run typecheck` — TypeScript (passes clean).
- `npx expo lint` — ESLint (passes clean).
- `npx tsx scripts/simulate.ts [stageId|all] [runs] [smart|naive|both]` — headless balance harness: a bot plays full battles through the real simulation and reports win rate, average duration, summons, merges, Enhance picks, and remaining Core health. The `smart` bot merges damage dealers first, spends Stability charges only on damage types, and picks offensive upgrades; `naive` plays randomly. Example: `npx tsx scripts/simulate.ts all 500 both`.

Measured over 500 seeded runs per stage (smart bot): stage 1 ~79% win rate, stage 2 ~76%, stage 3 ~67%, stage 4 ~45%, stage 5 ~33%, with ~3.9 Enhance picks and ~175s per battle. The smart bot outperforms the naive bot by 10-16 points on every stage, confirming merging strategy and Stability usage matter.

## Debugging

Open Settings (gear icon on the Hub) and enter a value in "Battle seed (dev)" to force a deterministic seed for every battle; clear it to return to random seeds. The same dev section has a "Diagnostics overlay" toggle that shows UI update rate, seed, phase, elapsed time, entity counts, and active upgrades during battle.

## Accessibility

Sound/music/haptics toggles, reduce motion, damage-number toggle, colorblind-friendly status markers, large touch targets, safe-area support, and automatic pause on backgrounding — all in Settings (Hub gear or the in-battle pause overlay).

## Known limitations

- **No audio yet.** The sound and music toggles exist in Settings but no sounds are implemented.
- **Web preview is not proof of native behavior.** The game runs in the browser, but haptics, real gesture feel, notch safe areas, and device performance can only be confirmed in Expo Go on a physical phone.
- Ultimate abilities fire automatically on cooldown; there is no manual ultimate trigger.

## Verifying on a physical device

1. Run `npx expo start` and scan the QR code with Expo Go (Android) or the Camera app (iOS).
2. Confirm haptic feedback on summon, merge, and invalid merge.
3. Drag Guardians near the screen edges — units should never get stuck and invalid drops must snap back.
4. Check the HUD and bottom bar clear the notch and home indicator.
5. Play a full stage-1 battle at 2x speed and watch for frame drops during the wave-10 boss fight.
