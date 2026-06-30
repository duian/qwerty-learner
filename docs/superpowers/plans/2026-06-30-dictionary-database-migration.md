# 单词数据入库改造 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 Qwerty Learner 改造为 pnpm workspace Monorepo，搭建 Express 后端（MVC），使用 Drizzle ORM + SQLite 存储单词数据，提供 RESTful API，前端渐进式切换数据源。

**Architecture:** pnpm workspace 管理三个包：`packages/web`（现有前端）、`packages/server`（Express + MVC）、`packages/shared`（共享类型）。后端使用 Drizzle ORM 操作 SQLite 数据库，通过导入脚本将现有 376 个 JSON 词典文件批量导入数据库。前端通过环境变量控制是否走 API，开发时 Vite proxy 转发请求到后端。

**Tech Stack:** pnpm workspace, Express, Drizzle ORM, better-sqlite3, axios, TypeScript

## Global Constraints

- Node.js >= 18
- pnpm 作为包管理器（从 yarn 迁移）
- 所有 userId 字段当前为 null，预留后续认证
- 网络请求前后端统一使用 axios
- 后端端口 3001，前端端口 5173
- API 版本前缀 `/api/v1`
- CHAPTER_LENGTH = 20（与现有保持一致）

---

### Task 1: 初始化 Monorepo 结构

**Files:**

- Create: `pnpm-workspace.yaml`
- Create: `packages/shared/package.json`
- Create: `packages/shared/tsconfig.json`
- Create: `packages/shared/src/types.ts`
- Create: `packages/web/package.json`（基于根 package.json 改造）
- Create: `packages/server/package.json`
- Create: `packages/server/tsconfig.json`
- Modify: `package.json`（根，改为 workspace root）
- Create: `.npmrc`

**Interfaces:**

- Produces: `@qwerty-learner/shared` 包导出 `Word`, `WordWithIndex`, `DictionaryResource`, `Dictionary` 类型

- [ ] **Step 1: 安装 pnpm 并创建 workspace 配置**

```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
```

```ini
# .npmrc
shamefully-hoist=true
```

- [ ] **Step 2: 创建 shared 包**

```json
// packages/shared/package.json
{
  "name": "@qwerty-learner/shared",
  "version": "0.1.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {}
}
```

```json
// packages/shared/tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"]
}
```

```typescript
// packages/shared/src/index.ts
export * from './types'
```

```typescript
// packages/shared/src/types.ts
export type LanguageType = 'en' | 'romaji' | 'ja' | 'code' | 'de' | 'id' | 'kk'
export type LanguageCategoryType = 'en' | 'ja' | 'de' | 'code' | 'id' | 'kk'

export type Word = {
  name: string
  trans: string[]
  usphone: string
  ukphone: string
  notation?: string
}

export type WordWithIndex = Word & { index: number }

export type DictionaryResource = {
  id: string
  name: string
  description: string
  category: string
  tags: string[]
  url: string
  length: number
  language: LanguageType
  languageCategory: LanguageCategoryType
  defaultPronIndex?: number
}

export type Dictionary = DictionaryResource & { chapterCount: number }
```

- [ ] **Step 3: 移动前端代码到 packages/web**

将现有项目根目录的前端文件移入 `packages/web/`：

- 移动：`src/`, `public/`, `index.html`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `tailwind.config.js`, `postcss.config.js`, `components.json`
- 创建 `packages/web/package.json`（从根 package.json 提取前端依赖）

```bash
mkdir -p packages/web
# 移动前端核心文件
mv src packages/web/
mv public packages/web/
mv index.html packages/web/
mv vite.config.ts packages/web/
mv tsconfig.json packages/web/
mv tsconfig.node.json packages/web/
mv tailwind.config.js packages/web/
mv postcss.config.js packages/web/
mv components.json packages/web/
```

`packages/web/package.json` 保留原有的 dependencies 和 devDependencies，name 改为 `@qwerty-learner/web`，添加对 `@qwerty-learner/shared` 的 workspace 依赖。

- [ ] **Step 4: 创建 server 包骨架**

```json
// packages/server/package.json
{
  "name": "@qwerty-learner/server",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "import-dicts": "tsx src/scripts/import-dicts.ts"
  },
  "dependencies": {
    "@qwerty-learner/shared": "workspace:*",
    "express": "^4.18.2",
    "axios": "^1.7.0",
    "drizzle-orm": "^0.36.0",
    "better-sqlite3": "^11.0.0",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/better-sqlite3": "^7.6.8",
    "@types/cors": "^2.8.17",
    "drizzle-kit": "^0.30.0",
    "tsx": "^4.7.0",
    "typescript": "^5.4.0"
  }
}
```

