# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## Cycle 6 (day 51.6875 → 61.6875) — STRUCTURAL: kept

**Hypothesis** (priority signal 2, communication): the sound channel already
rewards the *caller* for emitting near something that matters (food/predator),
but nothing rewarded the *listener* for reacting to what it hears, so the
frequency has no gradient pushing it toward meaning. Added a small listener
bonus (`+0.15`) for fleeing a nearby predator while a sound is audible, to
give an alarm-call→flee correlation something to climb. `nodling.js`: hoisted
the existing predator-proximity check out of the sound-emission block so both
the caller and the new listener bonus can reuse it, then added the
listening-bonus block right after sound emission.

Before (baseline, day 51.6875): population 248, fitness 4782, maxGen 154, built 633.
After (validation, day 61.6875): population 250, fitness 6121, maxGen 24, built 451.

Guardrails: pass (fitness rose, population rose — no drop). maxGen/built fell,
but that's the harness's known reseed-on-restart behavior (see observations.md
day 51.7 "issue" entries about population crashing to the reseed floor each
run), not a guardrail metric and not attributable to this change.
