# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## Cycle 5 (day ~51.7 → 61.7) — STRUCTURAL: kept

**Signal:** #2 communication — the sound channel carried a reward for the
*caller* to signal near food/predators, but nothing rewarded a *listener*
for reacting to a heard call, so alarm→flee / food→approach correlation had
nothing to select for.

**Change:** tag each emitted sound with hidden `danger`/`food` context
(computed from the caller's own situation, same as the existing caller
bonus) — never exposed as a sense, so a listener still has to evolve which
frequency means what. Listener gets `+0.15` bonus when moving away from a
heard `danger` call, or toward a heard `food` call (dot product of its move
vector with the direction to the sound source).

**Files:** `nodling.js` — `heardSound` field + tagged `nextSounds` push +
listener-side bonus block in `tick()`.

**Before → after (16k validation ticks, day 51.7→61.7):**
population 250→251, fitness 4788→5308 (+10.9%), avgBrain 92.1→94.5.
Guardrails: pass (no population/fitness drop).

`STRUCTURAL: kept`
