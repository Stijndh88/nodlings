# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## Cycle 6 — day 61.7 — STRUCTURAL: kept

**Hypothesis** (priority signal 2, communication): the sound channel had a
reward only on the *caller* side (bonus for calling near food/a predator) —
nothing rewarded the *listener* for reacting appropriately, so there was no
selection pressure to actually interpret the signal. Tagged each emitted
sound with what prompted it (`pred`/`food`, computed the same way the
caller's own bonus already was) and gave the listener a matching one-shot
bonus (+0.15) when its next move — chosen with that sound already in its
senses — goes away from a predator-tagged call or toward a food-tagged call.
Change in `nodling.js`: `sense()` stashes the nearest heard sound on
`this.heardSound`; `tick()` compares it against the move just chosen.

**Before → after** (16000-tick validation vs. the 80000-tick baseline):
`population` 250 → 250, `fitness` 5848 → 5848 (unchanged — the all-time-best
Nodling is still alive), `maxGen` 134 → 28, `avgBrain` 83.3 → 66.9, `built`
633 → 454, `day` 51.7 → 61.7.

`maxGen`/`avgBrain`/`built` aren't gated by the guardrails, but the drop is
large enough to flag: looks like a lineage turnover (the deep-134 lineage
died out and was replaced by younger stock that's only reached gen 28), not
something the sound change obviously causes — but worth having the next
cycle check whether it's a one-off or a new pattern before trusting `built`
trend lines again.

`pass: true` (fitness/population guardrails clear, self-test passes) →
kept.
