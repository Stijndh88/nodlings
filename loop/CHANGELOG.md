# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## STRUCTURAL: kept — listener-side alarm-call reward (day 51.7)

Signal 2 (communication): the sound channel had a reward for the *caller*
signalling near food/a predator, but nothing rewarded a *listener* for
acting on what it heard — no pressure for the correlation (alarm→flee) to
become learnable on the receiving end. Added a small bonus (+0.2) when a
Nodling flees the origin of a heard sound that genuinely had a predator
nearby (ground truth), but only when its own direct threat sense (s[40])
saw nothing — i.e. only when the call is the *only* source of that
information, not a redundant one. `nodling.js`: new `this.heardSound`
tracked in `sense()`, reward block added after the existing call-emission
bonus in `tick()`. No new sense channel, no brain/topology change.

Before (baseline, day 51.7, pop 249): fitness 5760, maxGen 135, avgBrain 82.4, built 793.
After (day 61.7, 16000 ticks): fitness 6286, maxGen 26, avgBrain 63.6, built 544.
Guardrails passed (no population crash, no fitness drop, selfTest OK). maxGen/built/avgBrain
dropped — plausible normal turnover (structures can burn/decay, generations reset after
die-offs) rather than a guardrail violation; worth watching over the next few cycles since
those aren't currently guardrailed.
