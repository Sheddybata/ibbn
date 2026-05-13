import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const path = join(root, "leadership.html");

const nationalRoles = [
  "National Chairman",
  "Director General",
  "National secretary",
  "Assistant National secretary",
  "Contact and mobilization",
  "Deputy contact and mobilization",
  "Director Women Affairs",
  "Deputy Director Women Affairs",
  "Director youth wing",
  "Deputy Director youth",
  "Media and Publicity",
  "Deputy Dir. Media & Publicity",
  "Director Legal Affairs",
  "Deputy Dir. Legal Affairs",
  "Director Monitoring and Evaluation",
  "Deputy Dir. Monitoring and Evaluation",
  "Director ICT/Social Media",
  "Deputy Dir. ICT/Social Media",
  "Director Inter-Organization",
  "Deputy Dir. Inter-Organization",
  "Director Defense, Security and Protocol",
  "Deputy Dir. Defense, Security and Protocol",
  "Director Community Development",
  "Deputy Dir. Community Development",
  "Director Finance and Accountability",
  "Deputy Dir. Finance and Accountability",
  "Director Welfare",
  "Deputy Dir. Welfare",
  "Director Prayers and Supplication",
  "Deputy Dir. Prayers and Supplication",
  "Director of Programmes",
  "Deputy Director of Programmes",
  "Director Strategy, Research and Development",
  "Deputy Director Strategy, Research and Development",
  "Director Health and Mental Services",
  "Deputy Director Health and Mental Services",
];

const stateRoles = [
  "State Advisory Council",
  "State coordinator",
  "Deputy State coordinator",
  "Secretary",
  "Assistant Secretary",
  "Contact and Mobilization",
  "Deputy Contact and Mobilization",
  "Coordinator Women Affairs",
  "Deputy Coordinator Women Affairs",
  "Coordinator Youth",
  "Deputy Coordinator Youth",
  "Media and Publicity",
  "Deputy Co-ord. Media & Publicity",
  "Coordinator Legal Affairs",
  "Deputy Co-Legal Affairs",
  "Coordinator Monitoring and Evaluation",
  "Deputy Co-ord. Monitoring & Evaluation",
  "Coordinator Inter-Organization",
  "Deputy Co-ord. Inter-Organization",
  "Coordinator ICT/Social Media",
  "Deputy Co-ord. ICT/Social Media",
  "Coordinator Defense, Security and Protocol",
  "Deputy Co-ord. Defense, Security and Protocol",
  "Coordinator Community Development",
  "Deputy Co-ord. Community Development",
  "Coordinator Finance and Accountability",
  "Deputy Co-ord. Finance and Accountability",
  "Coordinator Welfare",
  "Deputy Co-ord. Welfare",
  "Coordinator Prayers and Supplication",
  "Deputy Co-ord. Prayers and Supplication",
];

const localGovRoles = [
  "Local Advisory Council",
  "Local coordinator",
  "Deputy Local Coordinator",
  "Secretary",
  "Assistant Secretary",
  "Contact and Mobilization",
  "Deputy Contact and Mobilization",
  "Coordinator Women Affairs",
  "Deputy Coordinator Women Affairs",
  "Coordinator Youth",
  "Deputy Coordinator Youth Wing",
  "Media and Publicity",
  "Deputy Co-ord. Media & Publicity",
  "Coordinator Legal Affairs",
  "Deputy Co-Legal Affairs",
  "Coordinator Monitoring and Evaluation",
  "Deputy Co-ord. Monitoring & Evaluation",
  "Coordinator Inter-Organization",
  "Deputy Co-ord. Inter-Organization",
  "Coordinator ICT/Social Media",
  "Deputy Co-ord. ICT/Social Media",
  "Coordinator Defense, Security and Protocol",
  "Deputy Co-ord. Defense, Security and Protocol",
  "Coordinator Community Development",
  "Deputy Co-ord. Community Development",
  "Coordinator Finance and Accountability",
  "Deputy Co-ord. Finance and Accountability",
  "Coordinator Welfare",
  "Deputy Co-ord. Welfare",
  "Coordinator Prayers and Supplication",
  "Deputy Co-ord. Prayers and Supplication",
];

const wardRoles = [...localGovRoles];

