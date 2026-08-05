# Riftguard: Merge Siege

An original portrait tower-defense roguelike for iOS and Android, built with Expo, React Native, and TypeScript. You lead four fantasy Wardens along an old woodland road, merge their power on rune pads, accept temporary blessings, and stop cursed creatures before they reach the ancient Heartstone.

## What changed in the fantasy-path redesign

- Battles now have one clearly visible, winding S-shaped road from a ruined forest gate to the Heartstone shrine.
- Enemies move along the exact same path data used to draw the road. It is functional gameplay geometry, not background decoration.
- Sixteen hand-placed circular rune pads sit around the road and replace the old cyber grid presentation.
- Wardens and creatures use new code-drawn fantasy miniatures, including an archer, ember mage, frostcaller, grove keeper, beasts, wisps, bramble swarms, and the Hollow Colossus.
- The HUD, mana bar, merge preview, blessings, tutorial, pause screen, result screen, lodge, Warden screens, and Heartstone upgrades use a forest, parchment, carved wood, moss, and warm-gold visual language.
- Campaign progression is now shown as a winding, five-stop journey map instead of a plain stage list.
- A painterly forest-clearing asset lives at `assets/images/battlefield-forest-v1.png`; the road, pads, gate, shrine, units, projectiles, and effects remain code-driven and responsive.

## Running the game

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go on iOS or Android, or press `w` for the web version. The game is portrait-only and uses Expo SDK 54.

## Controls

- **CALL WARDEN** spends mana and places a random Warden from the war band on an open rune pad.
- **Drag one matching Warden onto another** to merge two Wardens of the same type and tier. Valid destinations glow gold while dragging.
- **BIND FATE** spends a Fate token so the next merge keeps the destination Warden type.
- **Tap a creature** to make it the priority target.
- **Pause / 1x–2x** controls are in the top corners. The game auto-pauses when sent to the background.
- Defeated creatures fill the **Blessing** meter. When full, choose one of three boons; one free fate reshuffle is available each battle.

## Player flow

Title → Warden's Lodge → Journey / War Band / Wardens / Heartstone → Battle → Victory or Defeat.

The first stage contains a five-step contextual tutorial for calling, pairing, merging, choosing a blessing, and guarding the road.

## Architecture

Simulation and rendering stay separated:

- `game/sim/battle.ts` contains the fixed-timestep battle simulation, seeded RNG, state machine, and player actions.
- `game/data/balance.ts` contains the shared road polyline, rune-pad positions, progression values, and balance constants. `lanePos()` interpolates enemy positions along the road.
- `store/useBattle.ts` drives the simulation at 30 fixed ticks per second with bounded catch-up, 1x/2x speed, and background pause.
- `store/useMeta.ts` persists gold, Warden essence, stage records, Warden levels, Heartstone upgrades, settings, and tutorial state through Zustand and AsyncStorage.
- `components/battle/*` renders the field, miniatures, projectiles, effects, HUD, gestures, and overlays.

## Verification completed

- `npm run typecheck` — passes with zero TypeScript errors.
- `EXPO_NO_TELEMETRY=1 npm run lint` — passes with zero errors and zero warnings.
- `EXPO_NO_TELEMETRY=1 npm run build:web` — exports successfully, including the new forest asset.
- `npx tsx scripts/simulate.ts all 500 smart` — runs the real battle engine headlessly.

After retuning for the new path geometry, 500 smart-bot runs per stage produced this progression:

| Stage | Win rate | Average duration | Blessings |
| --- | ---: | ---: | ---: |
| Whispering Trail | 79.0% | 173s | 3.9 |
| Windfall Pass | 70.2% | 175s | 3.8 |
| Crystal Glade | 68.0% | 175s | 3.9 |
| Ashen Moor | 48.6% | 177s | 3.8 |
| Titan's Hollow | 34.6% | 178s | 3.7 |

The simulation command accepts `[stageId|all] [runs] [smart|naive|both]`.

## Debugging and accessibility

Settings include haptics, reduce motion, damage numbers, colorblind status markers, a deterministic battle seed, and a diagnostics overlay. The overlay reports UI update rate, seed, phase, wave, entity counts, and active blessings.

## Known limitations

- Sound and music toggles are present, but audio assets and playback are not implemented yet.
- Ultimate gifts fire automatically on cooldown.
- A web export cannot prove native haptics, gesture feel, safe areas, or phone performance.

## Phone checklist

1. Start Expo and open the project in Expo Go.
2. Confirm that the road, rune pads, ruined gate, and Heartstone fit between the HUD and mana bar.
3. Drag Wardens on pads near every screen edge; invalid drops must return cleanly.
4. Check haptics for calling, merging, and invalid merges.
5. Open a blessing choice and the result screen; cards and buttons must clear the notch and home indicator.
6. Play the Hollow Colossus wave at 2x and watch for frame drops.