```json
// packages/server/tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "resolveJsonModule": true,
    "declaration": true
  },
  "include": ["src"]
}
```

- [ ] **Step 5: 改造根 package.json 为 workspace root**

```json
// package.json (root)
{
  "name": "qwerty-learner",
  "private": true,
  "scripts": {
    "dev": "pnpm --parallel -r run dev",
    "dev:web": "pnpm --filter @qwerty-learner/web dev",
    "dev:server": "pnpm --filter @qwerty-learner/server dev",
    "build": "pnpm -r run build",
    "lint": "pnpm --filter @qwerty-learner/web lint",
    "prettier": "prettier --write .",
    "import-dicts": "pnpm --filter @qwerty-learner/server import-dicts"
  },
  "devDependencies": {
    "prettier": "^2.8.8",
    "typescript": "^5.4.0"
  }
}
```

- [ ] **Step 6: 安装依赖并验证 workspace 结构**

```bash
pnpm install
pnpm ls --depth 0 -r
```

Expected: 三个包被识别，依赖安装成功。

- [ ] **Step 7: 验证前端仍可正常启动**

```bash
pnpm dev:web
```

Expected: Vite dev server 正常启动在 localhost:5173，页面可访问。

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "refactor: 初始化 pnpm workspace monorepo 结构

- 创建 packages/web, packages/server, packages/shared
- 前端代码移入 packages/web
- 共享类型定义放入 packages/shared
- 根 package.json 改为 workspace root"
```

---

### Task 2: 搭建 Express 后端 MVC 骨架

**Files:**

- Create: `packages/server/src/index.ts`
- Create: `packages/server/src/app.ts`
- Create: `packages/server/src/routes/index.ts`
- Create: `packages/server/src/controllers/dictionary.controller.ts`
- Create: `packages/server/src/services/dictionary.service.ts`
- Create: `packages/server/src/middlewares/error-handler.ts`

**Interfaces:**

- Consumes: `@qwerty-learner/shared` 的 `Word`, `Dictionary` 类型
- Produces: Express app 实例，`GET /api/v1/dictionaries` 路由（暂返回空数组）

- [ ] **Step 1: 创建 Express app 入口**

```typescript
// packages/server/src/app.ts
import { errorHandler } from './middlewares/error-handler'
import { router } from './routes/index'
import cors from 'cors'
import express from 'express'

const app = express()

app.use(cors())
app.use(express.json())
app.use('/api/v1', router)
app.use(errorHandler)

export { app }
```

```typescript
// packages/server/src/index.ts
import { app } from './app'

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
```

- [ ] **Step 2: 创建错误处理中间件**

```typescript
// packages/server/src/middlewares/error-handler.ts
import type { Request, Response, NextFunction } from 'express'

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  console.error('[Error]', err.message)
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  })
}
```

- [ ] **Step 3: 创建路由和占位 controller**

```typescript
// packages/server/src/routes/index.ts
import { DictionaryController } from '../controllers/dictionary.controller'
import { Router } from 'express'

const router = Router()
const dictionaryController = new DictionaryController()

router.get('/dictionaries', dictionaryController.getAll)
router.get('/dictionaries/:id', dictionaryController.getById)

export { router }
```

```typescript
// packages/server/src/controllers/dictionary.controller.ts
import type { Request, Response, NextFunction } from 'express'

export class DictionaryController {
  getAll = async (_req: Request, res: Response, _next: NextFunction) => {
    res.json({ success: true, data: [] })
  }

  getById = async (req: Request, res: Response, _next: NextFunction) => {
    res.json({ success: true, data: { id: req.params.id } })
  }
}
```

- [ ] **Step 4: 启动后端验证**

```bash
pnpm dev:server
```

```bash
curl http://localhost:3001/api/v1/dictionaries
```

Expected: `{"success":true,"data":[]}`

- [ ] **Step 5: Commit**

```bash
git add packages/server/src/
git commit -m "feat(server): 搭建 Express MVC 骨架

- app.ts 注册中间件和路由
- 错误处理中间件
- 词典 controller 占位路由"
```

---

### Task 3: Drizzle Schema 定义与数据库初始化

**Files:**

- Create: `packages/server/src/models/schema.ts`
- Create: `packages/server/src/models/index.ts`
- Create: `packages/server/drizzle.config.ts`

**Interfaces:**

- Produces: Drizzle schema 表定义（`dictionaries`, `words`, `favorites`, `wordbooks`, `wordbookWords`），`db` 实例供 service 层使用

- [ ] **Step 1: 定义 Drizzle schema**

```typescript
// packages/server/src/models/schema.ts
import { sqliteTable, text, integer, uniqueIndex, index } from 'drizzle-orm/sqlite-core'

