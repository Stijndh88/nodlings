# Nodlings loop rules

```json
{
  "batch_ticks": 80000,
  "validation_ticks": 16000,
  "guardrails": {
    "min_population": 15,
    "max_fitness_drop_pct": 25,
    "max_population_drop_pct": 40
  },
  "tunable_params": [
    {"file": "nodling.js", "const": "REPRO_THRESHOLD", "range": [0.4, 0.9]},
    {"file": "world.js", "const": "FIRE_SPREAD_RATE", "range": [0.01, 0.2]},
    {"file": "brain.js", "const": "LEARN_RATE", "range": [0.005, 0.05]},
    {"file": "nodling.js", "const": "SOUND_CALL_BONUS", "range": [0.1, 0.6]}
  ]
}
```

## Guardrails (hard revert, no exceptions)
- Population must not crash below `min_population`.
- No NaN/non-finite metric.
- `selfTest()` must still pass.
- Best fitness must not drop more than `max_fitness_drop_pct` vs the pre-change baseline.
- Population must not drop more than `max_population_drop_pct` vs the pre-change baseline.

## Priority signals (push toward, in this order)
1. **Multi-step construction / villages** — durable-structure clusters,
   brick/kiln chains, bridges used for territory, not just scattered
   stacking. Target: beat the current best (`built >= 25` milestone) by an
   order of magnitude, sustained, not a one-off spike.
2. **Communication** — the sound channel exists but carries no evolved
   meaning yet. Look for correlation between sound emission and nearby
   Nodling behavior (alarm→flee, food-found→approach) as a signal it's
   being used; bias reward/sensory wiring to make that correlation
   learnable if it isn't showing up.
3. **Sustained open-ended growth** — break the repeated fitness/generation
   plateaus the observation log shows (day 235, day 413 pattern in
   `nodlings-observations-day513.md`). Prefer changes that widen the fitness
   landscape (new affordances, sensory inputs, reward shaping) over
   re-tuning existing knobs once this pattern recurs.

## Change policy
- Exactly ONE change per cycle, small and falsifiable, tied to one priority
  signal above.
- Check `loop/CHANGELOG.md` first — don't retry a hypothesis already marked
  `reverted` for the same reason.
- Anything in `tunable_params` needs no special flag. Anything else (new
  mechanic, new sense/output, structural rewiring, new file) is still
  applied autonomously but logged with a `STRUCTURAL:` prefix in
  `CHANGELOG.md` for easy review.
- Grow `tunable_params` over time as safe knobs are identified — edit this
  file's JSON block directly when that happens (that edit is itself exempt
  from the "one change per cycle" cap, since it's meta/policy, not sim
  behavior).
- If the *baseline* batch (before any new change) fails a guardrail, that
  means an earlier cycle's "kept" change was actually bad and only showed it
  now. Don't try to auto-locate and revert that old commit — commit the
  batch output as-is, log an `INCIDENT:` entry in CHANGELOG with the
  guardrail reasons, push, and skip making a new change this cycle. A human
  reviewing CHANGELOG decides what to do about incidents.
