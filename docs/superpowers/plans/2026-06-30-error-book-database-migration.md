# Error Book Database Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate typing records (word records, chapter records, review records) from frontend Dexie/IndexedDB to the server SQLite database, making the error book and progress data persistent across browsers.

**Architecture:** Add three new tables to the server schema mirroring the existing Dexie tables. Create CRUD API endpoints following the existing controller-service pattern. Replace the frontend Dexie reads/writes with API calls via the existing `api.ts` utility. Remove Dexie dependency once migration is complete.

**Tech Stack:** Drizzle ORM (SQLite), Express controllers/services, SWR for frontend data fetching, axios for mutations

## Global Constraints

- Package manager: pnpm (no yarn/npm commands)
- Server response format: `{ success: true, data: ... }` or `{ success: false, message: "..." }`
- Controllers use arrow function class properties with try/catch wrapping
- Services are plain classes with async methods using Drizzle query builders
- Timestamps stored as integer (epoch milliseconds via `Date.now()`)
- JSON fields stored as `text` columns, serialized/deserialized at the service layer
- No authentication — `userId` fields remain `null` for now
- Frontend path alias: `@/` → `packages/web/src/`

---

### Task 1: Add Database Tables (Server Schema)

**Files:**

- Modify: `packages/server/src/models/schema.ts`

**Interfaces:**

- Consumes: existing schema patterns (sqliteTable, integer, text, index)
- Produces: `wordRecords`, `chapterRecords`, `reviewRecords` tables available for Drizzle queries

- [ ] **Step 1: Add wordRecords table to schema.ts**

```typescript
export const wordRecords = sqliteTable(
  "word_records",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    word: text("word").notNull(),
    dict: text("dict").notNull(),
    chapter: integer("chapter"),
    timing: text("timing").notNull(), // JSON array of numbers
    wrongCount: integer("wrong_count").notNull().default(0),
    mistakes: text("mistakes").notNull().default("{}"), // JSON object
    timeStamp: integer("time_stamp").notNull(),
    userId: text("user_id"),
  },
  (table) => ({
    dictChapterIdx: index("idx_word_records_dict_chapter").on(
      table.dict,
      table.chapter
    ),
    wrongCountIdx: index("idx_word_records_wrong_count").on(table.wrongCount),
    wordDictIdx: index("idx_word_records_word_dict").on(table.word, table.dict),
  })
);
```

- [ ] **Step 2: Add chapterRecords table to schema.ts**

```typescript
export const chapterRecords = sqliteTable(
  "chapter_records",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    dict: text("dict").notNull(),
    chapter: integer("chapter"),
    timeStamp: integer("time_stamp").notNull(),
    time: integer("time").notNull(), // seconds spent
    correctCount: integer("correct_count").notNull().default(0),
    wrongCount: integer("wrong_count").notNull().default(0),
    wordCount: integer("word_count").notNull().default(0),
    wordNumber: integer("word_number").notNull().default(0),
    correctWordIndexes: text("correct_word_indexes").notNull().default("[]"), // JSON array
    wordRecordIds: text("word_record_ids").notNull().default("[]"), // JSON array
    userId: text("user_id"),
  },
  (table) => ({
    dictChapterIdx: index("idx_chapter_records_dict_chapter").on(
      table.dict,
      table.chapter
    ),
  })
);
```

- [ ] **Step 3: Add reviewRecords table to schema.ts**

```typescript
export const reviewRecords = sqliteTable(
  "review_records",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    dict: text("dict").notNull(),
    index: integer("index").notNull().default(0),
    createTime: integer("create_time").notNull(),
    isFinished: integer("is_finished", { mode: "boolean" })
      .notNull()
      .default(false),
    words: text("words").notNull().default("[]"), // JSON array of Word objects
    userId: text("user_id"),
  },
  (table) => ({
    dictFinishedIdx: index("idx_review_records_dict_finished").on(
      table.dict,
      table.isFinished
    ),
  })
);
```

- [ ] **Step 4: Generate and push migration**

```bash
cd packages/server
pnpm db:push
```

Expected: Schema changes applied to SQLite database.

- [ ] **Step 5: Commit**

```bash
git add packages/server/src/models/schema.ts
git commit -m "feat(server): add word_records, chapter_records, review_records tables"
```

---

### Task 2: Create Record Service (Server)

**Files:**

- Create: `packages/server/src/services/record.service.ts`

**Interfaces:**

