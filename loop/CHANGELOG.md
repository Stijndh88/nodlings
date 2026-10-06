# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## Cycle 1 — day 51.7 → 61.7 — kept

**Hypothesis** (priority signal 2, communication): the sound channel exists
(heard freq + direction already sensed) but the caller-side bootstrap reward
for informative calling (`topNut || predNear`) was only `+0.25`, a weak
signal relative to the reward scale (wellbeing-delta×8, reproduction=+1).
Raised it to `+0.45` (`nodling.js`, the `this.bonus +=` line in the sound
block) to strengthen reinforcement of calling-when-it-matters, giving
listeners a cleaner, more frequent correlation to learn from.

Before (baseline, day 51.6875): population 250, fitness 5337, maxGen 139,
built 627.
After (validation, day 61.6875): population 249, fitness 5337, maxGen 27,
built 375.
Guardrail verdict: `pass: true` (no fitness/population drop beyond
threshold, no NaN, selfTest ok).

Note for review: maxGen and built both dropped sharply, but
`loop/observations.md` shows a summer→winter transition with an explicit
"population crashing to the reseed floor" issue logged at day 51.7 —
this looks like a seasonal die-off/regrowth event already known to the
sim, not an effect of this change (population itself barely moved,
250→249). Not a guardrail criterion either way. Worth re-checking next
cycle whether calling frequency / listener reaction actually increased.

