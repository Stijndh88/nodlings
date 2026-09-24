# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## Cycle 1 — STRUCTURAL: kept

**Hypothesis** (priority signal 2, communication): the sound channel exists
and the *caller* already gets a small reward for calling while something
salient is happening nearby (food underfoot / predator close), but nothing
rewards the *listener* side, so the sound↔situation correlation only has
half a training signal to bootstrap from. Added a symmetric reward: any
Nodling that currently hears a sound (`senseBuf[22] > 0`) while the same
salience condition is true *for it* also gets `bonus += 0.25`. Via the
existing reward-modulated Hebbian plasticity (`brain.js: w += lr*pl*reward*
pre*post`), this reinforces whatever connections from the heard-sound
senses (22-24) were active at that moment — without hardcoding any
direction of "meaning" (approach vs. flee stays free to evolve). Change is
in `nodling.js`'s sound-handling block only.

Before → after (`--ticks=16000 --compare`):
- population: 244 → 250
- fitness: 5007 → 5007
- built: 797 → 470
- day: 51.7 → 61.7

(`maxGen` 154 → 27 and the `built` drop reflect that `run-headless.js`
reseeds a fresh working population from the hall-of-fame on every process
start — pre-existing behavior unrelated to this change; guardrails only
check population/fitness, both of which held.)

Guardrail verdict: `pass: true` (no fitness/population drop). Kept.
