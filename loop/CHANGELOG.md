# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## STRUCTURAL: kept — day 61.7 (cycle 6)

**Signal #2 (communication).** The sound channel's reward only checked "is
something informative nearby" (food underfoot / predator close), regardless
of the frequency chosen — so there was no pressure for frequency to
consistently track *which* referent it was. Changed `nodling.js`'s sound
block to require a frequency-band match: low freq (`<0.5`) only pays off
next to food, high freq (`>=0.5`) only next to a predator. This should push
evolution toward a genuinely referential (bimodal, meaning-correlated)
frequency distribution instead of an unconstrained one, making the
alarm→flee / food→approach correlation signal #2 asks about learnable on
the listener side too (heard freq, `s[22]`, becomes informative).

- before (baseline, day 51.7): population 235, fitness 4650, maxGen 142,
  avgBrain 82.1, built 787
- after (validation, day 61.7, 16000 ticks): population 250 (at cap),
  fitness 5261, maxGen 25, avgBrain 66.2, built 422
- Guardrails passed (`pass: true`, no reasons). Note: maxGen and built
  dropped a lot — looks like a lineage turnover/die-off in this window
  (population held at cap and fitness rose, so not a guardrail concern),
  but worth watching next cycle to confirm it's not this change causing
  churn.
