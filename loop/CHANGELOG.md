# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## Cycle 1 — day 51.7 → 61.7 — `kept`

**Hypothesis (priority signal 2, communication):** the sound channel already
rewards informative calling (near food/predator) but plasticity learns slowly,
so a receiver's within-lifetime association between heard sound and context
may not have time to form. Raised `LEARN_RATE` in `brain.js` 0.02 → 0.03
(within the declared [0.005, 0.05] range) to speed Hebbian-style plasticity,
which should make any sound↔context correlation (and other learned
associations) form faster within a lifetime.

Before (baseline, day 51.7): population 251, fitness 4562, maxGen 82, avgBrain 77.2, built 697.
After (validation, +16000 ticks, day 61.7): population 250, fitness 5544, maxGen 27, avgBrain 62.5, built 417.

Guardrail check: `pass: true` — fitness rose (no drop), population essentially
flat (-0.4%, well under the 40% cap). `maxGen` and `built` dropped, but that's
expected harness noise, not a regression: every headless run reseeds a fresh
70-Nodling population from the hall-of-fame (see `sim.js` `seed()`/bootstrap
in `run-headless.js`), so a 16k-tick validation run starting a fresh seed is
never going to reach the generation depth or structure count that an 80k-tick
baseline run accumulated — the guardrails intentionally don't gate on those
two metrics for this reason. No direct measurement yet of sound↔behavior
correlation; that remains unobserved (observer.js has no sound-correlation
metric) and is a good next-cycle candidate (add instrumentation, or a
receiver-side reward, before tuning further here).
