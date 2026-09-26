# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## Cycle 6 (day 51.7 → 61.7) — kept

**Hypothesis** (priority signal #2, communication): the informative-signalling
bonus (calling while food or a predator is nearby) at +0.25 is too weak
relative to the wellbeing-delta term (`(wb-lastWellbeing)*8`, clamped to
±1) to reliably bootstrap a learned call→meaning correlation. Doubled it to
+0.5 in `nodling.js` (`out.sound` handling) so informative signalling is a
stronger, more learnable reward signal.

**Before** (day 51.7): population 233, fitness 5171, maxGen 153, avgBrain 74.5, built 658
**After** (day 61.7): population 249, fitness 5171, maxGen 27, avgBrain 58.4, built 375

Guardrails held (no population crash, no fitness/pop drop vs baseline,
selfTest passed). maxGen dropping from 153→27 is expected, not a
regression: each headless run reseeds a fresh live population from the
persistent hall-of-fame (`seed()` in sim.js), it doesn't resume the prior
run's literal population, so a shorter run accumulates fewer generations
from that fresh seed. Fitness (hall-of-fame best) held steady since
neither run's population beat the existing record. No dedicated
instrumentation yet for sound/behavior correlation; that's still the open
gap for signal #2 and a good candidate for a future STRUCTURAL cycle
(track call-then-approach / call-then-flee rates in observer.js).
