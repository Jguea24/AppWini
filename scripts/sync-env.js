const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const envPath = path.join(rootDir, ".env");
const outputPath = path.join(rootDir, "src", "shared", "config", "env.ts");

function parseEnvFile(content) {
  const values = {};
  const lines = content.split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const index = line.indexOf("=");
    if (index === -1) {
      continue;
    }

    const key = line.slice(0, index).trim();
    let value = line.slice(index + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    values[key] = value;
  }

  return values;
}

let apiBaseUrl = "";

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  const parsed = parseEnvFile(envContent);
  apiBaseUrl = (parsed.API_BASE_URL || "").trim();
}

const generated = `// AUTO-GENERATED FILE. DO NOT EDIT.
// Run: npm run sync-env
export const ENV_API_BASE_URL = ${JSON.stringify(apiBaseUrl)};
`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, generated, "utf8");

console.log(
  `[sync-env] API_BASE_URL ${apiBaseUrl ? "loaded from .env" : "not set in .env"}`
);
