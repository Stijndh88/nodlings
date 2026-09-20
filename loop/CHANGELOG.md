# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## Cycle 5 — day 61.7 — STRUCTURAL: kept

**Signal:** #2 communication — the sound channel had a reward for emitters
(call near food/predator) but nothing rewarded listeners for reacting to what
they hear, so there was no pressure for the meaning to actually be used.

**Change:** added a listener-side bonus (`nodling.js`, in `tick()`) mirroring
the existing emitter-side one: moving toward a heard sound while hungry
(`energy < 40%`) earns `+0.1` bonus reward. Which frequencies end up meaning
what is still left entirely to evolution — this only rewards *acting* on a
heard sound in a plausible way.

**Validation (16000 ticks vs. cycle-5 baseline):**

| metric | before | after |
|---|---|---|
| population | 249 | 250 |
| fitness | 4983 | 5452 |
| built | 567 | 431 |
| day | 51.7 | 61.7 |

Guardrails passed (no population/fitness drop). `built` dropped but stayed
far above the historical `>=25` milestone; not a guardrail signal, worth
watching over future cycles.
