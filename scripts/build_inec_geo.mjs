import { mkdirSync, writeFileSync } from "fs";
import { createRequire } from "module";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = join(root, "node_modules", "nigerian-states-lgas-and-polling-units", "data");

const states = require(join(pkg, "states.json"));
const lgas = require(join(pkg, "lgas.json"));
const wards = require(join(pkg, "wards.json"));
const unitsByWard = require(join(pkg, "polling-units-by-ward.json"));

function title(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/\b([a-z])/g, (m) => m.toUpperCase())
    .replace(/\s+/g, " ")
    .trim();
}

const outDir = join(root, "data", "inec");
mkdirSync(outDir, { recursive: true });

const lgasByState = new Map();
for (const lga of lgas) {
  const list = lgasByState.get(lga.state_id) || [];
  list.push(lga);
  lgasByState.set(lga.state_id, list);
}

const wardsByLga = new Map();
for (const ward of wards) {
  const list = wardsByLga.get(ward.lga_id) || [];
  list.push(ward);
  wardsByLga.set(ward.lga_id, list);
}

const index = states
  .map((s) => ({ id: s.id, name: title(s.state_name) }))
  .sort((a, b) => a.name.localeCompare(b.name));

writeFileSync(join(outDir, "states.json"), JSON.stringify(index));

let wardCount = 0;
let unitCount = 0;

for (const state of states) {
  const stateLgas = (lgasByState.get(state.id) || [])
    .slice()
    .sort((a, b) => a.local_government_name.localeCompare(b.local_government_name))
    .map((lga) => {
      const stateWards = (wardsByLga.get(lga.id) || [])
        .slice()
        .sort((a, b) => a.ward_name.localeCompare(b.ward_name))
        .map((ward) => {
          wardCount += 1;
          const units = (unitsByWard[String(ward.id)] || []).map((u) => title(u.name));
          unitCount += units.length;
          return { id: ward.id, name: title(ward.ward_name), units };
        });
      return { id: lga.id, name: title(lga.local_government_name), wards: stateWards };
    });

  const payload = { id: state.id, name: title(state.state_name), lgas: stateLgas };
  writeFileSync(join(outDir, "state-" + state.id + ".json"), JSON.stringify(payload));
}

console.log(
  "Wrote data/inec —",
  index.length,
  "states,",
  wardCount,
  "wards,",
  unitCount,
  "polling units"
);
