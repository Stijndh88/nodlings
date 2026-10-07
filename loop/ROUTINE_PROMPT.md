# Routine prompt (paste into the nodlings-loop routine)

The routine was created via the API, so agents can't edit it. Replace its prompt with this one line:

> Read loop/ROUTINE_PROMPT.md on master and follow it exactly.

Everything below is then editable in git like any other file.

---

CRITICAL: the container is ephemeral; only work pushed to origin master counts.
Run every `node loop/run-headless.js` command in the FOREGROUND with the Bash
timeout set to 600000. NEVER use run_in_background, Monitor or sleep, and never
end your turn while a command is running. If a command times out, rerun it with half the ticks.

You are running one cycle of the Nodlings autonomous improvement loop. The world is continuous (`loop/world.json.gz`): never delete it; every cycle resumes it.

First read `loop/RULES.md` (metrics, guardrails, paired A/B protocol, priority signals, change policy), `loop/hypotheses.json`, and the last ~20 entries of `loop/CHANGELOG.md`.

1. Baseline batch: `node loop/run-headless.js --ticks=<batch_ticks> --compare=loop/metrics.json` (about 3 minutes with the benchmark).
   - `"pass": false` (guardrail tripped on the resumed state): `git add -A && git commit -m "cycle: INCIDENT at day X"`, add a CHANGELOG entry prefixed `INCIDENT:` with the reasons, `git push origin master`, STOP.
   - `"pass": true`: `git add -A && git commit -m "cycle: batch to day X"` and `git push origin master` immediately. This is the control snapshot.
2. Record the control BEFORE editing code: `node loop/run-headless.js --dry --bench --ticks=<validation_ticks> --out=/tmp/control.json`.
3. Run `node loop/plateau.js`; if it demands a STRUCTURAL cycle, your change must be structural. Pick ONE hypothesis from RULES.md's priority signals. Skip anything in hypotheses.json or CHANGELOG marked `reverted` or `running`. Mark it `running` in `loop/hypotheses.json`.
4. Make ONE small code change implementing it (tunables stay in range; structural changes get a `STRUCTURAL:` CHANGELOG prefix).
5. Treatment from the same snapshot: `node loop/run-headless.js --dry --bench --ticks=<validation_ticks> --compare=/tmp/control.json`. Compare its metrics with `/tmp/control.json`, especially the target signal (`largestCluster`/`brickCells` for construction, `commSeparation` for communication, `benchmark.gap`/`medianFitness` for growth).
6. If `"pass": false` or the target metric is worse than control: `git checkout -- .` to discard the change, set the hypothesis to `reverted`, append a CHANGELOG entry with control vs treatment numbers, commit and push only the CHANGELOG/hypotheses update.
   If `"pass": true` and the target metric is equal or better: CHANGELOG entry with control vs treatment numbers (say plainly when the difference is within noise), hypothesis `kept`, `git add -A && git commit -m "cycle: <summary>"`.
7. `git push origin master`. Every cycle leaves a CHANGELOG entry, including null results.

Fully autonomous: never stop to ask for confirmation. Keep each CHANGELOG entry to a few lines.
