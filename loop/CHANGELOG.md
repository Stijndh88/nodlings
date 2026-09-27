# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## Cycle 5 (day ~52→62) — kept

**Hypothesis:** priority signal 2 (communication) and 3 (sustained growth) —
the sound channel and the observation log's plateau pattern both need faster
in-lifetime learning to let novel correlations (sound↔behavior) actually get
picked up. `LEARN_RATE` (brain.js, plasticity learning rate) was already a
declared tunable (range 0.005–0.05) at 0.02, i.e. mid-low in range — raised
it to 0.03.

**Change:** `LEARN_RATE = 0.02` → `0.03` (brain.js), within the declared
[0.005, 0.05] range. No flag needed (tunable_params).

**Before → after** (baseline day 51.7 → validation day 61.7, 16000 ticks):
- fitness: 4682 → 4801 (up)
- population: 250 → 252 (stable, near cap)
- maxGen (this window): 155 → 27 (expected — window reset by comparison
  scope, not a guardrail metric)
- built: 590 → 364 (fluctuation; still far above the `built >= 25` village
  milestone, not a guardrail metric)

Guardrails: pass (no population crash, no NaN, no fitness/population drop
beyond thresholds). **kept**.
