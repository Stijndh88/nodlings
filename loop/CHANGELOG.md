# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## STRUCTURAL: kept — listener-side reward for approaching a heard call while hungry
Signal 2 (communication): the sound channel already rewards the *caller* for
calling near food/predators (nodling.js, existing `bonus += 0.25`), but nothing
rewarded the *listener* for reacting — so alarm/food meaning had no incentive
to bootstrap on the receiving end. Added a small symmetric bonus (`+0.1`) when
a Nodling hears a sound (`s[22] > 0`), is hungry (`energy < 50%`), and moves
toward the source (`out.moveX/Y` aligned with heard direction `s[23]/s[24]`).
Ground-truthed on public info only (own energy + heard direction), no
telepathy of the caller's state — matches the existing caller-side pattern.

Validated against a control run (same baseline, no code change) to confirm
the incidental maxGen 155→~30 drop is baseline noise (population turnover),
not caused by this change — both the control and the treated run land at
maxGen ~25-30, built ~380-400, fitness unchanged at 6181 (all-time best,
unbeaten in this window).

Before (baseline, day 51.7): population 250, fitness 6181, maxGen 155, built 602.
After (day 61.7, with change): population 250, fitness 6181, maxGen 25, built 379.
Control (day 61.7, no change): population 249, fitness 6181, maxGen 30, built 400.
Guardrails: pass (no fitness/population drop vs baseline).
