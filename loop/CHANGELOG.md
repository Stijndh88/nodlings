# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## Cycle 5 — STRUCTURAL: kept

**Hypothesis (priority signal 2, communication):** the sound channel exists
(evolved frequency + heard direction) but only the *caller* gets a reward for
informative signalling (calling near food/a predator); listeners get no
reward tied to hearing, so alarm→flee correlation has nothing pushing it to
become learnable. Tagged emitted sounds with `danger` when a predator is
near, and gave the listener a small one-shot bonus (`+0.15`, via the
existing `bonus` mechanism, same size order as the caller's `+0.25`) when it
moves away from a heard danger-tagged sound. Frequency itself still carries
no hardcoded meaning — only the bias toward reacting to a danger tag is new,
per RULES.md's "bias reward/sensory wiring to make that correlation
learnable" guidance. Changed: `nodling.js` (`heardDangerDir` field, sense()
tagging, flee-bonus check, `danger` flag on `nextSounds` push).

Before (baseline, day 51.7): population 237, fitness 4953, maxGen 146, built 750.
After (validation, day 61.7, +16000 ticks): population 250 (cap), fitness 6011
(+21.4%), maxGen 28, built 399 (still very active). Population and fitness
both improved; maxGen dropped but that's the pre-existing crash/reseed
volatility already flagged by the observer's own "treadmill" issue at day
51.7 mid-baseline-batch (predates this change), not a guardrail metric.
Guardrails: pass.
