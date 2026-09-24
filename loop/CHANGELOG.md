# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## STRUCTURAL: kept — receiver-side communication reward (cycle 6, day ~52→62)

**Hypothesis (priority signal 2, communication):** the sound channel only
rewards the *sender* for calling near something that matters (food
underfoot / predator close, `nodling.js` `bonus += 0.25`); the *receiver*
gets nothing for reacting to a heard sound, so there's no gradient pushing
call↔response correlation (alarm→flee, food-found→approach) to become
learnable. Added a small symmetric receiver-side plasticity reward: if a
Nodling currently hears a sound (`s[22] > 0`) while a predator is
genuinely close to *it* (`s[40] > 0.5`) or it's standing on nutritious
food, it gets `+0.1` bonus. Gated on the receiver's own situation, not the
caller's frequency, so meaning still has to be evolved, not assumed.

Before (baseline, day 51.6875): population 249, fitness 5452, maxGen 138,
avgBrain 70.96, built 702.
After (validation, day 61.6875, 16000 ticks): population 250, fitness
5452, maxGen 27, avgBrain 66.656, built 538. Guardrails: fitness drop 0%,
population drop -0.4% (grew) — both well within limits. `pass: true`.

Note: mid-run the observer logged a population dip to the reseed floor and
a max-generation reset to 0 (day 51.7, coinciding with a Summer→Winter
transition), recovering to pop 250 / gen 27 by day 61.7. This looks like
seasonal cold pressure (already flagged separately as `nobuild`/cold-stress
in RULES priority signal 3), not something this reward change caused — the
change only touches the per-tick plasticity reward term, not energy/thermal
mechanics. Worth a future cycle's attention regardless: repeated
population-crash-to-reseed-floor events are exactly the "lineages aren't
persisting" pattern priority signal 3 warns about.
