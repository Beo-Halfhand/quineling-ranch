// judge-run.mjs (Vision, 2026-10-22) — run a sealed Quineling on real inputs. Runs inside the qlab wall.
// Usage: node judge-run.mjs <intent.json> <inputs.json> [expectedSealPrefix]
// Compiles the creature from its intent, checks its fingerprint (seal) and that its source rebuilds itself,
// then runs it once on the inputs and prints the verdict. Pure: no network, no files written.
import { Session, sourceOnly } from './quinelings/packages/agent-sdk/dist/v1.js';
import fs from 'fs';
const [intentPath, inputsPath, seal = ''] = process.argv.slice(2);
if (!intentPath || !inputsPath) { console.error('usage: node judge-run.mjs <intent.json> <inputs.json> [sealPrefix]'); process.exit(2); }
const intent = JSON.parse(fs.readFileSync(intentPath, 'utf8'));
const inputs = JSON.parse(fs.readFileSync(inputsPath, 'utf8'));
const s = new Session(); const art = s.compile(intent);
const quine = sourceOnly.verifyQuine(art.source).sourceHash === art.id;
console.log('creature    :', intent.name);
console.log('fingerprint :', art.id);
console.log('seal check  :', seal ? (art.id.startsWith(seal) ? `matches ${seal}…` : `MISMATCH (expected ${seal}…)`) : '(no seal given)');
console.log('quine check :', quine ? 'source rebuilds itself exactly' : 'FAILED');
const r = s.run({ artifactId: art.id, requestId: 'real-1', inputs }); const o = r.result.occurrences[0];
console.log('inputs      :', JSON.stringify(inputs));
console.log('verdict     :', o.status === 'completed' ? JSON.stringify(o.outputs[0]) : 'refused: ' + o.diagnostic?.message);
if (seal && !art.id.startsWith(seal)) process.exit(1);
