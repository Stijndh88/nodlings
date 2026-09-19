# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## STRUCTURAL: kept — sound persists 2 ticks instead of 1

**Signal:** #2 (communication) — the sound channel exists but its meaning
must be evolved, and evolution can't wire up a signal that's inaudible.

**Hypothesis:** a Nodling only re-evaluates its brain (and thus only
senses) on every other tick, staggered by a random per-individual `phase`.
A sound was only ever audible for the single tick right after it was
emitted, so roughly half the population — whichever phase didn't line up
with that exact tick — could structurally never hear any given call,
independent of what evolution tried to wire up. Extended `world.sounds` to
carry the last 2 ticks of emissions (`sim.js`), so any 2 consecutive ticks
— which always include exactly one evaluation per Nodling — are enough to
guarantee every individual gets a chance to hear a call.

**Before → after** (16000-tick validation vs. the 80000-tick baseline):
fitness 4637 → 5338, population 250 → 250 (steady), avgBrain 80.98 →
87.47, day 51.7 → 61.7. No guardrail tripped.
