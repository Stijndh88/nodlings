# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## Cycle 5 — day 51.7 → 61.7

**Hypothesis (priority 2, communication):** the sound channel only rewards
the *caller* for signalling near food/a predator — nothing rewards a
*listener* for reacting to a heard sound, so the alarm→flee / food→approach
correlation RULES.md asks for had no reward gradient to bootstrap from the
receiving side. Added a small listener-side bonus (+0.15) in `nodling.js`
`tick()`: when a Nodling hears a sound (`s[22]>0`) and moves away from it
while sensing a predator itself, or moves toward it while flora is in view,
it earns the same magnitude bonus the caller already gets for informative
calls. `kept`.

- before (baseline, day 51.7): population 251, fitness 5319, maxGen 126,
  avgBrain 86.0, built 779
- after (validation, day 61.7, 16000 ticks): population 250, fitness 5319
  (unchanged — cumulative record), maxGen 27, avgBrain 60.4, built 385
- guardrails: pass, no reasons (fitness/population drop within bounds,
  finite, population above floor)