export const dictionaries = sqliteTable('dictionaries', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category').notNull(),
  language: text('language').notNull(),
  languageCategory: text('language_category').notNull(),
  tags: text('tags').notNull(), // JSON string
  wordCount: integer('word_count').notNull(),
  userId: text('user_id'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
})

export const words = sqliteTable(
  'words',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    dictId: text('dict_id')
      .notNull()
      .references(() => dictionaries.id),
    name: text('name').notNull(),
    trans: text('trans').notNull(), // JSON string
    usphone: text('usphone'),
    ukphone: text('ukphone'),
    notation: text('notation'),
    sortOrder: integer('sort_order').notNull(),
  },
  (table) => ({
    dictSortIdx: index('idx_words_dict_sort').on(table.dictId, table.sortOrder),
  }),
)

export const favorites = sqliteTable(
  'favorites',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: text('user_id'),
    wordId: integer('word_id')
      .notNull()
      .references(() => words.id),
    dictId: text('dict_id').notNull(),
    createdAt: integer('created_at').notNull(),
  },
  (table) => ({
    userWordUniq: uniqueIndex('uniq_favorites_user_word').on(table.userId, table.wordId),
  }),
)

export const wordbooks = sqliteTable('wordbooks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id'),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
})

export const wordbookWords = sqliteTable(
  'wordbook_words',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    wordbookId: integer('wordbook_id')
      .notNull()
      .references(() => wordbooks.id),
    wordId: integer('word_id')
      .notNull()
      .references(() => words.id),
    sortOrder: integer('sort_order').notNull(),
  },
  (table) => ({
    wordbookWordUniq: uniqueIndex('uniq_wordbook_words').on(table.wordbookId, table.wordId),
  }),
)
```

- [ ] **Step 2: 创建数据库实例**

```typescript
// packages/server/src/models/index.ts
import * as schema from './schema'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import path from 'path'

const DB_PATH = path.resolve(__dirname, '../../data/qwerty.db')

const sqlite = new Database(DB_PATH)
sqlite.pragma('journal_mode = WAL')

export const db = drizzle(sqlite, { schema })
export { schema }
```

- [ ] **Step 3: 创建 Drizzle 配置文件**

```typescript
// packages/server/drizzle.config.ts
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/models/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: './data/qwerty.db',
  },
})
```

- [ ] **Step 4: 生成并运行迁移**

```bash
cd packages/server
mkdir -p data
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

Expected: `data/qwerty.db` 创建成功，包含 5 张表。

- [ ] **Step 5: 验证表结构**

```bash
sqlite3 packages/server/data/qwerty.db ".tables"
```

Expected: `dictionaries  favorites  wordbook_words  wordbooks  words`

- [ ] **Step 6: Commit**

```bash
git add packages/server/src/models/ packages/server/drizzle.config.ts packages/server/drizzle/
git commit -m "feat(server): 定义 Drizzle schema 并初始化数据库

- 5 张表：dictionaries, words, favorites, wordbooks, wordbook_words
- WAL 模式提升并发读性能
- 索引：words(dictId, sortOrder)"
```

---

### Task 4: 数据导入脚本

**Files:**

- Create: `packages/server/src/scripts/import-dicts.ts`

**Interfaces:**

- Consumes: `db` 实例, schema 定义, 前端 `/public/dicts/*.json` 文件和 `dictionary.ts` 元数据
- Produces: 填充完成的 SQLite 数据库（376 词典，约 20-30 万单词）

- [ ] **Step 1: 编写导入脚本**

