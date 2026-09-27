# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## Cycle 1 — STRUCTURAL: kept

**Hypothesis (priority signal 2, communication):** the sound channel already
rewards the *caller* for emitting near food/a predator (`nodling.js` sound
block), but nothing rewarded a *listener* for reacting to a heard sound — so
the emitter/listener correlation (alarm→flee) only had a weak, delayed path
to reinforce via general wellbeing. Added a small listener-side bonus:
reward moving away from a close predator (`senseBuf[40] > 0.3`) while a
sound was just heard (`senseBuf[22] !== 0`), using the existing predator
direction/threat and heard-frequency senses — no new sense/output added, no
hardcoded meaning for the frequency itself.

**Before → after** (batch day 51.7 → validation day 61.7, `--compare`):
population 236 → 250, fitness 4497 → 5466, built 791 → 368, maxGen 151 → 28.
The built/maxGen drop lines up with a winter population crash + reseed from
the hall-of-fame (each headless run starts a fresh `World()`/population
seeded mostly from `hallOfFame`, so a die-off during the validation window
resets the map and regrows generations from there) — a known, pre-existing
dynamic per RULES.md's plateau signal, not something this change caused.
Guardrails (population/fitness drop, NaN, selfTest) all passed.

`pass: true` → kept.
