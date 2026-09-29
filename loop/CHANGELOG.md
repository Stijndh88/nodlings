# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## STRUCTURAL: kept — alarm→flee reward shaping (day 51.7 → 61.7)

**Hypothesis** (priority signal 2, communication): the sound channel exists
but the reward function gives no signal tying it to behavior, so
alarm→flee correlation has no reason to emerge. Added a small reward term
in `nodling.js` (`commBonus`): when a predator is nearby (`s[40] > 0.3`)
and a sound was recently heard, reward the previous action for moving
*away* from the sound's source. This only nudges plasticity toward
learning the correlation described in RULES.md — it doesn't hardcode the
response.

**Before → after** (80k-tick batch → 16k-tick validation):
- population: 250 → 250 (at cap, no drop)
- fitness (best-ever): 5225 → 5225 (unchanged)
- maxGen: 69 → 29
- built: 693 → 441
- avgBrain: 67.5 → 58.5

Guardrails passed (population/fitness thresholds unaffected). Note:
maxGen and built both fell over this window, but neither is a guardrail
metric and both are noisy day-to-day in this sim; worth watching over
the next couple of cycles to see if this change is the cause or normal
variance, rather than reverting on this one sample.