```typescript
// packages/server/src/scripts/import-dicts.ts
import * as schema from '../models/schema'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as fs from 'fs'
import * as path from 'path'

// 直接读取词典元数据 JSON（从前端资源提取一份静态 JSON）
const DICTS_DIR = path.resolve(__dirname, '../../../web/public/dicts')
const META_PATH = path.resolve(__dirname, '../scripts/dictionary-meta.json')
const DB_PATH = path.resolve(__dirname, '../../data/qwerty.db')

interface DictMeta {
  id: string
  name: string
  description: string
  category: string
  tags: string[]
  url: string
  length: number
  language: string
  languageCategory: string
}

interface WordJSON {
  name: string
  trans: string[]
  usphone?: string
  ukphone?: string
  notation?: string
}

async function main() {
  const sqlite = new Database(DB_PATH)
  sqlite.pragma('journal_mode = WAL')
  const db = drizzle(sqlite, { schema })

  // 读取词典元数据
  const metas: DictMeta[] = JSON.parse(fs.readFileSync(META_PATH, 'utf-8'))
  console.log(`Found ${metas.length} dictionaries to import`)

  // 清空现有数据
  sqlite.exec('DELETE FROM wordbook_words')
  sqlite.exec('DELETE FROM favorites')
  sqlite.exec('DELETE FROM words')
  sqlite.exec('DELETE FROM dictionaries')

  const now = Date.now()
  let totalWords = 0

  for (const meta of metas) {
    const jsonFileName = meta.url.replace('/dicts/', '')
    const jsonPath = path.join(DICTS_DIR, jsonFileName)

    if (!fs.existsSync(jsonPath)) {
      console.warn(`Skipping ${meta.id}: file not found at ${jsonPath}`)
      continue
    }

    const wordsData: WordJSON[] = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))

    // 使用事务批量插入
    const insertDict = sqlite.prepare(
      `INSERT INTO dictionaries (id, name, description, category, language, language_category, tags, word_count, user_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?)`,
    )

    const insertWord = sqlite.prepare(
      `INSERT INTO words (dict_id, name, trans, usphone, ukphone, notation, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )

    const transaction = sqlite.transaction(() => {
      insertDict.run(
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
      )

      for (let i = 0; i < wordsData.length; i++) {
        const word = wordsData[i]
        insertWord.run(meta.id, word.name, JSON.stringify(word.trans), word.usphone || null, word.ukphone || null, word.notation || null, i)
      }
    })

    transaction()
    totalWords += wordsData.length
    console.log(`  ✓ ${meta.id}: ${wordsData.length} words`)
  }

  console.log(`\nDone! Imported ${metas.length} dictionaries, ${totalWords} words total.`)
  sqlite.close()
}

main().catch(console.error)
```

- [ ] **Step 2: 从 dictionary.ts 提取元数据 JSON**

创建一个一次性脚本提取元数据：

```typescript
// packages/server/src/scripts/extract-meta.ts
// 读取 dictionary.ts 中的资源定义，输出为 JSON
// 由于 dictionary.ts 是 TS 模块，使用 tsx 直接执行
import * as fs from 'fs'
import * as path from 'path'

// 动态导入前端资源（需要配置 path alias 或用相对路径）
// 这里直接硬编码读取并用正则提取，或者用更简单的方式：
// 在 packages/web 中导出一份 JSON

const outputPath = path.resolve(__dirname, './dictionary-meta.json')

async function main() {
  // 使用动态导入 + tsx 支持
  const { dictionaryResources } = await import('../../../web/src/resources/dictionary')
  const meta = dictionaryResources.map((d) => ({
    id: d.id,
    name: d.name,
    description: d.description,
    category: d.category,
    tags: d.tags,
    url: d.url,
    length: d.length,
    language: d.language,
    languageCategory: d.languageCategory,
  }))
  fs.writeFileSync(outputPath, JSON.stringify(meta, null, 2))
  console.log(`Extracted ${meta.length} dictionary metadata entries to ${outputPath}`)
}

main().catch(console.error)
```

在 `packages/server/package.json` scripts 中添加：

```json
"extract-meta": "tsx src/scripts/extract-meta.ts"
```

- [ ] **Step 3: 运行导入**

```bash
pnpm --filter @qwerty-learner/server extract-meta
pnpm --filter @qwerty-learner/server import-dicts
```

Expected: 输出 376 个词典导入成功，总单词数约 20-30 万。

- [ ] **Step 4: 验证数据**

```bash
sqlite3 packages/server/data/qwerty.db "SELECT COUNT(*) FROM dictionaries;"
sqlite3 packages/server/data/qwerty.db "SELECT COUNT(*) FROM words;"
sqlite3 packages/server/data/qwerty.db "SELECT * FROM words WHERE dict_id='cet4' LIMIT 3;"
```

Expected: dictionaries = 376, words = 20 万+，CET4 单词数据完整。

- [ ] **Step 5: 将 qwerty.db 加入 .gitignore**

```gitignore
# packages/server/.gitignore
data/qwerty.db
```

- [ ] **Step 6: Commit**

```bash
git add packages/server/src/scripts/ packages/server/.gitignore
git commit -m "feat(server): 添加词典数据导入脚本

