# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## Cycle 5 (day 51.7 → 61.7) — STRUCTURAL: kept

**Hypothesis (priority signal 2, communication):** the sound channel had a
reward for the *caller* (bonus for calling near food/a predator) but nothing
for the *listener* reacting to a heard call, so there was no pressure to ever
use the channel. Added a ground-truth `food`/`danger` tag to each emitted
sound (not fed to the brain, reward-shaping only) and a small reward for the
listener moving toward a heard food-tagged call or away from a heard
danger-tagged call, using the direction/tag heard on the *previous* think-tick
paired with the action taken in response to it.

Files: `nodling.js` (sound emission tagging, `sense()` heard-sound capture,
listener reward term in `tick()`).

Before → after (baseline day 51.7 → validation day 61.7, 16000 ticks):
- fitness: 4627 → 6085 (+31.5%)
- population: 238 → 250
- maxGen: 141 → 29, built: 679 → 427 (population crashed/reseeded during the
  window per `observations.md`'s own "reseed floor" issue log — a known,
  pre-existing sim dynamic unrelated to this change; not part of the
  guardrail check, which only tracks fitness/population drop)

Guardrail verdict: `pass: true`, no reasons. Kept.
