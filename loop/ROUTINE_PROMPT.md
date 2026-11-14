# Routine prompt (paste into the nodlings-loop routine)

The routine was created via the API, so agents can't edit it. Its prompt is this one line:

> Read loop/ROUTINE_PROMPT.md on master and follow it exactly.

Everything below is then editable in git like any other file.

---

**PAUSED since 14 November 2026: World 2 is being rebuilt (see ROADMAP.md, "World 2").**
Do not run a cycle. Do not run any `node loop/...` command, do not commit and do not push. Reply with the
single line "Loop paused for the World 2 rebuild" and stop. The pause ends when this paragraph is removed
from this file on master. Everything below describes the old cycle and is not in force while this paragraph stands.

CRITICAL: the container is ephemeral; only work pushed to origin master counts.
Run every `node loop/...` command in the FOREGROUND with the Bash timeout set to 600000. NEVER use
run_in_background, Monitor or sleep, and never end your turn while a command is running.

You are running one cycle of the Nodlings autonomous research loop. The world is continuous
(`loop/world.json.gz`): never delete it; every cycle resumes it.

First read `ROADMAP.md` (the plan: current phase, gate, hypothesis queue), `loop/RULES.md` (metrics, how a
change is judged, guardrails, bans), `loop/PLAYBOOK.md` (why the plan is what it is, how to design and read an
experiment, what to do when a result is unclear or a phase stalls, build-ready designs for the harder items)
and the last ~10 entries of `loop/CHANGELOG.md`. When the rules do not cover a situation, the playbook decides.

1. **Advance the world.** `node loop/run-headless.js --ticks=<batch_ticks> --compare=loop/metrics.json`
   (about 8 minutes including the skill probes). If it times out, rerun with half the ticks.
   - `"pass": false`: `git add -A && git commit -m "cycle: INCIDENT at day X"`, add a CHANGELOG entry prefixed
     `INCIDENT:` with the reasons, `git push origin master`, STOP.
   - `"pass": true`: `git add -A && git commit -m "cycle: batch to day X"` and `git push origin master` immediately.
2. **Harvest finished experiments.** `node loop/experiments.js harvest`. For every entry it reports as `kept`
   or `reverted`, add its `changelog` line to the CHANGELOG entry of this cycle. If any patch was applied
   (`"applied": true`), run `node loop/ci-check.js`; if that fails, `git checkout HEAD -- *.js`, and set that
   hypothesis to `untested` with the reason. Report `overdue` experiments in the CHANGELOG. Commit
   (`cycle: harvest <ids>`) and push.
3. **Submit one new experiment**, unless 2 are already `running`.
   - Pick the hypothesis as RULES.md "Change policy" says and make that ONE change in the working tree.
   - Screen it as RULES.md "How a change is judged" says (instant test, or the dry safety run for an `ENV` change).
     An instant test prints `"decision": "submit"` when the screen passes. If the screen crashes or trips a guardrail: `git checkout HEAD -- *.js`, record the hypothesis as `reverted`
     with the numbers, and go to step 4.
   - `node loop/experiments.js submit <id> --target=<metric> --note="<what and why>"` (add `--simplify` for
     removals). It restores the working tree. Then `git add -A && git commit -m "exp: submit <id>"`.
4. **CHANGELOG entry** for this cycle (a few lines): day, `probes.skill` / `learningGain` / `memoryGain`, the
   `wallShare` and `canReachWater` values from `node loop/audit-world.js` (read-only, a few seconds), what
   was harvested with its numbers, what was submitted and why, which ROADMAP phase and how far its gate is.
   `git add -A && git commit -m "cycle: <summary>" && git push origin master`.

Never commit a sim change (`*.js` in the repo root) directly: it reaches master only through a harvested `keep`
(the one exception is the emergency revert in PLAYBOOK section 8). Keep ROADMAP.md current as PLAYBOOK section 10 says.
Fully autonomous: never stop to ask for confirmation.