- extract-meta.ts 提取词典元数据为 JSON
- import-dicts.ts 批量导入 376 个词典到 SQLite
- 事务批量插入，幂等可重跑"
```

---

### Task 5: 实现词典和单词 API（Service + Controller）

**Files:**

- Create: `packages/server/src/services/dictionary.service.ts`
- Create: `packages/server/src/services/word.service.ts`
- Modify: `packages/server/src/controllers/dictionary.controller.ts`
- Create: `packages/server/src/controllers/word.controller.ts`
- Modify: `packages/server/src/routes/index.ts`

**Interfaces:**

- Consumes: `db` 实例, schema (`dictionaries`, `words` 表)
- Produces: `GET /api/v1/dictionaries`, `GET /api/v1/dictionaries/:id`, `GET /api/v1/dictionaries/:id/words?chapter=&pageSize=`, `GET /api/v1/dictionaries/:id/words/search?keyword=`

- [ ] **Step 1: 实现 DictionaryService**

```typescript
// packages/server/src/services/dictionary.service.ts
import { db, schema } from '../models'
import { eq } from 'drizzle-orm'

export class DictionaryService {
  async findAll() {
    return db.select().from(schema.dictionaries)
  }

  async findById(id: string) {
    const result = await db.select().from(schema.dictionaries).where(eq(schema.dictionaries.id, id))
    return result[0] || null
  }
}
```

- [ ] **Step 2: 实现 WordService**

```typescript
// packages/server/src/services/word.service.ts
import { db, schema } from '../models'
import { eq, and, like, asc } from 'drizzle-orm'

const DEFAULT_PAGE_SIZE = 20

export class WordService {
  async findByChapter(dictId: string, chapter: number, pageSize: number = DEFAULT_PAGE_SIZE) {
    const offset = chapter * pageSize
    return db
      .select()
      .from(schema.words)
      .where(eq(schema.words.dictId, dictId))
      .orderBy(asc(schema.words.sortOrder))
      .limit(pageSize)
      .offset(offset)
  }

  async search(dictId: string, keyword: string) {
    return db
      .select()
      .from(schema.words)
      .where(and(eq(schema.words.dictId, dictId), like(schema.words.name, `%${keyword}%`)))
      .orderBy(asc(schema.words.sortOrder))
      .limit(50)
  }
}
```

- [ ] **Step 3: 更新 DictionaryController**

```typescript
// packages/server/src/controllers/dictionary.controller.ts
import { DictionaryService } from '../services/dictionary.service'
import type { Request, Response, NextFunction } from 'express'

const dictionaryService = new DictionaryService()

export class DictionaryController {
  getAll = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const dictionaries = await dictionaryService.findAll()
      res.json({ success: true, data: dictionaries })
    } catch (err) {
      next(err)
    }
  }

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dict = await dictionaryService.findById(req.params.id)
      if (!dict) {
        return res.status(404).json({ success: false, message: 'Dictionary not found' })
      }
      res.json({ success: true, data: dict })
    } catch (err) {
      next(err)
    }
  }
}
```

- [ ] **Step 4: 创建 WordController**

```typescript
// packages/server/src/controllers/word.controller.ts
import { WordService } from '../services/word.service'
import type { Request, Response, NextFunction } from 'express'

const wordService = new WordService()

export class WordController {
  getByChapter = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const chapter = parseInt(req.query.chapter as string) || 0
      const pageSize = parseInt(req.query.pageSize as string) || 20

      const words = await wordService.findByChapter(id, chapter, pageSize)
      // 解析 trans JSON 字符串为数组
      const parsed = words.map((w) => ({
        ...w,
        trans: JSON.parse(w.trans),
      }))
      res.json({ success: true, data: parsed })
    } catch (err) {
      next(err)
    }
  }

  search = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const keyword = (req.query.keyword as string) || ''
      if (!keyword.trim()) {
        return res.json({ success: true, data: [] })
      }
      const words = await wordService.search(id, keyword)
      const parsed = words.map((w) => ({
        ...w,
        trans: JSON.parse(w.trans),
      }))
      res.json({ success: true, data: parsed })
    } catch (err) {
      next(err)
    }
  }
}
```

- [ ] **Step 5: 更新路由注册**

```typescript
// packages/server/src/routes/index.ts
import { DictionaryController } from '../controllers/dictionary.controller'
import { WordController } from '../controllers/word.controller'
import { Router } from 'express'

const router = Router()
const dictionaryController = new DictionaryController()
const wordController = new WordController()

