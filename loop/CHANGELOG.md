# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## Cycle 1 — day 51.7 → 61.7 — STRUCTURAL: kept

Baseline batch (day 1.7→51.7, resumed from the repo's initial storage) already
cleared signal #1's stated target on its own: `built` reached 657 (vs. the
day-513 best of 25 — well over an order of magnitude), with 7747 total
structure tiles, bridges, and bricks all climbing. So picked signal #3
instead: the same baseline's own observations.md logged the recurring
plateau pattern it warns about — best fitness barely moved (4196→4367, +4%
over 50 in-world days) while population, maxGen (0→129) and avgBrain
(45→81) all grew sharply, and lineage diversity collapsed (12→4 colour
groups). RULES.md: "prefer changes that widen the fitness landscape... over
re-tuning existing knobs once this pattern recurs."

Hypothesis: the hall-of-fame fitness score (`age + 250*offspring`) has only
two axes, both of which saturate once a lineage finds a near-optimal
survive-and-breed strategy — there's no way for a genuinely new, orthogonal
behaviour (e.g. building) to register as fitness, so selection has nothing
left to climb.

Change: added a third, uncapped axis. Each Nodling now tracks `built` —
incremented only when it actually *transports* durable material (wood,
plank, stone, or brick) to a different cell and adds it to an existing
stack (grab-cell ≠ drop-cell, guarded via a new `carryFrom` field so a
trivial zero-cost grab/re-drop-in-place loop can't farm it). Score became
`age + 250*offspring + 20*built` in both places `sim.js` computes it
(death-time hall-of-fame push and the periodic living-elite enrolment).
This also happens to reinforce signal #1 (construction) as a side effect,
but the primary intent is a new, independent fitness axis.

Validation (16000 ticks vs. the day-51.7 baseline): pass. fitness 4367→4799
(+9.9%, no drop), population 248→253 (no crash), no NaN, selfTest passed.
`built` metric itself dipped 640→373 in this short window (expected noise —
structures burn/weather over a 10-day window; not a guardrail). Kept;
watch subsequent cycles' fitness trend for whether the plateau actually
breaks, not just this one validation window.
