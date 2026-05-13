import { writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const items = [
  [
    "IBBN JIGAWA STATE",
    ["THE FEBRUARY EDITION OF IBBN NOVELTY FOOTBALL MATCH (JIGAWA STATE CHAPTER) WAS A HUGE SUCCESS!"],
    ["ibbnjigawa.jpg", "ibbnjigawa1.jpg"],
  ],
  [
    "IBBN KEBBI STATE",
    [
      "The long awaited Novelty football match between Birnin Tudu Damso FC and Mahuta ward Arsanal was a huge success.",
      "The match which was played at the mini stadium mahuta the headquarters of Fakai local government attracted many dignitaries from the communities particularly because it was one of it’s kind in the local government.",
      "IBBN members were on ground to canvass for new members through the medium of interaction and consultations and the result was tremendous with hundreds registered.",
    ],
    ["ibbnkebbi.jpg", "ibbnkebbi1.jpg"],
  ],
  [
    "Lagos state chapter meeting",
    [
      "Glory be to God for the successful General Meeting of IBBN Lagos Chapter (Lagos West, East & Central Senatorial Districts) and Voters Sensitisation programme. We also wish to appreciate our National Advisory Representative Rev. Shem for joining us in this event and his timely words especially on the present realities.",
    ],
    ["ibbnlagos.jpg", "ibbnlagos1.jpg"],
  ],
  [
    "IBBN AKWA IBOM",
    ["THE FEBRUARY EDITION OF IBBN NOVELTY FOOTBALL MATCH (AKWA IBOM STATE CHAPTER) WAS A HUGE SUCCESS!"],
    ["ibbnakwaibom1.jpg", "ibbnakwaibom.jpg"],
  ],
  [
    "IBBN EKITI STATE",
    ["THE FEBRUARY EDITION OF IBBN NOVELTY FOOTBALL MATCH (EKITI STATE CHAPTER) WAS A HUGE SUCCESS!"],
    ["ibbnekiti.jpg", "ibbnekiti1.jpg"],
  ],
  [
    "IBBN Lagos",
    [
      "It was an exceptionally remarkable and resoundingly successful event as Initiative for a Better and Brighter Nigeria (IBBN) Lagos East hosted its highly anticipated Community Novelty Football Match for Legends.",
      "The thrilling encounter brought together distinguished community figures, passionate football enthusiasts, and supporters in an atmosphere charged with excitement, unity, and exemplary sportsmanship. The display of talent, teamwork, and camaraderie made the occasion truly outstanding and memorable for all in attendance.",
      "__VENUE__Bariga Stadium (CMS)",
      "__TIME__4:00 PM",
      "Beyond the excitement on the pitch, the event served as a powerful platform for community bonding, youth engagement, and social integration. It was a spectacular and fitting way to conclude the month of February ending it on a high note of celebration, unity, and shared purpose.",
      "Indeed, it was not just a football match, but a grand and inspiring gathering that will remain a proud highlight for IBBN Lagos East and the entire community.",
    ],
    ["lagosibbn.jpg", "lagosibbn1.jpg"],
  ],
  [
    "IBBN Jigawa state",
    ["Clean up exercise in Dutse Jigawa State IBBN embarked on a clean up exercise in Dutse Jigawa State over the weekend."],
    ["jigawaibbn1.jpg", "jigawaibbn.jpg"],
  ],
  [
    "IBBN Edo State",
    [
      "IBBN Edo State Novelty Match: Building Bridges Through Football",
      "This impactful initiative reflects the vision of the Initiative for Better and Brighter Nigeria (IBBN), under the leadership of Prophet Dr. Isa El-Buba, using football to foster peace, unity and a shared hope for a better and brighter Nigeria.",
    ],
    ["ibbnedo.jpg", "ibbnedo1.jpg"],
  ],
  [
    "IBBN Kaduna State Novelty Match: Unity on the Pitch, Peace in the Community",
    [
      "The IBBN Kaduna State Novelty Football Match between Gonin Gora Morning Star and Kakuri Academy Kaduna was a powerful expression of togetherness, sportsmanship and shared community pride. The match created a lively and peaceful atmosphere where youths, supporters and leaders came together beyond differences.",
      "Cheers, fair play and mutual respect defined the encounter, showing how football can serve as a common language for unity and healing. Moments like these strengthen relationships at the grassroots and remind us that peace is built when people connect.",
      "This successful outing reflects the commitment of the Initiative for Better and Brighter Nigeria (IBBN), under the leadership of Prophet Dr. Isa El-Buba, to fostering harmony, youth engagement and national unity through positive community initiatives.",
    ],
    ["ibbnkaduna.jpg", "ibbnkaduna1.jpg"],
  ],
  [
    "IBBN Enugu",
    ["IBBN Enugu State Novelty Match: Unity, Joy and Community Spirit"],
    ["ibbnenugu.jpg", "ibbnenugu1.jpg"],
  ],
  [
    "The Role of IBBN in Nigeria’s Governance",
    [
      "As part of the celebrations marking Nigeria’s Independence Day, the Initiative for Better and Brighter Nigeria (IBBN) held a one-day sensitization program in Gombe State.",
      "The program reached 156 individuals, with 100 participants officially registered into the Initiative across five Local Government Areas: Akko, Balanga, Billiri, Kaltungo, and Shongom.",
      "__H__Attendance",
      "__LI__His Excellency Hon. Charles Iliya, former Deputy Governor of Gombe State|His Excellency Kaftin Amuga, former gubernatorial candidate under the Labour Party|Engr. Istifanus Amlai|Hon. Augustine Katty|Hon. Usman Mohammed Alhaji|Sheikh Mohammed Yarima|Rev. Yila Manaja|Among many other respected personalities.",
      "__H__Facilitation and Coordination",
      "__P__The sensitization was facilitated by:",
      "__LI__Amb. Cmrd. Danladi Bako – State Patron|Amb. Ibrahim Garba – State Chairman|Amb. Ayo Solomon – State Coordinator",
      "__P__The event was coordinated by:",
      "__LI__Amb. James Boyi – Contact & Mobilization Officer|Amb. Joji Mailaya – Youth Coordinator",
      "__P__Secretariat support was provided by:",
      "__LI__Amb. Talatu Babayo – Finance Officer|Amb. Simon Esther – Secretariat Staff",
      "__H__Engagement and Resolutions",
      "__P__Participants raised several questions about the Initiative, and detailed responses were provided to ensure clarity and deeper understanding.",
      "__P__At the conclusion of the program, the State Patron directed representatives to establish structures across the LGAs and Wards for more effective implementation.",
    ],
    ["ibbnnews.jpg", "ibbnnew1.jpg"],
  ],
  [
    "IBBN Calls for Action: Support Inclusive Constitutional Reform and Electoral Integrity in Nigeria",
    [
      "The Initiative for Better and Brighter Nigeria (IBBN) commends His Excellency, Governor Caleb Mutfwang, and the Senate Constitution Review Committee for hosting the North Central Public Hearing on the Constitution Review, taking place on Friday 4th and Saturday 5th July 2025 at Crispan Hotel, Jos.",
      "__P__We welcome the forward-thinking proposals to:",
      "__LI__Reserve one legislative seat each in the Senate and House of Representatives for women per state|Allocate three exclusive seats for women in every State House of Assembly|Define and strengthen the role of traditional rulers in governance",
      "These reforms are more than symbolic—they are strategic steps toward a truly inclusive and participatory democracy. However, for any reform to be meaningful, it must go beyond being noted. IBBN calls for the full implementation of these resolutions to ensure they translate into real change at every level of government.",
      "Furthermore, IBBN strongly reiterates the urgent need for comprehensive electoral reforms. A better and brighter Nigeria cannot be built without credible, free, and fair elections where every vote counts and the will of the people is respected.",
      "We therefore urge all citizens—especially women, youth, traditional leaders, and civil society groups—to engage actively in the constitutional review process and continue demanding electoral integrity across the nation.",
      "Together, let us shape a Nigeria that works for all.",
    ],
    ["ibbncall.jpg", "ibbncall1.jpg"],
  ],
  [
    "MAJOR PARTNERSHIPS SEALED IN THE NORTHWEST",
    [
      "We are excited to announce the fruitful outcomes of our recent tour across the Northwestern region, particularly in Kebbi and Kaduna States. The journey marked a new phase of strategic grassroots engagement for the Initiative for Better and Brighter Nigeria (IBBN).",
      "In Kebbi State, we had a historic meeting with all the Christian Traditional Rulers, who warmly received the IBBN vision. Their Royal Majesties expressed deep admiration for the initiative and assured us of their full support. They eagerly look forward to hosting His Eminence, Prophet Isa El-Buba, on his next visit to Kebbi.",
      "Similarly, in Kaduna State, we had the honor of meeting with the Sai Gbagi of Kaduna and his esteemed royal council. In a significant move, the Sai Gbagi was appointed as the Royal Father of IBBN Kaduna State, while his dedicated Secretary—who went above and beyond by breaking protocol to ensure the meeting—was appointed a State Patron of IBBN. They pledged their unwavering support for the movement and are ardent followers of His Eminence, awaiting his visit with great anticipation.",
      "Traditional Rulers are more than cultural custodians—they are gatekeepers of community trust, unity, and influence. At the grassroots level, their voice carries unmatched authority, making them powerful partners in driving meaningful change.",
      "From promoting peace and stability to mobilizing their people for development initiatives, Traditional Rulers play a critical role in shaping values, guiding youth, and fostering social harmony. Any vision for a better Nigeria that ignores their input is incomplete.",
      "To truly transform our nation, we must recognize, respect, and strategically partner with these royal fathers. They are pillars of continuity, wisdom, and leadership rooted in the heart of the people.",
    ],
    ["ibbnne.jpg", "ibbnne1.jpg"],
  ],
];

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderParas(lines) {
  const out = [];
  for (const raw of lines) {
    if (raw.startsWith("__VENUE__")) {
      out.push(
        `            <p class="news-card__meta"><span class="news-card__meta-key">Venue</span> ${esc(raw.slice(9))}</p>`
      );
      continue;
    }
    if (raw.startsWith("__TIME__")) {
      out.push(
        `            <p class="news-card__meta"><span class="news-card__meta-key">Time</span> ${esc(raw.slice(8))}</p>`
      );
      continue;
    }
    if (raw.startsWith("__H__")) {
      out.push(`            <p class="news-card__label">${esc(raw.slice(5))}</p>`);
      continue;
    }
    if (raw.startsWith("__P__")) {
      out.push(`            <p>${esc(raw.slice(5))}</p>`);
      continue;
    }
    if (raw.startsWith("__LI__")) {
      const parts = raw.slice(6).split("|");
      out.push("            <ul class=\"news-card__list\">");
      for (const li of parts) {
        out.push(`              <li>${esc(li.trim())}</li>`);
      }
      out.push("            </ul>");
      continue;
    }
    out.push(`            <p>${esc(raw)}</p>`);
  }
  return out.join("\n");
}

/** Same-folder-relative URLs work with `serve .` and file://; files live in `public/latest news/`. */
const IMG_BASE = "public/latest%20news/";

const chunks = [
  `    <section id="latest-updates" class="section section-news section-alt">`,
  `      <div class="container">`,
  `        <header class="section-head section-head-center news-section-head">`,
  `          <p class="eyebrow">From our chapters</p>`,
  `          <h2 class="section-title">Latest updates</h2>`,
  `          <p class="section-sub">Programmes, matches, mobilisation, and civic engagement across Nigeria.</p>`,
  `        </header>`,
  `        <div class="news-feed" role="feed">`,
];

for (const [title, paras, [imgA, imgB]] of items) {
  const alt1 = esc(`${title} — event photo.`);
  const alt2 = esc(`${title} — second photo.`);
  chunks.push(`          <article class="news-card">`);
  chunks.push(`            <div class="news-card__gallery">`);
  chunks.push(
    `              <figure class="news-card__figure"><img src="${IMG_BASE}${imgA}" alt="${alt1}" loading="lazy" decoding="async" width="1400" height="933" /></figure>`
  );
  chunks.push(
    `              <figure class="news-card__figure"><img src="${IMG_BASE}${imgB}" alt="${alt2}" loading="lazy" decoding="async" width="1400" height="933" /></figure>`
  );
  chunks.push(`            </div>`);
  chunks.push(`            <div class="news-card__body">`);
  chunks.push(`              <h3 class="news-card__title">${esc(title)}</h3>`);
  chunks.push(`              <div class="news-card__prose">`);
  chunks.push(renderParas(paras));
  chunks.push(`              </div>`);
  chunks.push(`            </div>`);
  chunks.push(`          </article>`);
}

chunks.push(`        </div>`, `      </div>`, `    </section>`, ``);

writeFileSync(join(ROOT, "press-news-snippet.html"), chunks.join("\n"), "utf8");
console.log("Wrote press-news-snippet.html");
