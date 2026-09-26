# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## Cycle 5 (day 51.7→61.7) — STRUCTURAL: listener-side bonus for approaching a heard sound — kept

Priority signal 2 (communication): the sound channel had a bonus for the
*caller* (calling near food/a predator earns +0.25) but nothing rewarded a
*listener* for acting on what it hears. Added a symmetric bonus — hungry
(energy<100) and moving toward a heard sound's direction earns +0.1 — so
approach-on-call can co-evolve with calling instead of relying on the long,
sparse delay until food is actually reached. `nodling.js`: track
`this.heardDir` in `sense()`, apply the bonus in `tick()` next to the
existing caller bonus.

Before (baseline, day 51.6875): population 250, fitness 4752, maxGen 142, built 831.
After (validation, day 61.6875): population 249, fitness 4873, maxGen 22, built 470.

A winter die-off + hall-of-fame reseed happened mid-validation (new RNG
seed in observations.md, observer logged "shelter/nest payoff too weak" —
a pre-existing issue, not caused by this change). That explains the
maxGen/built drop; endpoint guardrails (population, fitness vs. baseline)
still passed, so per RULES.md this is kept.
