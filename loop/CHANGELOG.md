# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## Cycle 5 — day 51.7→61.7 — STRUCTURAL: kept

**Hypothesis** (priority signal 2, communication): the sound channel exists
and the *emitter* already earns a bonus (`+0.25`) for calling near something
that matters (food underfoot / predator close), but the *listener* has no
direct incentive tied to reacting to what it hears — only the indirect,
diluted effect of whatever it does next on its own wellbeing. That asymmetry
means there's little pressure for a call/response coupling to bootstrap at
all. Added a small symmetric reward (`+0.05` bonus, vs the emitter's `0.25`)
for a Nodling whose next move is oriented toward the direction of the
nearest heard sound (`nodling.js`: `heardDir` tracked in `sense()`, bonus
applied where movement is executed in `tick()`). This doesn't hardcode any
meaning for the frequency — it only rewards *orienting toward sound at all*,
leaving what a given frequency ends up meaning (approach vs. avoid) to
regular selection pressure (e.g. walking into a predator still costs far
more than the small orienting bonus is worth).

Before (batch, 80k ticks, day 51.7): population 249, fitness 6732, maxGen 150,
built 680.
After (validation, 16k ticks, day 61.7): population 249, fitness 6732 (no
drop — already an all-time record), built 361. `maxGen`/`built` swings are
expected noise from the harness reseeding the live population from the hall
of fame at the start of every run (see `sim.js` `seed()`/`fameEntry()`) — the
guardrails, which compare fitness/population only, showed `pass: true` with
no reasons.
