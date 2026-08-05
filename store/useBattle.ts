import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { BattleOptions, BattleState, createBattle, update } from '@/game/sim/battle';
import { BALANCE } from '@/game/data/balance';

let current: BattleState | null = null;
let speed = 1;

export function startBattle(opts: BattleOptions): BattleState {
  current = createBattle(opts);
  speed = 1;
  return current;
}

export function getBattle(): BattleState | null {
  return current;
}

export function endBattle() {
  current = null;
}

export function getSpeed() {
  return speed;
}

export function setSpeed(s: number) {
  speed = s;
}

export function useBattleTicker(): { battle: BattleState | null; version: number } {
  const [version, setVersion] = useState(0);
  const acc = useRef(0);
  const last = useRef(0);

  useEffect(() => {
    const step = 1 / BALANCE.tickRate;
    last.current = Date.now();
    const interval = setInterval(() => {
      const b = current;
      if (!b) return;
      const now = Date.now();
      let elapsed = Math.min((now - last.current) / 1000, 0.25);
      last.current = now;
      if (b.phase === 'playing' || b.phase === 'tutorial') {
        acc.current += elapsed * speed;
        let steps = 0;
        while (acc.current >= step && steps < 12) {
          update(b, step);
          acc.current -= step;
          steps++;
        }
      } else {
        acc.current = 0;
      }
      setVersion(v => v + 1);
    }, 1000 / BALANCE.tickRate);

    const sub = AppState.addEventListener('change', state => {
      const b = current;
      if (state !== 'active' && b && (b.phase === 'playing' || b.phase === 'tutorial')) {
        b.prevPhase = b.phase;
        b.phase = 'paused';
      }
    });

    return () => {
      clearInterval(interval);
      sub.remove();
    };
  }, []);

  return { battle: current, version };
}