- Consumes: `wordRecords`, `chapterRecords`, `reviewRecords` from schema; `db` from models
- Produces: `RecordService` class with methods:

  - `addWordRecord(data): Promise<number>` — returns inserted ID
  - `getWordRecordsWithErrors(dict?: string): Promise<rows[]>` — wrongCount > 0
  - `deleteWordRecordsByWordAndDict(word, dict): Promise<void>`
  - `addChapterRecord(data): Promise<number>`
  - `getChapterRecords(dict?, chapter?): Promise<rows[]>`
  - `getLatestReviewRecord(dict): Promise<row | null>` — latest unfinished
  - `upsertReviewRecord(data): Promise<number>`

- [ ] **Step 1: Create record.service.ts with word record methods**

```typescript
import { db } from "../models";
import { wordRecords, chapterRecords, reviewRecords } from "../models/schema";
import { eq, and, gt, desc } from "drizzle-orm";

export class RecordService {
  async addWordRecord(data: {
    word: string;
    dict: string;
    chapter: number | null;
    timing: number[];
    wrongCount: number;
    mistakes: Record<number, string[]>;
    timeStamp: number;
  }) {
    const result = await db
      .insert(wordRecords)
      .values({
        word: data.word,
        dict: data.dict,
        chapter: data.chapter,
        timing: JSON.stringify(data.timing),
        wrongCount: data.wrongCount,
        mistakes: JSON.stringify(data.mistakes),
        timeStamp: data.timeStamp,
      })
      .returning({ id: wordRecords.id });
    return result[0].id;
  }

  async getWordRecordsWithErrors(dict?: string) {
    const conditions = [gt(wordRecords.wrongCount, 0)];
    if (dict) {
      conditions.push(eq(wordRecords.dict, dict));
    }
    const rows = await db
      .select()
      .from(wordRecords)
      .where(and(...conditions));
    return rows.map((r) => ({
      ...r,
      timing: JSON.parse(r.timing) as number[],
      mistakes: JSON.parse(r.mistakes) as Record<number, string[]>,
    }));
  }

  async deleteWordRecordsByWordAndDict(word: string, dict: string) {
    await db
      .delete(wordRecords)
      .where(and(eq(wordRecords.word, word), eq(wordRecords.dict, dict)));
  }
}
```

- [ ] **Step 2: Add chapter record methods**

```typescript
  async addChapterRecord(data: {
    dict: string;
    chapter: number | null;
    timeStamp: number;
    time: number;
    correctCount: number;
    wrongCount: number;
    wordCount: number;
    wordNumber: number;
    correctWordIndexes: number[];
    wordRecordIds: number[];
  }) {
    const result = await db
      .insert(chapterRecords)
      .values({
        ...data,
        correctWordIndexes: JSON.stringify(data.correctWordIndexes),
        wordRecordIds: JSON.stringify(data.wordRecordIds),
      })
      .returning({ id: chapterRecords.id });
    return result[0].id;
  }

  async getChapterRecords(dict?: string, chapter?: number) {
    const conditions = [];
    if (dict) conditions.push(eq(chapterRecords.dict, dict));
    if (chapter !== undefined) conditions.push(eq(chapterRecords.chapter, chapter));
    const rows = await db
      .select()
      .from(chapterRecords)
      .where(conditions.length ? and(...conditions) : undefined);
    return rows.map((r) => ({
      ...r,
      correctWordIndexes: JSON.parse(r.correctWordIndexes) as number[],
      wordRecordIds: JSON.parse(r.wordRecordIds) as number[],
    }));
  }
```

- [ ] **Step 3: Add review record methods**

```typescript
  async getLatestReviewRecord(dict: string) {
    const rows = await db
      .select()
      .from(reviewRecords)
      .where(and(eq(reviewRecords.dict, dict), eq(reviewRecords.isFinished, false)))
      .orderBy(desc(reviewRecords.createTime))
      .limit(1);
    if (rows.length === 0) return null;
    return { ...rows[0], words: JSON.parse(rows[0].words) };
  }

  async upsertReviewRecord(data: {
    id?: number;
    dict: string;
    index: number;
    createTime: number;
    isFinished: boolean;
    words: unknown[];
  }) {
    if (data.id) {
      await db
        .update(reviewRecords)
        .set({
          index: data.index,
          isFinished: data.isFinished,
          words: JSON.stringify(data.words),
        })
        .where(eq(reviewRecords.id, data.id));
      return data.id;
    }
    const result = await db
      .insert(reviewRecords)
      .values({
        dict: data.dict,
        index: data.index,
        createTime: data.createTime,
        isFinished: data.isFinished,
        words: JSON.stringify(data.words),
      })
      .returning({ id: reviewRecords.id });
    return result[0].id;
  }
}
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
cd packages/server && pnpm exec tsc --noEmit
```

