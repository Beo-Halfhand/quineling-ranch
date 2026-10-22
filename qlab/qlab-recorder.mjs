// qlab-recorder.mjs v0.1 (Vision, 2026-10-22) — runs AS qlab (LaunchDaemon com.example.qlab-recorder, every 15 s, one at a time).
// One-way doors: reads requests from /Users/Shared/qlab-inbox/record-*.json (the operator's side writes them),
// writes verdicts to /Users/Shared/qlab-outbox/<tag>.json (only qlab writes there; the operator's side reads).
// For each new request {tag, agentId, minutes, every}: verify kwigbo's Five Corners seal (SEAL.sha256 files + the published
// game hash), run his record.mjs until it sees the finish (or time runs out), run his judge.mjs, write the verdict.
// No keys; the agent ID is a public game ID. Never touches the operator's files.
import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync, appendFileSync } from 'fs';
import { spawnSync } from 'child_process';
import { createHash } from 'crypto';
import { join } from 'path'; import { homedir } from 'os';
const H = homedir(), IN = '/Users/Shared/qlab-inbox', OUT = '/Users/Shared/qlab-outbox';
const GAME = join(H, 'midnight-city-games/five-corners'), DONE = join(H, 'lab/kw/done.txt'), NODE = process.execPath;
const PUBLISHED = '1016db60306e1e194bd5fffb091ae376cec07d244a0c9e20e27581d809ee7897';
mkdirSync(join(H, 'lab/kw'), { recursive: true });
const done = new Set(existsSync(DONE) ? readFileSync(DONE, 'utf8').split('\n').filter(Boolean) : []);
const sha = (f) => createHash('sha256').update(readFileSync(f)).digest('hex');
function sealCheck() {
  try { const lines = readFileSync(join(GAME, 'SEAL.sha256'), 'utf8').trim().split('\n');
    const files = lines.map((l) => { const [h, f] = l.trim().split(/\s+\*?/); return { f, ok: sha(join(GAME, f)) === h }; });
    return { filesOk: files.every((x) => x.ok), files, sealMatchesPublished: sha(join(GAME, 'SEAL.sha256')) === PUBLISHED }; }
  catch (e) { return { filesOk: false, error: e.message }; } }
const reqs = existsSync(IN) ? readdirSync(IN).filter((f) => /^record-[\w-]+\.json$/.test(f)).sort() : [];
for (const f of reqs) {
  if (done.has(f)) continue; appendFileSync(DONE, f + '\n'); done.add(f);
  let r; try { r = JSON.parse(readFileSync(join(IN, f), 'utf8')); } catch { continue; }
  const tag = String(r.tag || f.slice(7, -5)).replace(/[^\w-]/g, ''), id = String(r.agentId || '');
  if (!/^user-agent-[a-z0-9-]+$/.test(id)) { writeFileSync(join(OUT, `${tag}.json`), JSON.stringify({ tag, error: 'bad agentId' }) + '\n'); continue; }
  const seal = sealCheck(); const rec = join(H, 'lab/kw', `${tag}.json`);
  const minutes = Math.min(Number(r.minutes) || 15, 30), every = Math.max(Number(r.every) || 5, 5);
  const t0 = Date.now(); console.log(`[${new Date().toISOString()}] ${tag}: recording (${minutes} min max, every ${every} s) · seal ${seal.filesOk && seal.sealMatchesPublished ? 'OK' : 'NOT OK'}`);
  spawnSync(NODE, ['record.mjs', id, '--every', String(every), '--minutes', String(minutes), '--out', rec], { cwd: GAME, encoding: 'utf8', timeout: (minutes + 1) * 60_000 });
  const j = spawnSync(NODE, ['judge.mjs', 'rules.json', rec], { cwd: GAME, encoding: 'utf8', timeout: 30_000 });
  let verdict = null; try { verdict = JSON.parse(j.stdout); } catch { verdict = { error: (j.stderr || 'judge gave no JSON').slice(0, 300) }; }
  writeFileSync(join(OUT, `${tag}.json`), JSON.stringify({ tag, at: new Date().toISOString(), recordedFor: Math.round((Date.now() - t0) / 1000), seal, verdict }, null, 2) + '\n');
  console.log(`[${new Date().toISOString()}] ${tag}: verdict ${JSON.stringify(verdict).slice(0, 200)}`);
}