function splitOl(items, mid) {
  const a = items.slice(0, mid);
  const b = items.slice(mid);
  const startB = mid + 1;
  return `<div class="org-split">
          <div class="org-split-col">
            <ol>
${a.map((t) => `              <li>${escapeHtml(t)}</li>`).join("\n")}
            </ol>
          </div>
          <div class="org-split-col">
            <ol start="${startB}">
${b.map((t) => `              <li>${escapeHtml(t)}</li>`).join("\n")}
            </ol>
          </div>
        </div>`;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const orgHtml = `        <header class="section-head section-head-spaced" id="org-structure">
          <h2 class="section-title">Organisation structure</h2>
          <p class="section-sub">
            IBBN spans national leadership through grassroots polling units. Use the shortcuts below; long lists stay inside expandable panels so the page stays readable. Principal officeholders are not named here yet—only official portfolios and tiers.
          </p>
        </header>

        <div class="org-structure">
          <nav class="org-jump" aria-label="Organisation sections">
            <span class="org-jump-label">Jump to</span>
            <a href="#org-governance-tiers">Governance tiers</a>
            <span aria-hidden="true">·</span>
            <a href="#org-national-roles">National portfolios</a>
            <span aria-hidden="true">·</span>
            <a href="#org-state">State executives</a>
            <span aria-hidden="true">·</span>
            <a href="#org-local">Local government</a>
            <span aria-hidden="true">·</span>
            <a href="#org-ward">Ward executives</a>
          </nav>

          <div class="org-overview" id="org-governance-tiers">
            <h3 class="org-overview-title">Governance tiers (national → grassroots)</h3>
            <ol class="org-tier-list">
              <li>Board of Trust (BOT)</li>
              <li>National Chairman</li>
              <li>National Advisory Council (NAC)</li>
              <li>Director General</li>
              <li>
                Deputy Director General (DDG)
                <ol class="org-ddg-sub">
                  <li>DDG 1 — Programmes, Strategy and Development</li>
                  <li>DDG 2 — Administration &amp; Finance</li>
                </ol>
              </li>
              <li>National Directors</li>
              <li>Regional Leaders (RAC/SEC)</li>
              <li>State Leaders (SAC/SEC)</li>
              <li>Senatorial Zones (ZAC/ZEC)</li>
              <li>Local Government (LAC/LEC)</li>
              <li>Wards (WAC/WEC)</li>
              <li>Polling Units (PAC/PEC)</li>
            </ol>
          </div>

          <details class="org-details" id="org-national-roles">
            <summary class="org-summary">
              National portfolios &amp; directorates
              <span class="org-summary-count">${nationalRoles.length} roles</span>
            </summary>
            <div class="org-details-body">
              <p class="org-details-intro">
                National executive and director portfolios (principal office plus deputy where listed).
              </p>
              ${splitOl(nationalRoles, 18)}
            </div>
          </details>

          <details class="org-details" id="org-state">
            <summary class="org-summary">
              State executives
              <span class="org-summary-count">${stateRoles.length} roles</span>
            </summary>
            <div class="org-details-body">
              <p class="org-details-intro">
                State Advisory Council (SAC) structure and coordinating roles.
              </p>
              ${splitOl(stateRoles, 16)}
            </div>
          </details>

          <details class="org-details" id="org-local">
            <summary class="org-summary">
              Local government executives
              <span class="org-summary-count">${localGovRoles.length} roles</span>
            </summary>
            <div class="org-details-body">
              <p class="org-details-intro">
                Local Advisory Council (LAC) and local coordinator roles.
              </p>
              ${splitOl(localGovRoles, 16)}
            </div>
          </details>

          <details class="org-details" id="org-ward">
            <summary class="org-summary">
              Ward executives
              <span class="org-summary-count">${wardRoles.length} roles</span>
            </summary>
            <div class="org-details-body">
              <p class="org-details-intro">
                Ward Advisory Council (WAC) and ward-level coordinating roles.
              </p>
              ${splitOl(wardRoles, 16)}
            </div>
          </details>
        </div>`;

let html = readFileSync(path, "utf8");
const pattern =
  /        <header class="section-head section-head-spaced">\s*[\s\S]*?<\/ul>\s*\n\s*<\/div>\s*\n\s*<\/section>/;
if (!pattern.test(html)) {
  console.error("patch_leadership_org: could not find organisation block to replace");
  process.exit(1);
}
html = html.replace(pattern, `${orgHtml}\n      </div>\n    </section>`);
writeFileSync(path, html, "utf8");
console.log("Patched leadership.html organisation structure");
