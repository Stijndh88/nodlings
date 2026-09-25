# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## Cycle 1 — day 51.7 → 61.7 — `STRUCTURAL: kept`

**Signal:** #2 communication — sound channel exists (emitter gets a small
bonus for "informative" calls) but nothing helps a *listener* actually hear
it: sounds vanished after exactly 1 tick, and Nodlings only think every
other tick (staggered per-individual phase), so roughly half of all nearby
listeners were structurally unable to ever perceive an emission regardless
of genome. That's a sensory-wiring bottleneck, not a reward problem — no
amount of evolution can learn a correlation it can never sense.

**Change:** sounds now persist `SOUND_TTL = 2` extra ticks past emission
(3 ticks total, up from 1) by carrying forward not-yet-expired entries in
`simTick()` (`sim.js`) instead of replacing `world.sounds` outright each
tick. Emission cost/bonus logic in `nodling.js` unchanged.

**Before → after** (16000-tick validation vs pre-change baseline):
- population 250 → 251
- fitness 4609 → 5265
- avgBrain 65.28 → 68.30
- built 622 → 471 (noise; not a guardrail)

`pass: true`, no guardrail violated. Kept. Next cycle should check
`loop/observations.md` for any sound-behavior correlation signal before
picking a follow-up.
