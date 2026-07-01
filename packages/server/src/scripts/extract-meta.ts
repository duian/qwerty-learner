/**
 * extract-meta.ts
 * Parses packages/web/src/resources/dictionary.ts statically (no import)
 * to extract DictionaryResource array entries, then writes dictionary-meta.json.
 *
 * Run via: pnpm --filter @qwerty-learner/server extract-meta
 */
import * as fs from "fs";
import * as path from "path";

// When run via pnpm --filter, cwd is packages/server
const PKG_ROOT = process.cwd();
const WORKSPACE_ROOT = path.resolve(PKG_ROOT, "../..");

const DICT_TS_PATH = path.resolve(
  WORKSPACE_ROOT,
  "packages/web/src/resources/dictionary.ts"
);
const OUTPUT_PATH = path.resolve(PKG_ROOT, "src/scripts/dictionary-meta.json");

interface DictMeta {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  url: string;
  length: number;
  language: string;
  languageCategory: string;
}

function stripComments(source: string): string {
  // Remove single-line comments (// ...) but be careful with URLs
  // Simple approach: remove lines that start with optional whitespace + //
  return source
    .split("\n")
    .map((line) => {
      // If the line starts with optional whitespace then //, blank it
      if (/^\s*\/\//.test(line)) return "";
      return line;
    })
    .join("\n");
}

function parseTagsArray(val: string): string[] {
  const matches = val.match(/['"]([^'"]*)['"]/g);
  if (!matches) return [];
  return matches.map((m) => m.slice(1, -1));
}

function parseBlock(block: string): DictMeta | null {
  function extractField(fieldName: string): string | null {
    const re = new RegExp(
      `\\b${fieldName}\\s*:\\s*(['"])((?:\\\\.|[^\\\\])*?)\\1`
    );
    const m = block.match(re);
    return m ? m[2] : null;
  }

  function extractNumber(fieldName: string): number | null {
    const re = new RegExp(`\\b${fieldName}\\s*:\\s*(\\d+)`);
    const m = block.match(re);
    return m ? parseInt(m[1], 10) : null;
  }

  function extractTags(): string[] {
    const re = /\btags\s*:\s*\[([^\]]*)\]/;
    const m = block.match(re);
    if (!m) return [];
    return parseTagsArray(m[1]);
  }

  const id = extractField("id");
  const name = extractField("name");
  const url = extractField("url");
  const length = extractNumber("length");
  const language = extractField("language");
  const languageCategory = extractField("languageCategory");
  const description = extractField("description");
  const category = extractField("category");
  const tags = extractTags();

  if (!id || !name || !url || length === null || !language) return null;

  return {
    id,
    name,
    description: description ?? "",
    category: category ?? "",
    tags,
    url,
    length,
    language,
    languageCategory: languageCategory ?? language,
  };
}

function main() {
  if (!fs.existsSync(DICT_TS_PATH)) {
    console.error(`Cannot find dictionary.ts at ${DICT_TS_PATH}`);
    process.exit(1);
  }

  const rawSource = fs.readFileSync(DICT_TS_PATH, "utf-8");
  // Strip commented-out lines so we don't pick up commented entries
  const source = stripComments(rawSource);

  const results: DictMeta[] = [];

  // Bracket-matching to find all object literals that look like DictionaryResource entries
  let i = 0;
  while (i < source.length) {
    if (source[i] === "{") {
      let depth = 1;
      let j = i + 1;
      while (j < source.length && depth > 0) {
        if (source[j] === "{") depth++;
        else if (source[j] === "}") depth--;
        j++;
      }
      const block = source.slice(i + 1, j - 1);

      // Only process blocks that look like DictionaryResource entries
      if (
        /\bid\s*:/.test(block) &&
        /\burl\s*:/.test(block) &&
        /\blength\s*:/.test(block)
      ) {
        const meta = parseBlock(block);
        if (meta) {
          results.push(meta);
        }
      }
      i = j;
    } else {
      i++;
    }
  }

  // Deduplicate by id (keep last occurrence since source has a few duplicates with wrong data)
  const seen = new Map<string, DictMeta>();
  for (const m of results) {
    seen.set(m.id, m); // last one wins — source dupes have the correct url for the later entry
  }
  const unique = Array.from(seen.values());

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(unique, null, 2), "utf-8");
  console.log(
    `Extracted ${unique.length} dictionary metadata entries to ${OUTPUT_PATH}`
  );

  // Warn about duplicates
  if (results.length > unique.length) {
    const ids: Record<string, number> = {};
    for (const m of results) {
      ids[m.id] = (ids[m.id] ?? 0) + 1;
    }
    for (const [id, count] of Object.entries(ids)) {
      if (count > 1)
        console.warn(
          `  WARNING: duplicate id '${id}' (${count} times) — kept last`
        );
    }
  }
}

main();