// 词典
router.get('/dictionaries', dictionaryController.getAll)
router.get('/dictionaries/:id', dictionaryController.getById)

// 单词
router.get('/dictionaries/:id/words', wordController.getByChapter)
router.get('/dictionaries/:id/words/search', wordController.search)

export { router }
```

- [ ] **Step 6: 启动验证 API**

```bash
pnpm dev:server
```

```bash
curl "http://localhost:3001/api/v1/dictionaries" | jq '.data | length'
curl "http://localhost:3001/api/v1/dictionaries/cet4"
curl "http://localhost:3001/api/v1/dictionaries/cet4/words?chapter=0&pageSize=20" | jq '.data | length'
curl "http://localhost:3001/api/v1/dictionaries/cet4/words/search?keyword=abandon"
```

Expected: 词典数 376，CET4 详情返回正确，chapter 0 返回 20 个单词，搜索返回匹配结果。

- [ ] **Step 7: Commit**

```bash
git add packages/server/src/
git commit -m "feat(server): 实现词典和单词 CRUD API

- DictionaryService: findAll, findById
- WordService: findByChapter, search
- RESTful 路由：/dictionaries, /dictionaries/:id/words"
```

---

### Task 6: 实现收藏和自定义词库 API

**Files:**

- Create: `packages/server/src/services/favorite.service.ts`
- Create: `packages/server/src/services/wordbook.service.ts`
- Create: `packages/server/src/controllers/favorite.controller.ts`
- Create: `packages/server/src/controllers/wordbook.controller.ts`
- Modify: `packages/server/src/routes/index.ts`

**Interfaces:**

- Consumes: `db` 实例, schema (`favorites`, `wordbooks`, `wordbookWords` 表)
- Produces: 收藏 CRUD API, 自定义词库 CRUD API

- [ ] **Step 1: 实现 FavoriteService**

```typescript
// packages/server/src/services/favorite.service.ts
import { db, schema } from '../models'
import { eq, and } from 'drizzle-orm'

export class FavoriteService {
  async findAll(dictId?: string) {
    if (dictId) {
      return db.select().from(schema.favorites).where(eq(schema.favorites.dictId, dictId))
    }
    return db.select().from(schema.favorites)
  }

  async create(wordId: number, dictId: string) {
    return db.insert(schema.favorites).values({
      wordId,
      dictId,
      userId: null,
      createdAt: Date.now(),
    })
  }

  async delete(id: number) {
    return db.delete(schema.favorites).where(eq(schema.favorites.id, id))
  }
}
```

- [ ] **Step 2: 实现 WordbookService**

```typescript
// packages/server/src/services/wordbook.service.ts
import { db, schema } from '../models'
import { eq } from 'drizzle-orm'

export class WordbookService {
  async findAll() {
    return db.select().from(schema.wordbooks)
  }

  async create(name: string, description?: string) {
    return db.insert(schema.wordbooks).values({
      name,
      description: description || null,
      userId: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
  }

  async update(id: number, data: { name?: string; description?: string }) {
    return db
      .update(schema.wordbooks)
      .set({ ...data, updatedAt: Date.now() })
      .where(eq(schema.wordbooks.id, id))
  }

  async delete(id: number) {
    // 先删除关联
    await db.delete(schema.wordbookWords).where(eq(schema.wordbookWords.wordbookId, id))
    return db.delete(schema.wordbooks).where(eq(schema.wordbooks.id, id))
  }

  async getWords(wordbookId: number) {
    return db
      .select({
        id: schema.words.id,
        name: schema.words.name,
        trans: schema.words.trans,
        usphone: schema.words.usphone,
        ukphone: schema.words.ukphone,
        notation: schema.words.notation,
        dictId: schema.words.dictId,
      })
      .from(schema.wordbookWords)
      .innerJoin(schema.words, eq(schema.wordbookWords.wordId, schema.words.id))
      .where(eq(schema.wordbookWords.wordbookId, wordbookId))
  }

  async addWord(wordbookId: number, wordId: number) {
    const existing = await db
      .select()
      .from(schema.wordbookWords)
      .where(and(eq(schema.wordbookWords.wordbookId, wordbookId), eq(schema.wordbookWords.wordId, wordId)))
    if (existing.length > 0) return existing[0]

    // 获取当前最大 sortOrder
    const maxSort = await db
      .select({ max: schema.wordbookWords.sortOrder })
      .from(schema.wordbookWords)
      .where(eq(schema.wordbookWords.wordbookId, wordbookId))

    const sortOrder = (maxSort[0]?.max || 0) + 1

    return db.insert(schema.wordbookWords).values({
      wordbookId,
      wordId,
      sortOrder,
    })
  }

  async removeWord(wordbookId: number, wordId: number) {
    return db
      .delete(schema.wordbookWords)
      .where(and(eq(schema.wordbookWords.wordbookId, wordbookId), eq(schema.wordbookWords.wordId, wordId)))
  }
}
```

- [ ] **Step 3: 创建 FavoriteController**

```typescript
// packages/server/src/controllers/favorite.controller.ts
import { FavoriteService } from '../services/favorite.service'
import type { Request, Response, NextFunction } from 'express'

const favoriteService = new FavoriteService()

export class FavoriteController {
  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dictId = req.query.dictId as string | undefined
      const favorites = await favoriteService.findAll(dictId)
      res.json({ success: true, data: favorites })
    } catch (err) {
      next(err)
    }
  }

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { wordId, dictId } = req.body
      if (!wordId || !dictId) {
        return res.status(400).json({ success: false, message: 'wordId and dictId are required' })
      }
      await favoriteService.create(wordId, dictId)
      res.status(201).json({ success: true })
    } catch (err) {
      next(err)
    }
  }

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id)
      await favoriteService.delete(id)
      res.json({ success: true })
    } catch (err) {
      next(err)
    }
  }
}
```

- [ ] **Step 4: 创建 WordbookController**

```typescript
// packages/server/src/controllers/wordbook.controller.ts
import { WordbookService } from '../services/wordbook.service'
import type { Request, Response, NextFunction } from 'express'

