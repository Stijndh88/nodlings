# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## Cycle 5 — day 51.7→61.7 — STRUCTURAL: kept

**Hypothesis (priority signal 2, communication):** the sound-emission bonus in
`nodling.js` rewarded calling near food *or* a predator with the same flat
+0.25, regardless of pitch — so nothing pushed the emitted frequency to
diverge between the two contexts, and a food/alarm convention had no
gradient to climb. Split the bonus by pitch vs. context: high pitch
(`freq > 0.5`) near a predator and low pitch (`freq <= 0.5`) over food now
earn +0.35, off-convention calls in context still earn the weaker +0.1,
uninformative calls earn nothing — same total call-triggering condition
(`|out.sound| > 0.15`), same energy cost.

Before (baseline, day 51.7): population 250, fitness 5135, maxGen 139, built 811.
After (validation, day 61.7): population 249, fitness 5585, maxGen 27, built 392.

Guardrails passed (no NaN, population held, fitness rose vs. dropped).
maxGen/built read lower post-change but aren't guardrail-checked and swing
with population turnover across a short 16k-tick window — watch next cycle's
trend rather than reading this single sample as regression.
