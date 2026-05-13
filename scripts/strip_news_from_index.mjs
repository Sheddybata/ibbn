import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const p = join(__dirname, "..", "index.html");
let s = readFileSync(p, "utf8");
const r = /\n    <section id="news"[\s\S]*?\n    <section id="contact"/;
if (!r.test(s)) throw new Error("news block not found");
s = s.replace(r, "\n\n    <section id=\"contact\"");
writeFileSync(p, s);
console.log("Stripped #news from index.html");
