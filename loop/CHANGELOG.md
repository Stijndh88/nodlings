# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## Cycle 5 — day 51.7 → 61.7

**STRUCTURAL: kept** — Priority signal #2 (communication): the sound channel
already rewards the *caller* for emitting near food/danger (`nodling.js`
"-- sound --" block), but nothing rewarded the *listener* for reacting to a
heard sound. Added a small bonus (`+0.15`) when a hungry Nodling
(`energy < 40%`) moves toward a heard sound's direction, so an
approach-on-call correlation has a reward gradient to climb on the receiving
end too, not just the emitter's half.

Before (baseline, day 51.7): fitness 5193, population 250, built 849, maxGen 136.
After (validation, day 61.7): fitness 6056, population 250, built 661, maxGen 28.
`pass: true` — fitness rose, population held at cap. (maxGen/built dropped
because `run-headless.js` reseeds a fresh `World()` and repopulates from the
hall-of-fame gene bank each process invocation rather than persisting the
live population/terrain across runs — this happens at every cycle boundary
regardless of the change under test, not something this change caused.)
