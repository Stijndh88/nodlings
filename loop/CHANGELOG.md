# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## Cycle 5 (day 51.7 → 61.7) — kept

**Hypothesis (signal 1: multi-step construction):** brick/kiln chains are the
rarest durable structure (12 bricks vs 584 bridge tiles at day 51.7) because
they need a rare fire to reach rare clay. Named the previously-inline `0.04`
fire-spread literal in `world.js` as `FIRE_SPREAD_RATE` and raised it to
`0.07` (within the declared `[0.01, 0.2]` range) so fire reaches flammable
neighbours — and by extension nearby clay — more often, without touching
fire's short lifetime or lightning-strike rate that keep it subcritical.

Before → after (16000-tick validation): fitness 5336 → 6189, population
250 → 251, day 51.7 → 61.7.

Guardrail verdict: `pass: true`, no reasons — kept.

Observed but not guardrailed: `maxGen` dropped 136 → 26 and standing
`built` count dropped 594 → 206 right at the start of the validation window,
alongside a Winter transition. Bricks/day roughly doubled (12/50d → +5/10d),
consistent with the hypothesis, but the population briefly lost its deep
lineages and matures rebuilt fewer structures. Worth watching next cycle —
if `maxGen`/`built` keep crashing near season transitions after this change,
that's a candidate to revert even though guardrails didn't catch it this
time (they only compare window endpoints, not mid-window dips).
