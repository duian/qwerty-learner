/**
 * import-dicts.ts
 * Bulk-imports all 376 dictionaries and their words from the web package's public/dicts/
 * into the SQLite database using @libsql/client directly (for speed).
 *
 * Run via: pnpm --filter @qwerty-learner/server import-dicts
 * Prerequisites: run extract-meta first to generate dictionary-meta.json
 */
import { createClient } from "@libsql/client";
import * as fs from "fs";
import * as path from "path";
// Use process.cwd()-relative paths since tsx may run from the package root
// When run via pnpm --filter, cwd is packages/server
const PKG_ROOT = process.cwd(); // packages/server
const WORKSPACE_ROOT = path.resolve(PKG_ROOT, "../.."); // repo root
const DB_PATH = path.resolve(PKG_ROOT, "data/qwerty.db");
const DICTS_DIR = path.resolve(WORKSPACE_ROOT, "packages/web/public/dicts");
const META_PATH = path.resolve(PKG_ROOT, "src/scripts/dictionary-meta.json");
async function main() {
  if (!fs.existsSync(META_PATH)) {
    console.error(`dictionary-meta.json not found at ${META_PATH}`);
    console.error("Run: pnpm --filter @qwerty-learner/server extract-meta");
    process.exit(1);
  }
  const client = createClient({ url: `file:${DB_PATH}` });
  console.log(`Using DB: ${DB_PATH}`);
  console.log(`Dicts dir: ${DICTS_DIR}`);
  const metas = JSON.parse(fs.readFileSync(META_PATH, "utf-8"));
  console.log(`Found ${metas.length} dictionaries to import`);
  // Enable WAL for performance
  await client.execute("PRAGMA journal_mode = WAL");
  await client.execute("PRAGMA synchronous = NORMAL");
  // Clear existing data (idempotent)
  console.log("Clearing existing data...");
  await client.execute("DELETE FROM wordbook_words");
  await client.execute("DELETE FROM favorites");
  await client.execute("DELETE FROM words");
  await client.execute("DELETE FROM dictionaries");
  const now = Date.now();
  let totalDicts = 0;
  let totalWords = 0;
  let skipped = 0;
  for (const meta of metas) {
    // url looks like /dicts/CET4_T.json → strip leading /dicts/
    const jsonFileName = meta.url.replace(/^\/dicts\//, "");
    const jsonPath = path.join(DICTS_DIR, jsonFileName);
    if (!fs.existsSync(jsonPath)) {
      console.warn(`  SKIP ${meta.id}: file not found (${jsonFileName})`);
      skipped++;
      continue;
    }
    let wordsData;
    try {
      wordsData = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
    } catch (e) {
      console.warn(`  SKIP ${meta.id}: failed to parse ${jsonFileName} — ${e}`);
      skipped++;
      continue;
    }
    // Build batch statements for this dictionary
    const statements = [];
    statements.push({
      sql: `INSERT INTO dictionaries (id, name, description, category, language, language_category, tags, word_count, user_id, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?)`,
      args: [
        meta.id,
        meta.name,
        meta.description,
        meta.category,
        meta.language,
        meta.languageCategory,
        JSON.stringify(meta.tags),
        wordsData.length,
        now,
        now,
      ],
    });
    for (let i = 0; i < wordsData.length; i++) {
      const word = wordsData[i];
      // Skip words missing required fields (some dicts have malformed entries)
      if (!word.name) continue;
      const trans = Array.isArray(word.trans)
        ? word.trans
        : word.trans
        ? [word.trans]
        : [];
      statements.push({
        sql: `INSERT INTO words (dict_id, name, trans, usphone, ukphone, notation, sort_order)
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [
          meta.id,
          word.name,
          JSON.stringify(trans),
          word.usphone ?? null,
          word.ukphone ?? null,
          word.notation ?? null,
          i,
        ],
      });
    }
    // @libsql/client batch executes all statements in a single round-trip
    await client.batch(statements, "write");
    totalDicts++;
    totalWords += wordsData.length;
    process.stdout.write(
      `\r  Imported ${totalDicts}/${
        metas.length - skipped
      } dicts, ${totalWords} words...`
    );
  }
  console.log(`\n\nDone!`);
  console.log(`  Dictionaries imported: ${totalDicts}`);
  console.log(`  Words imported:        ${totalWords}`);
  if (skipped > 0) {
    console.log(`  Skipped:               ${skipped}`);
  }
  client.close();
}
main().catch((err) => {
  console.error("Import failed:", err);
  process.exit(1);
});
