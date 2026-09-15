# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## Cycle 5 — day 61.7 — STRUCTURAL: kept

**Hypothesis (signal 2, communication):** a call in `nextSounds` was only
audible for exactly 1 tick before being discarded (`world.sounds =
world.nextSounds`), but Nodlings only think every other tick (offset by a
per-individual phase). A listener whose think-phase didn't land on the exact
emission tick could never hear the call at all — making any alarm/food-call
correlation nearly impossible to learn regardless of reward shaping. Tagged
each sound with its emission tick (`t: w.tick`) and changed the end-of-tick
merge to keep calls audible for `SOUND_LIFETIME = 4` ticks instead of 1
(`world.sounds = world.sounds.filter(s => world.tick - s.t < SOUND_LIFETIME).concat(world.nextSounds)`),
so a listener has multiple think-ticks to actually perceive a recent call.

Before (baseline, day 51.7): population 250, fitness 4245, maxGen 119, built 901.
After (validation, day 61.7): population 251, fitness 5661 (+33%), maxGen 24
(reset mid-window by an unrelated population/gene-pool cycling event visible
in observations.md right at the baseline boundary, not caused by this
change), built 453. No guardrail tripped; fitness rose rather than dropped.
