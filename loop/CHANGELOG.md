# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## Cycle 1 — day 51.7 → 61.7 — STRUCTURAL: kept

Hypothesis (priority signal 2, communication): the sound channel had a
caller-side reward (call near food/predator) but no listener-side reward, so
nothing pushed hearers to actually respond to a heard call — the emission
signal had no reason to acquire meaning to *listeners*. Tagged emitted
sounds with their emission context (`danger`/`food`, computed from the same
predator/food checks already run for the caller bonus) and added a small
listener-side reward term (±0.2, inside the existing reward clip) for moving
toward a heard food-tagged call or away from a heard danger-tagged call,
using the heard direction (senses 23-24) from the *previous* think — i.e.
whichever call the outgoing decision was actually responding to.

Validation (16000 ticks from the day-51.7 baseline, compared against it):
fitness 4222 → 5142, population 250 → 255, avgBrain 88.1 → 90.8, built 694 →
447 (partial-window count, not a regression signal — batch vs. validation
windows aren't comparable). `pass: true`, no guardrail reasons. Kept.
