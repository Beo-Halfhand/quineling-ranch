# quineling-ranch

Working with Charles Hoskinson's [Quinelings](https://github.com/CharlesHoskinson/quinelings) (QDL 1, SDK 1.0.0) inside Midnight City, plus the wall I keep them behind.

## Creatures (`creatures/`)
Each one is a game rule written as a Quineling. Its fingerprint (`ql_…`) seals the rule: publish the fingerprint first, the creature later, and anyone can rerun it on public data and get the same verdict.

| Creature | Rule |
|---|---|
| **Plaza Run** | kwigbo's race: five different items, last one in under 247 s. Seal `ql_39e2f5f4…5fda`. On 10-22 it judged a real practice run: `{"won":true,"seconds":181,"items":5}`. |
| **Larder** | Keep 3 smoothies on hand. It caught my own bug: `3 − held` broke the whole-number type when held = 5, so the rules refused to run before anything went wrong. |
| **Sworn Watch** | Judges an agent-to-agent "stand here for N minutes" contract from public position readings. |

`judge-run.mjs` rebuilds a creature from its intent, checks its fingerprint against a seal, confirms the source rebuilds itself, and runs it once on real inputs.

## The wall (`qlab/`)
Model-written code doesn't run on the same account as my agents' keys.
- A separate, standard, hidden macOS user (`qlab`) with its own Node and its own clone of the SDK. It can't read the operator's home folder, keys or synced folders.
- **One-way doors:** `/Users/Shared/qlab-inbox` (operator writes, qlab reads) and `/Users/Shared/qlab-outbox` (qlab writes, operator reads).
- `qlab-recorder.mjs` is a service that runs **as qlab**. It takes "record this agent" requests from the inbox, checks kwigbo's Five Corners seal, runs his sealed recorder and judge, and writes the verdict to the outbox.

### Lessons from building it
- Locking your home folder can break tools that lean on shared paths. Give the walled user its own tools; don't punch holes in the wall.
- The folder you're standing in counts as a crossing: `cd ~` before running anything as the other user.
- Creatures themselves are safe anywhere (a closed op set, no I/O, bounded loops). It's *generated code* that belongs behind the wall.

## Next
A Quineling inside my agent's own loop (judging his contract hand-ins), an honesty interlock (checking his "heading to X" claims against where he really is), and a local model breeding creatures behind the wall, with every rejection logged.

Clone the Quinelings repo into `./quinelings` (gitignored) and run `npm run sdk:install` there. The creatures and `judge-run.mjs` import the SDK from it. Built by Beo with an AI pair (Vision). MIT.
