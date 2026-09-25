# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## Cycle 1 — day 51.7 → 61.7

**Hypothesis (priority signal #2, communication):** the sound-call bonus
rewarded any call near food or a predator with the same flat +0.25
regardless of pitch, so there was no pressure for frequency to actually
correlate with context — both situations could reward whatever pitch a
caller already used. Split the bonus by pitch-vs-context match: a call
near a predator earns the full bonus only above 0.5 (else a smaller
+0.05), and a call near food earns the full bonus only below 0.5 (else
+0.05) — nudging alarm calls and food calls toward opposite ends of the
frequency range, a step toward the correlation the sound channel wants to
carry.

Before (baseline, day 51.6875): population 250, fitness 5485, maxGen 82,
avgBrain 64.596, built 583.
After (validation, day 61.6875): population 252, fitness 5485, maxGen 32,
avgBrain 62.30, built 323.
No guardrail violated (fitness held flat, population steady). `kept`.

