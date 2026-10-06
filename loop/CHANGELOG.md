# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## Cycle 5 — day 51.7 → 61.7 — STRUCTURAL: kept

**Hypothesis** (priority signal 2, communication): the sound channel has a
caller-side bonus (`nodling.js` — calling while food/predator is actually
nearby earns +0.25) but nothing on the receiver side, so there's no reward
pressure for *hearing* a sound to ever matter. Added a mirrored listener-side
bonus: a Nodling that hears any sound (`s[22] !== 0`) while food is underfoot
or a predator is close gets `this.bonus += 0.15`. This doesn't hardcode what
a frequency means — it only makes "a sound was heard around the same time as
something relevant to me" a reinforceable event, so reward-modulated
plasticity has a chance to wire heard freq/direction to useful moves.

Baseline (pre-change, batch to day 51.7): population 248, fitness 4875,
built 640, maxGen 137.
Validation (post-change, +16k ticks to day 61.7): population 249, fitness
4875 (unchanged — hall-of-fame metric, short window), built 390, maxGen 26.
Guardrails: pass (0% fitness drop, population +1). built/maxGen moved but
aren't guardrail-checked; watch over the next few cycles for whether the
built/maxGen dip is noise from population turnover or a real cost of the
change.