Expected: No new errors.

- [ ] **Step 5: Commit**

```bash
git add packages/server/src/services/record.service.ts
git commit -m "feat(server): add RecordService for word/chapter/review records"
```

---

### Task 3: Create Record Controller and Routes (Server)

**Files:**

- Create: `packages/server/src/controllers/record.controller.ts`
- Modify: `packages/server/src/routes/index.ts`

**Interfaces:**

- Consumes: `RecordService` from `../services/record.service`
- Produces: API endpoints:

  - `POST /api/v1/records/word` — save a word record, returns `{ success: true, data: { id } }`
  - `GET /api/v1/records/word/errors?dict=` — get all error word records
  - `DELETE /api/v1/records/word?word=&dict=` — delete word records by word+dict
  - `POST /api/v1/records/chapter` — save a chapter record
  - `GET /api/v1/records/chapter?dict=&chapter=` — get chapter records
  - `GET /api/v1/records/review/latest?dict=` — get latest unfinished review
  - `POST /api/v1/records/review` — create or update review record

- [ ] **Step 1: Create record.controller.ts**

```typescript
import { RecordService } from "../services/record.service";
import type { Request, Response, NextFunction } from "express";

const recordService = new RecordService();

export class RecordController {
  addWordRecord = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { word, dict, chapter, timing, wrongCount, mistakes, timeStamp } =
        req.body;
      if (!word || !dict) {
        return res
          .status(400)
          .json({ success: false, message: "word and dict are required" });
      }
      const id = await recordService.addWordRecord({
        word,
        dict,
        chapter: chapter ?? null,
        timing: timing || [],
        wrongCount: wrongCount || 0,
        mistakes: mistakes || {},
        timeStamp: timeStamp || Date.now(),
      });
      res.status(201).json({ success: true, data: { id } });
    } catch (err) {
      next(err);
    }
  };

  getWordErrors = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dict = req.query.dict as string | undefined;
      const records = await recordService.getWordRecordsWithErrors(dict);
      res.json({ success: true, data: records });
    } catch (err) {
      next(err);
    }
  };

  deleteWordRecords = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { word, dict } = req.query as { word: string; dict: string };
      if (!word || !dict) {
        return res
          .status(400)
          .json({ success: false, message: "word and dict are required" });
      }
      await recordService.deleteWordRecordsByWordAndDict(word, dict);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  };

  addChapterRecord = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const id = await recordService.addChapterRecord(req.body);
      res.status(201).json({ success: true, data: { id } });
    } catch (err) {
      next(err);
    }
  };

  getChapterRecords = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { dict, chapter } = req.query as {
        dict?: string;
        chapter?: string;
      };
      const records = await recordService.getChapterRecords(
        dict,
        chapter !== undefined ? Number(chapter) : undefined
      );
      res.json({ success: true, data: records });
    } catch (err) {
      next(err);
    }
  };

  getLatestReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dict = req.query.dict as string;
      if (!dict) {
        return res
          .status(400)
          .json({ success: false, message: "dict is required" });
      }
      const record = await recordService.getLatestReviewRecord(dict);
      res.json({ success: true, data: record });
    } catch (err) {
      next(err);
    }
  };

  upsertReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = await recordService.upsertReviewRecord(req.body);
      res.status(201).json({ success: true, data: { id } });
    } catch (err) {
      next(err);
    }
  };
}
```

- [ ] **Step 2: Register routes in routes/index.ts**

Add these routes after the existing ones:

```typescript
import { RecordController } from "../controllers/record.controller";

const recordController = new RecordController();

// Word records
router.post("/records/word", recordController.addWordRecord);
router.get("/records/word/errors", recordController.getWordErrors);
router.delete("/records/word", recordController.deleteWordRecords);

// Chapter records
router.post("/records/chapter", recordController.addChapterRecord);
router.get("/records/chapter", recordController.getChapterRecords);

// Review records
router.get("/records/review/latest", recordController.getLatestReview);
router.post("/records/review", recordController.upsertReview);
```

- [ ] **Step 3: Verify server compiles and starts**

