# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

- **[cycle 1, day 51→61]** _(kept)_ Signal 1 (villages/construction): named and
  lowered `FIRE_SPREAD_RATE` (world.js) from the previous inline `0.04` to
  `0.025` (within declared [0.01, 0.2] range) — fire was burning down
  flammable structures (wood/plank), capping how large durable clusters can
  grow. Before: population 249, fitness 5264, maxGen 138, built 654 (day
  51.7). After 16k validation ticks: population 250, fitness 5505, maxGen 31,
  built 416 (day 61.7). Guardrails passed (no population/fitness crash, no
  NaN, selfTest ok), so kept per policy. Note for the next cycle: `built`
  fell and `maxGen` dropped sharply (138→31), suggesting a population
  turnover/die-off happened in this window that isn't fully explained by the
  fire change alone — worth watching over the next few cycles; if `built`
  keeps trending down, this change should be reconsidered even though it
  passed guardrails.
