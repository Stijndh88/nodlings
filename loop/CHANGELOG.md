# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.

## Cycle @ day 51.7 → day 61.7 — STRUCTURAL: kept

**Hypothesis** (priority signal 2, communication): the sound channel had no
evolved meaning because only the *speaker* was rewarded (calling near food/a
predator earns +0.25) — nothing ever reinforced a *listener* for reacting to
a heard sound, so there was no pressure for the correlation (alarm→flee,
food→approach) to become learnable at all, let alone for pitch to carry
consistent meaning.

**Change**: `nodling.js` — track the nearest heard sound each sense tick
(`this.heardSound`), and after this tick's move, give a small symmetric
listener-side bonus (+0.15) for moving toward a sound whose origin actually
has food, or away from one whose origin actually has a nearby predator. Does
not hardcode what a frequency means — only rewards acting on the *direction*
of a heard sound when that action would have paid off, mirroring the
existing speaker-side bonus.

**Validation** (16,000 ticks vs. the day-51.7 baseline):
- fitness: 5447 → 5651 (up, within guardrail)
- population: 249 → 250 (no crash)
- self-test: pass
- guardrail verdict: `pass: true`

`kept`.