const wordbookService = new WordbookService()

export class WordbookController {
  getAll = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const wordbooks = await wordbookService.findAll()
      res.json({ success: true, data: wordbooks })
    } catch (err) {
      next(err)
    }
  }

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, description } = req.body
      if (!name) {
        return res.status(400).json({ success: false, message: 'name is required' })
      }
      await wordbookService.create(name, description)
      res.status(201).json({ success: true })
    } catch (err) {
      next(err)
    }
  }

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id)
      const { name, description } = req.body
      await wordbookService.update(id, { name, description })
      res.json({ success: true })
    } catch (err) {
      next(err)
    }
  }

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id)
      await wordbookService.delete(id)
      res.json({ success: true })
    } catch (err) {
      next(err)
    }
  }

  getWords = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const wordbookId = parseInt(req.params.id)
      const words = await wordbookService.getWords(wordbookId)
      const parsed = words.map((w) => ({ ...w, trans: JSON.parse(w.trans) }))
      res.json({ success: true, data: parsed })
    } catch (err) {
      next(err)
    }
  }

  addWord = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const wordbookId = parseInt(req.params.id)
      const { wordId } = req.body
      if (!wordId) {
        return res.status(400).json({ success: false, message: 'wordId is required' })
      }
      await wordbookService.addWord(wordbookId, wordId)
      res.status(201).json({ success: true })
    } catch (err) {
      next(err)
    }
  }

  removeWord = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const wordbookId = parseInt(req.params.id)
      const wordId = parseInt(req.params.wordId)
      await wordbookService.removeWord(wordbookId, wordId)
      res.json({ success: true })
    } catch (err) {
      next(err)
    }
  }
}
```

- [ ] **Step 5: 更新路由注册**

在 `packages/server/src/routes/index.ts` 追加：

```typescript
import { FavoriteController } from '../controllers/favorite.controller'
import { WordbookController } from '../controllers/wordbook.controller'

const favoriteController = new FavoriteController()
const wordbookController = new WordbookController()

// 收藏
router.get('/favorites', favoriteController.getAll)
router.post('/favorites', favoriteController.create)
router.delete('/favorites/:id', favoriteController.delete)

// 自定义词库
router.get('/wordbooks', wordbookController.getAll)
router.post('/wordbooks', wordbookController.create)
router.put('/wordbooks/:id', wordbookController.update)
router.delete('/wordbooks/:id', wordbookController.delete)
router.get('/wordbooks/:id/words', wordbookController.getWords)
router.post('/wordbooks/:id/words', wordbookController.addWord)
router.delete('/wordbooks/:id/words/:wordId', wordbookController.removeWord)
```

- [ ] **Step 6: 验证收藏和词库 API**

```bash
# 创建词库
curl -X POST http://localhost:3001/api/v1/wordbooks \
  -H "Content-Type: application/json" \
  -d '{"name":"我的词库","description":"测试用"}'

# 添加收藏
curl -X POST http://localhost:3001/api/v1/favorites \
  -H "Content-Type: application/json" \
  -d '{"wordId":1,"dictId":"cet4"}'

