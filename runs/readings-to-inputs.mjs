// readings-to-inputs.mjs — turn a kwigbo record.mjs recording into Plaza Run creature inputs, using HIS start rule:
// start = the last reading on the start tile (central 79,61, radius 1); each item = first later reading where its count
// is above the count at that start reading. Seconds are rounded. Usage: node readings-to-inputs.mjs <recording.json>
import fs from 'fs';
const d = JSON.parse(fs.readFileSync(process.argv[2], 'utf8')), R = d.readings;
const on = (r) => r.position.spaceId === 'central' && Math.abs(r.position.x - 79) + Math.abs(r.position.y - 61) <= 1;
let last = null; for (let i = 0; i < R.length; i++) { if (on(R[i])) last = i; else if (last !== null) break; }
if (last === null) throw new Error('runner never seen on the start tile');
const base = R[last].counts, t0 = Date.parse(R[last].t);
const gathers = [];
for (const item of ['fish', 'rooftop_tomato', 'skybridge_cable', 'static_charge', 'ore']) {
  const r = R.slice(last + 1).find((x) => x.counts[item] > base[item]);
  if (r) gathers.push({ item, at: Math.round((Date.parse(r.t) - t0) / 1000) }); }
gathers.sort((a, b) => a.at - b.at);
console.log(JSON.stringify({ start: 0, gathers }, null, 2));