```bash
cd packages/server && pnpm exec tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add packages/server/src/controllers/record.controller.ts packages/server/src/routes/index.ts
git commit -m "feat(server): add record API endpoints for word/chapter/review"
```

---

### Task 4: Create Frontend API Client for Records

**Files:**

- Create: `packages/web/src/api/record-api.ts`

**Interfaces:**

- Consumes: existing `packages/web/src/utils/api.ts` (axios instance with baseURL)
- Produces: functions callable from hooks:

  - `postWordRecord(data) → Promise<number>` (returns id)
  - `fetchWordErrors(dict?) → Promise<IWordRecord[]>`
  - `deleteWordRecord(word, dict) → Promise<void>`
  - `postChapterRecord(data) → Promise<number>`
  - `fetchChapterRecords(dict?, chapter?) → Promise<IChapterRecord[]>`
  - `fetchLatestReview(dict) → Promise<IReviewRecord | null>`
  - `postReviewRecord(data) → Promise<number>`

- [ ] **Step 1: Create record-api.ts**

```typescript
import api from "@/utils/api";
import type { IChapterRecord, IWordRecord } from "@/utils/db/record";

export async function postWordRecord(
  data: Omit<IWordRecord, "id">
): Promise<number> {
  const res = await api.post("/records/word", data);
  return res.data.data.id;
}

export async function fetchWordErrors(dict?: string): Promise<IWordRecord[]> {
  const params = dict ? { dict } : {};
  const res = await api.get("/records/word/errors", { params });
  return res.data.data;
}

export async function deleteWordRecord(
  word: string,
  dict: string
): Promise<void> {
  await api.delete("/records/word", { params: { word, dict } });
}

export async function postChapterRecord(
  data: Omit<IChapterRecord, "id">
): Promise<number> {
  const res = await api.post("/records/chapter", data);
  return res.data.data.id;
}

export async function fetchChapterRecords(
  dict?: string,
  chapter?: number
): Promise<IChapterRecord[]> {
  const params: Record<string, string> = {};
  if (dict) params.dict = dict;
  if (chapter !== undefined) params.chapter = String(chapter);
  const res = await api.get("/records/chapter", { params });
  return res.data.data;
}

export async function fetchLatestReview(dict: string) {
  const res = await api.get("/records/review/latest", { params: { dict } });
  return res.data.data;
}

export async function postReviewRecord(data: {
  id?: number;
  dict: string;
  index: number;
  createTime: number;
  isFinished: boolean;
  words: unknown[];
}): Promise<number> {
  const res = await api.post("/records/review", data);
  return res.data.data.id;
}
```

- [ ] **Step 2: Verify it compiles**

```bash
cd packages/web && pnpm exec tsc --noEmit 2>&1 | grep -i "record-api" || echo "OK"
```

- [ ] **Step 3: Commit**

```bash
git add packages/web/src/api/record-api.ts
git commit -m "feat(web): add record API client for server-side persistence"
```

---

### Task 5: Replace Dexie Writes with API Calls (Frontend)

**Files:**

- Modify: `packages/web/src/utils/db/index.ts` — replace `useSaveWordRecord` and `useSaveChapterRecord`

**Interfaces:**

- Consumes: `postWordRecord`, `postChapterRecord` from `@/api/record-api`
- Produces: same hook signatures (`useSaveWordRecord` returns void, dispatches word record ID; `useSaveChapterRecord` saves chapter)

- [ ] **Step 1: Replace useSaveWordRecord to use API**

In `packages/web/src/utils/db/index.ts`, replace the `useSaveWordRecord` hook body to call `postWordRecord` instead of `db.wordRecords.add()`. Keep the same hook signature and dispatch of `ADD_WORD_RECORD_ID`.

```typescript
import { postWordRecord } from "@/api/record-api";

// Inside useSaveWordRecord:
const id = await postWordRecord({
  word: wordState.word,
  dict: dictID,
  chapter: chapterNum,
  timing,
  wrongCount: wordState.wrongCount,
  mistakes: wordState.letterMistakes,
  timeStamp: Date.now(),
});
dispatch({ type: TypingStateActionType.ADD_WORD_RECORD_ID, payload: id });
```

- [ ] **Step 2: Replace useSaveChapterRecord to use API**

Replace `db.chapterRecords.add()` with `postChapterRecord()`:

```typescript
import { postChapterRecord } from "@/api/record-api";

// Inside useSaveChapterRecord:
await postChapterRecord({
  dict: dictID,
  chapter: chapterNum,
  timeStamp: Date.now(),
  time: totalTime,
  correctCount: state.correctCount,
  wrongCount: state.wrongCount,
  wordCount: state.wordRecordIds.length,
  wordNumber: state.chapterData.words.length,
  correctWordIndexes: state.correctWordIndexes,
  wordRecordIds: state.wordRecordIds,
});
```

- [ ] **Step 3: Verify build passes**

```bash
pnpm build:web 2>&1 | tail -5
```

- [ ] **Step 4: Commit**

```bash
git add packages/web/src/utils/db/index.ts
git commit -m "feat(web): replace Dexie word/chapter record writes with API calls"
```

---

### Task 6: Replace Dexie Reads with API Calls (Error Book)

**Files:**

- Modify: `packages/web/src/pages/ErrorBook/index.tsx`
- Modify: `packages/web/src/pages/ErrorBook/hooks/useErrorBookWords.ts`
- Modify: `packages/web/src/pages/Gallery-N/hooks/useErrorWords.ts` (if exists)
- Modify: `packages/web/src/utils/db/review-record.ts`

**Interfaces:**

- Consumes: `fetchWordErrors`, `deleteWordRecord`, `fetchLatestReview`, `postReviewRecord` from `@/api/record-api`
- Produces: same component behavior with server-backed data

- [ ] **Step 1: Replace ErrorBook page query**

In `packages/web/src/pages/ErrorBook/index.tsx`, replace:

```typescript
db.wordRecords.where("wrongCount").above(0).toArray();
```

with:

```typescript
fetchWordErrors();
```

Use SWR or `useEffect` + `useState` to manage the async fetch.

- [ ] **Step 2: Replace useDeleteWordRecord**

In `packages/web/src/utils/db/index.ts`, replace the `useDeleteWordRecord` hook to call `deleteWordRecord(word, dict)` from the API client instead of `db.wordRecords.where({ word, dict }).delete()`.

- [ ] **Step 3: Replace useErrorBookWords hook**

In `packages/web/src/pages/ErrorBook/hooks/useErrorBookWords.ts`, replace the Dexie query with `fetchWordErrors()`.

- [ ] **Step 4: Replace Gallery-N error words hook**

In `packages/web/src/pages/Gallery-N/hooks/useErrorWords.ts`, replace Dexie query with `fetchWordErrors(dict)`.

- [ ] **Step 5: Replace review record operations**

In `packages/web/src/utils/db/review-record.ts`, replace:

- `useGetLatestReviewRecord` → call `fetchLatestReview(dict)`
- `generateNewWordReviewRecord` → call `postReviewRecord(...)`
- `putWordReviewRecord` → call `postReviewRecord({ id, ... })`

- [ ] **Step 6: Verify build passes and test manually**

```bash
pnpm build:web
```

Start both dev servers (`pnpm dev`) and verify:

1. Type a word incorrectly → verify it shows in error book
2. Delete a word from error book → verify it disappears
3. Review mode creates/updates records

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(web): replace all Dexie reads with server API calls"
```

---

### Task 7: Remove Dexie Dependency and Clean Up

**Files:**

- Modify: `packages/web/src/utils/db/index.ts` — remove Dexie class, keep only hooks that now use API
- Modify: `packages/web/src/utils/db/record.ts` — keep type definitions (still needed)
- Modify: `packages/web/package.json` — remove `dexie`, `dexie-react-hooks`, `dexie-export-import`

**Interfaces:**

- Consumes: all prior tasks complete
- Produces: no more Dexie dependency, all persistence through server API

- [ ] **Step 1: Remove Dexie class instantiation and imports**

In `packages/web/src/utils/db/index.ts`, remove the `RecordDB` class, `Dexie` import, and the `db` instance. Keep the hook exports that now use API calls.

- [ ] **Step 2: Remove Dexie packages from package.json**

```bash
cd packages/web && pnpm remove dexie dexie-react-hooks dexie-export-import
```

- [ ] **Step 3: Fix any remaining Dexie imports**

Search for any remaining `dexie` imports and remove them:

```bash
grep -rn "dexie\|from.*db'" packages/web/src/ --include="*.ts" --include="*.tsx"
```

Fix all found references.

- [ ] **Step 4: Verify build**

```bash
pnpm build:web
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor(web): remove Dexie dependency, all records persisted via server API"
```
