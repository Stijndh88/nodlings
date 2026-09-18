# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## Cycle 1 — day 51.7 → 61.7

**STRUCTURAL: kept.** Priority signal #2 (communication): the sound channel
(sense + `out.sound`) exists but nothing rewards tying emission to context,
so there was no pressure for an alarm-call correlation to evolve — the flee
half is already covered by the existing predator-threat sense, but the emit
half had no incentive beyond generic novelty. Added a small reward bonus
(+0.15, inside the existing `[-1,1]` clamp) in `nodling.js` `tick()` when a
Nodling's last decision emitted sound (`|out.sound| > 0.15`) while a predator
is still in range now (`s[40] > 0.3`), reinforcing sound-emission weights
specifically in threat contexts via the existing reward-modulated Hebbian
plasticity.

Baseline (80000 ticks, day 51.7): population 249, fitness 5864, built 665.
Validation (+16000 ticks, day 61.7): population 250, fitness 5864, built 442
(built is a duration-sensitive snapshot, not comparable 1:1 across a 5x
shorter run — guardrails only checked fitness/population drop, both flat).
`pass: true` — no fitness or population drop. Kept; watch future observation
logs for alarm→flee correlation showing up.
