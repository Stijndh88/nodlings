# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## STRUCTURAL: listener-side reward for reacting to heard sound (day 51.7)

Priority signal #2 (communication): the sound channel already rewards the
*caller* for emitting near food/a predator (`nodling.js`), but nothing
rewarded the *listener* for acting on what it hears, so there was no
selection pressure to actually use the heard freq/dir inputs (senses
22-24). Added a small listener-side bonus: when a Nodling hears a call and
a real predator is sensed nearby, moving away from it earns +0.15; when no
threat but real food is in view, moving toward it earns +0.1. Both use
ground truth already sensed that tick, independent of the (still
freely-evolved) frequency meaning.

Before (baseline, 80000 ticks): fitness 4815, population 250, maxGen 138,
built 749, day 51.7.
After (validation, 16000 ticks, fresh reseed as usual): fitness 5180,
population 250, maxGen 24, built 512, day 61.7.
Guardrails: pass (no fitness/population drop, self-test OK). `kept`.

Note for a future cycle: `sim.js`'s `serialize()`/`applySave()` only persist
`hallOfFame`/`predFame` genomes + counters, not the live `nodlings`/world
grid — every headless invocation reseeds population 70 from the gene bank
into a fresh empty world (only `world.tick` is carried forward for the
`day` display). `observer.js`'s own `treadmill` issue message already
describes this as the population "crashing to the reseed floor... each
cycle" — likely the real driver behind priority signal #3's plateau
pattern. Fixing it means persisting full world+population state
(structures, brains, ages) between cycles, which is a bigger structural
change than fits in one cycle here.
