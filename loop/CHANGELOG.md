# Nodlings loop changelog (World 2)

One entry per cycle: what was measured, harvested and submitted, and where the current phase stands.
**Newest entries at the top**, directly under this header. The changelog of the first world is in
`archive/v1/CHANGELOG.md`.

## 14 November 2026, cycles 20-21: batches to year 78, winter-relief reverted, thirst ladder submitted

- Batches: year 75 (cycle 20) and year 78.75 (cycle 21; I ran a second batch by mistake with `--help`, which the
  runner ignores, and then a stray `--ticks=0` that appended a bogus cycle-22 line; I removed it and rebuilt
  `metrics.json`/`state.json` from the cycle-21 record. Both real batches passed.) Cycle 21: `probes.skill` 2,314
  (`evolved` 2,973, `random` 659), `learningGain` -490, `handsGain` -389, `memoryGain` +379, `badMealShare` 0.369,
  `wallShare` 0, `canReachWater` 1. Population 208 (94 in cycle 19, noisy). Deaths since start: cold 545, starved
  305, thirst 92, predator 11, age 4 (cold about 57%). Ledger unchanged (same 13 techniques, 3 with tools).
- Harvested `w2-winter-relief`: reverted. `probes.evolved` 2637 -> 2688 (1.9%, t=0.38, no-effect); `learningGain`
  -12 -> -168 (no-effect); `memoryGain` 244 -> 253; 5 replicates x 60000 ticks. Easing winter does not raise skill.
- Submitted `w2-thirst-ladder` (ENV.thirst 1 -> 1.125, target `probes.thirst`). The 1.25 step failed the step-size
  screen (pop 158 vs 208, cold 61%), so I halved it; 1.125 screened at pop 181, no guardrail tripped.
- Phase W1: `evolved`/`random` about 4.5x (met); `canReachWater`/`wallShare` fine; cold share about 57% (under 60%,
  but only just). Remaining queue: predator ladder, mutation rate.

## 14 November 2026, cycle 19: batch to year 71, noise floor, winter experiment submitted

- Batch: year 71.25, `probes.skill` 2,300 (`evolved` 2,959, `random` 659), `learningGain` +34, `handsGain` +49,
  `memoryGain` +267, `socialGain` +16, `badMealShare` 0.369 (exam) / 0.318 (live); `wallShare` 0, `canReachWater` 1.
  Population 94. Deaths in the world since the start: cold 679, starved 305, thirst 95, predator 13, age 11
  (cold 61%, just over the 60% gate limit). Ledger types stayed the same 13 common techniques, 3 with tools.
- Harvest: nothing finished, none running. (Slip: I ran `run-headless --ticks=0` once by mistake; it appended a
  bogus cycle line and overwrote `metrics.json`. I removed the line and rebuilt `metrics.json` and `state.json`
  from the real cycle-19 history record.)
- Done `w2-noise-floor` (A/A, 5 x 60,000 ticks): sd of `probes.evolved` 150 (about 5.5%), `learningGain` 184,
  `handsGain` 320; all verdicts no-effect as they should be. Written into PLAYBOOK section 2.
- Submitted `w2-winter-relief` (ENV.cold 1 -> 0.8, target `probes.evolved`). Era screen passed (population 116,
  cold 305 of about 510 deaths).
- Phase W1: `evolved`/`random` is 4.5x (gate 3x met); `canReachWater` and `wallShare` fine; the cold share above 60%
  is the remaining gate item, which the experiment targets.

## 14 November 2026: two designs approved (documentation only)

Stijn gave his go-ahead for copying (`w2-imitate`, phase W4) and for a second yearly secret (`w2-second-secret`,
phase W2). Both are specified build-ready under "Approved designs" in ROADMAP. No sim change in this entry.

## 14 November 2026: World 2 starts (rebuild, approved by Stijn)

The first world was archived (`archive/v1/`, code on branch `v1-final`) after the audit in `docs/AUDIT-2026-11.md`.
World and creature were rebuilt:
- `materials.js` (property rows), `physics.js` (carry, place, strike, heat, decay; no material names), `senses.js`
  (74 property senses), `actions.js` (with the technique ledger), new `nodling.js` (reward = change in body state
  only), `brain.js` (eligibility trace, `learn` output, drive genes), `world.js`, `metrics.js` (exam with
  switched-off tests for learning, memory, hands, social; world health; ledger).
- Tests in `test/` (physics 21, rules 10, learning 4) now run in CI.
- A new world was started from random brains at `world_seed` 20261114 and run for 18 cycles (216,000 ticks).
  Averages of cycles 14 to 18: `probes.evolved` 2,840 against `probes.random` 659 (4.3x); `learningGain` -289,
  `handsGain` -437, `memoryGain` -28, `socialGain` +32; exam `badMealShare` 0.37; population 162 on average;
  `wallShare` 0.001. Last cycle deaths: cold 60%, starved 30%, thirst 7%.
- Cycle 17 printed a guardrail failure (`canReachWater` 0.881). It was a measuring fault: 23 Nodlings stood in
  water after their bridge rotted and were counted as cut off. Fixed in `metrics.js`; cycle 18 reads 1.0. The
  earlier values in `history.jsonl` (0.88 to 0.98) are undercounts.
- ROADMAP, PLAYBOOK, RULES, ROUTINE_PROMPT, README and `docs/world-notes.md` were rewritten for World 2. The
  loop resumes at phase W1; its first queue item is the A/A noise floor.
