# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## STRUCTURAL: kept — listener-side reward for reacting to heard sound (day 51.7)

**Signal:** #2 communication — the sound channel exists (`out.sound`, senses
22-24) but nothing rewarded a *listener* for reacting to it, only the caller
for emitting near something that mattered. Without listener-side pressure,
alarm→flee / food-found→approach correlations have no reason to emerge.

**Change:** in `nodling.js` `sense()`, when a heard sound is in range, check
ground truth at its *origin* (predator within 6 tiles → danger, top-of-stack
nutrition → food) and stash it as `this.heardSignal` — this doesn't hardcode
what a frequency means, only whether the moment was worth reacting to. In
`tick()`, after the brain acts, give a small bonus (+0.15) if the Nodling
moved away from a danger-context sound, or toward a food-context one. The
frequency-to-reaction mapping itself is still left entirely to evolution.

Before (batch, 80000 ticks, day 51.7): population 250, fitness 6008, maxGen 144, avgBrain 78.62, built 624.
After (validation, 16000 ticks, day 61.7): population 250, fitness 6008, maxGen 28, avgBrain 72.66, built 410.

No guardrail violations (population held at cap, fitness unchanged). maxGen/built are lower only because the validation window is 5x shorter than the batch window, not a regression. `kept`.
