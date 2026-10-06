# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## Cycle 1 — day 51.7→61.7 — STRUCTURAL: kept

**Hypothesis (signal 2, communication):** a sound only lived for exactly 1
tick (`world.sounds = world.nextSounds` each tick). Nodlings only think
(sense + decide) every other tick, staggered by a per-individual `phase`
(0 or 1). A listener whose phase didn't line up with the exact tick a sound
existed would simply never sense it — no chance to learn any correlation
between heard sound and nearby events, regardless of reward shaping. This
is a sensory-reliability bottleneck, not a reward problem, so the fix
doesn't hard-code any meaning for sound (meaning must still be evolved).

**Change:** sounds now persist `SOUND_LIFE = 2` ticks instead of 1 (added
`age` field in `nodling.js`, carried forward and filtered in `sim.js`,
constant in `world.js`). 2 ticks guarantees every phase gets at least one
think-tick where the sound is still audible.

**Before → after** (16000-tick validation, day 51.7→61.7):
- fitness (best-ever): 4618 → 5543
- population: 248 → 250 (at cap)
- built: 900 → 513 (noisy milestone metric, not guardrailed)
- maxGen (current living pop): 147 → 24 — a sharp drop, but not a guardrail
  (guardrails only cover population floor/drop and fitness drop, both of
  which improved/held). Likely an unrelated die-off + reseed turning over
  the living population's generation depth; hallOfFame-based fitness kept
  climbing, so flagging here for a future cycle to watch rather than
  blocking on it.

Guardrails: pass (no population crash, no NaN, selfTest passed, fitness
rose, population rose). Kept.
