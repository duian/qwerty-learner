# 单词数据入库改造设计

## 概述

将 Qwerty Learner 从纯前端项目改造为前后端一体的 Monorepo 项目，第一期将单词数据从静态 JSON 文件迁移到 SQLite 数据库，并搭建基础 API 层，同时设计收藏和自定义词库的表结构。

## 背景与目标

### 现状

- 376 个词典 JSON 文件存放在 `/public/dicts/`，总计约 73MB
- 前端通过 SWR + fetch 按需加载整个词典文件到内存
- Dexie (IndexedDB) 仅存储练习记录，不存储字典原始数据
- 错题本为获取错词完整信息需重新下载整个词典文件

### 目标

- 为后续产品化做基础：图片、例句、AI 语音对话、复习策略优化
- 单词数据持久化到数据库，支持按需查询
- 搭建收藏和自定义词库能力
- 渐进式迁移，不破坏现有功能

## 技术决策

| 决策项   | 选择                         | 理由                                      |
| -------- | ---------------------------- | ----------------------------------------- |
| 后端框架 | Express                      | 成熟稳定，后续可包入 Tauri                |
| 数据库   | SQLite（本地优先）           | 零部署，后续可通过 Turso 扩展到云端       |
| ORM      | Drizzle                      | 轻量，SQL-like API，TypeScript 类型推导好 |
| 代码组织 | pnpm workspace Monorepo      | 前后端共享类型，轻量无额外依赖            |
| 网络请求 | axios（前后端统一）          | 统一请求库                                |
| 用户系统 | 暂不做认证，预留 userId 字段 | 后续加认证时平滑迁移                      |
| 迁移策略 | 渐进式（方案一）             | 风险低，可逐步验证                        |

## Monorepo 结构

```
qwerty-learner/
├── pnpm-workspace.yaml
├── package.json                      # 根：scripts + devDependencies
├── packages/
│   ├── web/                          # 现有前端（移入）
│   │   ├── src/
│   │   ├── public/dicts/             # 过渡期保留，逐步废弃
│   │   ├── vite.config.ts
│   │   └── package.json
│   ├── server/                       # Express 后端（MVC）
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── app.ts
│   │   │   ├── controllers/
│   │   │   │   ├── dictionary.controller.ts
│   │   │   │   ├── word.controller.ts
│   │   │   │   ├── favorite.controller.ts
│   │   │   │   └── wordbook.controller.ts
│   │   │   ├── services/
│   │   │   │   ├── dictionary.service.ts
│   │   │   │   ├── word.service.ts
│   │   │   │   ├── favorite.service.ts
│   │   │   │   └── wordbook.service.ts
│   │   │   ├── models/
│   │   │   │   ├── schema.ts         # Drizzle schema
│   │   │   │   └── index.ts          # db 实例
│   │   │   ├── routes/
│   │   │   │   └── index.ts
│   │   │   ├── middlewares/
│   │   │   │   └── error-handler.ts
│   │   │   └── scripts/
│   │   │       └── import-dicts.ts
│   │   ├── data/
│   │   │   └── qwerty.db
│   │   ├── drizzle.config.ts
│   │   └── package.json
│   └── shared/                       # 共享类型定义
│       ├── src/
│       │   └── types.ts
│       └── package.json
```

### MVC 职责划分

- **Controllers** — 处理请求/响应，参数校验，调用 service
- **Services** — 业务逻辑，调用 model 层进行数据操作
- **Models** — Drizzle schema 定义 + 数据库实例，纯数据层

## 数据库 Schema

### dictionaries（词典表）

| 字段        | 类型             | 说明                       |
| ----------- | ---------------- | -------------------------- |
| id          | TEXT PK          | 词典标识（如 "cet4"）      |
| name        | TEXT NOT NULL    | 词典名称                   |
| description | TEXT             | 描述                       |
| category    | TEXT NOT NULL    | 分类（"en", "ja", "code"） |
| language    | TEXT NOT NULL    | 语言标识                   |
| wordCount   | INTEGER NOT NULL | 单词总数                   |
| userId      | TEXT             | 预留：null 为系统词典      |
| createdAt   | INTEGER NOT NULL | 创建时间戳                 |
| updatedAt   | INTEGER NOT NULL | 更新时间戳                 |

### words（单词表）

| 字段      | 类型             | 说明                  |
| --------- | ---------------- | --------------------- |
| id        | INTEGER PK AUTO  | 自增主键              |
| dictId    | TEXT NOT NULL FK | 所属词典              |
| name      | TEXT NOT NULL    | 单词本身              |
| trans     | TEXT NOT NULL    | JSON 字符串，翻译列表 |
| usphone   | TEXT             | 美式音标              |
| ukphone   | TEXT             | 英式音标              |
| notation  | TEXT             | 可选标注              |
| sortOrder | INTEGER NOT NULL | 排序位置              |

