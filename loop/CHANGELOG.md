# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## Cycle 5 — day 51.7→61.7 — `kept`

**Signal:** #1 (construction) already looks satisfied — 650 durable structures
sustained vs. the `built >= 25` milestone, an order of magnitude over target.
Moved to **#2 (communication)**: the sound channel is wired (freq + heard
direction senses, s22-24) but the only pressure toward *informative* calling
is a small caller-side bonus (`+0.25`) for calling near food/a predator —
weak relative to the wellbeing-delta term (×8, clipped to [-1,1]). Listener
response to heard sound has to bootstrap off that same weak signal.

**Change:** extracted the inline `0.25` into a named `SOUND_CALL_BONUS` const
in `nodling.js` and raised it to `0.4`, to strengthen the training signal
behind informative calling. Added `SOUND_CALL_BONUS` (range `[0.1, 0.6]`) to
`loop/RULES.md` tunable_params (meta edit, exempt from the one-change cap).

**Before (baseline, day 51.7):** population 248, fitness 5939, maxGen 60, built 657
**After (validation, day 61.7):** population 249, fitness 5939, maxGen 32, built 353

Guardrails passed (no fitness/population drop vs. baseline). `maxGen`/`built`
dropped but aren't guarded metrics — worth watching next cycle; could reflect
this window's own dynamics rather than the change (only one validation run).
