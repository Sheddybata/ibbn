import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnvFile(filePath) {
  let text;
  try {
    text = readFileSync(filePath, "utf8");
  } catch {
    return;
  }
  text.split(/\r?\n/).forEach(function (line) {
    var trimmed = line.trim();
    if (!trimmed || trimmed.charAt(0) === "#") return;
    var i = trimmed.indexOf("=");
    if (i === -1) return;
    var key = trimmed.slice(0, i).trim();
    var value = trimmed.slice(i + 1).trim();
    if (
      (value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') ||
      (value.charAt(0) === "'" && value.charAt(value.length - 1) === "'")
    ) {
      value = value.slice(1, -1);
    }
    if (key && process.env[key] == null) process.env[key] = value;
    else if (key && process.env[key] === "") process.env[key] = value;
  });
}

loadEnvFile(join(root, ".env"));
loadEnvFile(join(root, ".env.local"));

const url = process.env.SUPABASE_URL || "";
const key = process.env.SUPABASE_ANON_KEY || "";

const body = `window.IBBN_CONFIG = {
  supabaseUrl: ${JSON.stringify(url)},
  supabaseAnonKey: ${JSON.stringify(key)},
};
`;

writeFileSync(join(root, "config.js"), body, "utf8");
console.log(url ? "Wrote config.js with Supabase URL" : "Wrote config.js (Supabase keys empty)");