索引：`(dictId, sortOrder)` — 按章节分页查询

### favorites（收藏表）

| 字段      | 类型                | 说明                 |
| --------- | ------------------- | -------------------- |
| id        | INTEGER PK AUTO     | 自增主键             |
| userId    | TEXT                | 预留                 |
| wordId    | INTEGER NOT NULL FK | 关联单词             |
| dictId    | TEXT NOT NULL       | 冗余，方便按词典筛选 |
| createdAt | INTEGER NOT NULL    | 收藏时间             |

唯一约束：`(userId, wordId)`

### wordbooks（自定义词库表）

| 字段        | 类型             | 说明     |
| ----------- | ---------------- | -------- |
| id          | INTEGER PK AUTO  | 自增主键 |
| userId      | TEXT             | 预留     |
| name        | TEXT NOT NULL    | 词库名称 |
| description | TEXT             | 描述     |
| createdAt   | INTEGER NOT NULL | 创建时间 |
| updatedAt   | INTEGER NOT NULL | 更新时间 |

### wordbook_words（词库-单词关联表）

| 字段       | 类型                | 说明     |
| ---------- | ------------------- | -------- |
| id         | INTEGER PK AUTO     | 自增主键 |
| wordbookId | INTEGER NOT NULL FK | 所属词库 |
| wordId     | INTEGER NOT NULL FK | 关联单词 |
| sortOrder  | INTEGER NOT NULL    | 排序     |

唯一约束：`(wordbookId, wordId)`

## API 设计

基础路径：`/api/v1`

### 词典

| 方法 | 路径              | 说明             |
| ---- | ----------------- | ---------------- |
| GET  | /dictionaries     | 获取所有词典列表 |
| GET  | /dictionaries/:id | 获取单个词典详情 |

### 单词

| 方法 | 路径                                          | 说明               |
| ---- | --------------------------------------------- | ------------------ |
| GET  | /dictionaries/:id/words?chapter=0&pageSize=20 | 按章节分页获取单词 |
| GET  | /dictionaries/:id/words/search?keyword=hello  | 词典内搜索         |

### 收藏

| 方法   | 路径                   | 说明                          |
| ------ | ---------------------- | ----------------------------- |
| GET    | /favorites?dictId=cet4 | 获取收藏列表                  |
| POST   | /favorites             | 添加收藏 `{ wordId, dictId }` |
| DELETE | /favorites/:id         | 取消收藏                      |

### 自定义词库

| 方法   | 路径                         | 说明                             |
| ------ | ---------------------------- | -------------------------------- |
| GET    | /wordbooks                   | 获取词库列表                     |
| POST   | /wordbooks                   | 创建词库 `{ name, description }` |
| PUT    | /wordbooks/:id               | 更新词库信息                     |
| DELETE | /wordbooks/:id               | 删除词库                         |
| GET    | /wordbooks/:id/words         | 获取词库内单词                   |
| POST   | /wordbooks/:id/words         | 添加单词 `{ wordId }`            |
| DELETE | /wordbooks/:id/words/:wordId | 移除单词                         |

### 设计原则

- RESTful 风格，资源嵌套不超过两层
- 版本化路径，方便后续升级
- 单词查询沿用 chapter 概念，前端切换成本最低

## 前端接入策略

### 渐进式切换

1. 通过环境变量 `VITE_USE_API=true` 控制数据源
2. API 可用时走后端，不可用时 fallback 到原始 JSON
3. 验证稳定后移除 fallback 和 `/public/dicts/`

### 改动点

- `useWordList` hook 内部切换 fetcher，对外接口不变
- `Word` 类型从 `@qwerty-learner/shared` 导入
- SWR cache key 从 URL 改为 `['words', dictId, chapter]`
- 网络请求统一使用 axios

### 开发体验

- 根目录 `pnpm dev` 同时启动前端（5173）+ 后端（3001）
- Vite proxy 配置 `/api` 转发到后端，无跨域问题

## 数据导入脚本

### 流程

1. 读取 `src/resources/dictionary.ts` 中的词典元数据
2. 遍历 376 个词典，逐个处理：
   - 读取对应 JSON 文件
   - 写入 `dictionaries` 表
   - 批量写入 `words` 表（带 sortOrder）
3. 每个词典一个事务
4. 完成后输出统计（词典数、总单词数、耗时）

### 处理细节

- `trans` 字段：`string[]` → `JSON.stringify()` 存储
- `sortOrder`：取数组下标
- 空字段：`usphone`、`ukphone`、`notation` 不存在时为 null
- 幂等性：导入前清空目标表，支持重复运行

### 执行

```bash
pnpm --filter server import-dicts
```

### 数据量预估

- 376 个词典，约 20-30 万单词
- SQLite 文件预计 50-80MB
- 导入耗时预计 10-30 秒
