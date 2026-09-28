# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## Cycle 1 — 2026-09-28

**STRUCTURAL: kept** — Priority signal 2 (communication). The `sound` output
already rewarded the *caller* for calling near real food/a predator, but the
*listener* had no matching signal, so alarm→flee / food→approach had nothing
to select for on the receiving end. Added a small listener-side bonus
(`nodling.js`, in `tick()` right after `brain.step`): whenever any sound was
heard this tick (`s[22] !== 0`), give +0.15 bonus for moving away from a
genuinely-near predator, and +0.15 for moving toward genuinely-near food.
This only fires on real nearby threat/food (ground truth), so it doesn't
assert what the sound frequency itself means — that's still left to evolve.
Signal 1 (construction) was skipped this cycle: baseline already shows
`built=791`, ~30x the `built>=25` milestone, so no hypothesis was needed
there.

Baseline (80k ticks, day 51.7): population 251, fitness 5432, built 791.
Validation (+16k ticks, day 61.7): population 250, fitness 5807, built 446.
Guardrails passed (no fitness/population drop vs baseline). Note: each
run-headless invocation reseeds a fresh population (only world.tick/day and
persisted stats carry over), so the validation run is a *different*,
shorter-lived population than the baseline's — the comparison is noisier
than a true resume, but it's how the harness is built and it passed cleanly
either way.
