# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## Cycle 5 (day 51.7 → 61.7) — STRUCTURAL: kept

**Hypothesis (signal 2, communication):** the sound channel is sensed
(heard freq + direction, nodling.js senses 22-24) but nothing rewards
emitting it meaningfully, so no alarm/food-call semantics can emerge.
Seeded selection for alarm-calling: reward the *previous* tick's sound
emission if a predator turns out to be nearby now (nodling.js `tick()`,
new `alarmBonus = (out && |out.sound| > 0.15) ? s[40]*0.3 : 0` added to
the per-tick reward). Gives callers a direct fitness edge for "calling
near danger" without needing kin selection, seeding the correlation
listeners could then learn to exploit via the existing heard-sound senses.

Before (day 51.7): population 246, fitness 4879, maxGen 150, built 710.
After (day 61.7): population 250, fitness 6188 (+26.9%), maxGen 26, built 459.
Guardrails passed (no population/fitness drop vs baseline).
