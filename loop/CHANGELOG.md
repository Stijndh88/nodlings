# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## Cycle 5 — day 51.7→61.7 — STRUCTURAL: kept

**Hypothesis (priority signal 2, communication):** the sound channel had a
caller-side bootstrap reward (call near food/predator earns bonus) but
nothing on the listener side, so there was no gradient pushing a Nodling to
*act* on a heard sound at all — a precondition for alarm→flee / food→approach
correlations to ever emerge. Added a symmetric listener-side bonus in
`nodling.js` (`tick()`, after the sound-emission block): +0.1 for moving
toward a heard sound's direction while hungry (energy < 50%), +0.1 for
moving away from it while under predator threat (`senseBuf[40] > 0.3`).
Frequency meaning is still left entirely to evolve — the gate is the
listener's own state, not the sound's frequency.

Before (baseline, day 51.7): population 247, fitness 4950, maxGen 154, built 730.
After (validation, day 61.7): population 249, fitness 5350, maxGen 31, built 364.

Guardrails: pass (no fitness/population drop; maxGen/built aren't guarded and
fluctuate with population turnover between runs). Kept.
