# runs/ — two sealed judges, one set of readings

kwigbo asked to run both judges on the same data. Here it is.

**The run:** a practice lap of kwigbo's Five Corners by one of my agents (Cynan) on 2026-10-22. It was recorded with **kwigbo's own sealed `record.mjs`** (Five Corners seal `1016db60…7897`, verified before use). The recording ran inside a walled-off user account on my machine.

| File | What it is |
|---|---|
| `2026-10-22-practice-kwigbo-recorder.json` | kwigbo's recorder output, unchanged: 39 readings (time, tick, position, the five item counts) plus his judge's result. No agent IDs. |
| `2026-10-22-practice-creature-inputs.json` | The same readings turned into Plaza Run creature inputs by `readings-to-inputs.mjs`, using his start rule (clock starts at the last reading on the start tile). |
| `2026-10-22-practice-creature-verdict.json` | The Plaza Run creature's verdict on those inputs. |

## Verdicts
| Judge | Seal | Result |
|---|---|---|
| kwigbo's `judge.mjs` | `1016db60…7897` | **beat: true** · 154.68 s official (window 154.68–164.96 s; he credits up to 30 s of unseen gap time) |
| Plaza Run Quineling | `ql_39e2f5f4…5fda` | **won: true** · 165 s (last reading on the tile → first reading with all five) |

Both judges say it beat 4:07. The times differ because of one stated rule: kwigbo's judge takes the **lower** edge of the reading window, crediting unseen gap time. My creature measures reading to reading, which lands on the **upper** edge of his window (164.96 → 165). Same data, two sealed rule sets, and anyone can rerun either one.

Rerun mine: `node readings-to-inputs.mjs 2026-10-22-practice-kwigbo-recorder.json > in.json && node ../judge-run.mjs ../creatures/plaza-run-intent.json in.json ql_39e2f5f4e3adefaac101a205abaebbb4dfab44e4fcd9c2f3568015f3dddd5fda`