# 查询收藏
curl http://localhost:3001/api/v1/favorites
```

Expected: 创建返回 201，查询返回对应数据。

- [ ] **Step 7: Commit**

```bash
git add packages/server/src/
git commit -m "feat(server): 实现收藏和自定义词库 API

- FavoriteService/Controller: CRUD 操作
- WordbookService/Controller: CRUD + 词库内单词管理
- 所有路由注册到 /api/v1"
```

---

### Task 7: 前端接入 API 数据源

**Files:**

- Modify: `packages/web/vite.config.ts`（添加 proxy）
- Create: `packages/web/src/utils/api.ts`（axios 实例）
- Modify: `packages/web/src/utils/wordListFetcher.ts`（切换数据源）
- Modify: `packages/web/src/pages/Typing/hooks/useWordList.ts`（适配新 fetcher）

**Interfaces:**

- Consumes: 后端 API `/api/v1/dictionaries/:id/words?chapter=&pageSize=`
- Produces: 前端通过环境变量切换到 API 数据源，保持 `useWordList` 对外接口不变

- [ ] **Step 1: 配置 Vite proxy**

在 `packages/web/vite.config.ts` 的 server 配置中添加：

```typescript
// vite.config.ts server 配置
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3001',
      changeOrigin: true,
    },
  },
}
```

- [ ] **Step 2: 创建 axios 实例**

```bash
cd packages/web && pnpm add axios
```

```typescript
// packages/web/src/utils/api.ts
import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 10000,
})

export { api }
```

- [ ] **Step 3: 改造 wordListFetcher 支持双数据源**

```typescript
// packages/web/src/utils/wordListFetcher.ts
import { api } from './api'
import type { Word } from '@/typings'

const REACT_APP_DEPLOY_ENV = import.meta.env.REACT_APP_DEPLOY_ENV || ''
const USE_API = import.meta.env.VITE_USE_API === 'true'

/**
 * 从后端 API 获取单词（按章节）
 */
async function fetchFromAPI(dictId: string, chapter: number, pageSize: number = 20): Promise<Word[]> {
  const res = await api.get(`/dictionaries/${dictId}/words`, {
    params: { chapter, pageSize },
  })
  return res.data.data
}

/**
 * 从静态 JSON 文件获取完整词典（原始方式）
 */
async function fetchFromJSON(url: string): Promise<Word[]> {
  const URL_PREFIX: string = REACT_APP_DEPLOY_ENV === 'pages' ? '/qwerty-learner' : ''
  const response = await fetch(URL_PREFIX + url)
  return response.json()
}

export { fetchFromAPI, fetchFromJSON, USE_API }
```

- [ ] **Step 4: 改造 useWordList hook**

在 `packages/web/src/pages/Typing/hooks/useWordList.ts` 中适配新数据源：

- 当 `USE_API=true` 时：SWR key 改为 `['words', dictId, chapter]`，fetcher 调用 `fetchFromAPI`，直接获取当前章节的 20 个单词
- 当 `USE_API=false` 时：保持原有逻辑（fetch 整个 JSON，客户端切片）

核心改动点：

```typescript
import { fetchFromAPI, fetchFromJSON, USE_API } from '@/utils/wordListFetcher'

// API 模式下的 SWR 调用
const { data: apiWords } = useSWR(USE_API ? ['words', currentDictInfo.id, currentChapter] : null, ([, dictId, chapter]) =>
  fetchFromAPI(dictId, chapter),
)

// JSON 模式保持原逻辑
const { data: jsonWordList } = useSWR(!USE_API ? currentDictInfo.url : null, fetchFromJSON)
```

- [ ] **Step 5: 添加环境变量**

```bash
# packages/web/.env.development
VITE_USE_API=true
```

```bash
# packages/web/.env.production
VITE_USE_API=false
```

- [ ] **Step 6: 启动前后端联调验证**

```bash
# 终端 1
pnpm dev:server

# 终端 2
pnpm dev:web
```

在浏览器中打开 localhost:5173，选择 CET-4 词典，验证单词正常加载，切换章节正常。

- [ ] **Step 7: Commit**

```bash
git add packages/web/
git commit -m "feat(web): 前端接入后端 API 数据源

- 配置 Vite proxy 转发 /api 到后端
- 创建 axios 实例
- wordListFetcher 支持 API/JSON 双数据源
- useWordList 适配新 fetcher
- 环境变量 VITE_USE_API 控制数据源切换"
```
