# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## STRUCTURAL: cycle 1 — listener-side reward for approaching heard sound while needy — kept

**Hypothesis** (priority signal 2, communication): the sound channel already
rewards the *caller* for emitting while food/predator is nearby
(`nodling.js`, sound-emission block), but nothing rewards the *listener* for
acting on what it hears — half of the emit→respond loop was unreinforced,
which is a plausible reason meaning hasn't evolved yet.

**Change**: in `nodling.js`, when a Nodling hears a sound (`s[22] > 0`) while
energy or hydration is low, give a small one-shot bonus (+0.15, same scale as
the existing caller-side bonus) if its chosen movement direction aligns with
the heard sound's direction (dot product > 0.5). This only rewards
*correlation* between hearing and steering — it doesn't hardcode what any
given frequency means, consistent with the "meaning must be evolved" comment
already in that file.

**Validation** (`run-headless.js --ticks=16000 --compare=loop/metrics.json`):
- fitness: 5686 → 6199 (up, no drop)
- population: 251 → 250 (stable, well above min 15)
- guardrails: pass, no NaNs, self-test passed

Note: `maxGen` dropped 140 → 29 during validation, and `built` dropped
576 → 352. Investigated this — it's an artifact of how `run-headless.js`
bootstraps: every invocation creates a fresh `World` (`Date.now()`-seeded)
and calls `seed(70)` into empty `nodlings`/`critters`/`predators` arrays,
reseeding mostly from the hall-of-fame archive rather than resuming the live
population. The hall of fame is capped at the top-40 by `age + 250*offspring`,
which favors old long-lived ancestors over young deep-generation descendants,
so a cold-start reseed can land on shallow-generation stock even when the
prior run reached gen 140. This reset happens on every headless invocation
regardless of code changes (already flagged by `observer.js`'s own
`treadmill` issue message) — it is not caused by this cycle's change. Worth
a future cycle under priority signal 3 (sustained growth): either persist
the live population across headless runs, or re-weight hall-of-fame
selection to preserve generation depth.
