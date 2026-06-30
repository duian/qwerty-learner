# 设计文档

## 概述

自定义词典功能为 Qwerty Learner 添加了完整的用户词典管理能力。该功能允许用户创建、编辑和管理个性化词汇表，支持单词的增删改查，并提供导入导出功能以实现数据备份和分享。

核心设计原则：

- **数据隔离**：自定义词典与系统词典在存储和展示上保持独立
- **格式兼容**：自定义词典数据格式与系统词典完全兼容，确保无缝集成到现有练习流程
- **本地优先**：所有数据存储在 IndexedDB 中，保护用户隐私
- **用户友好**：提供直观的 UI 和清晰的操作流程

## 架构

### 系统架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        用户界面层                            │
├─────────────────────────────────────────────────────────────┤
│  Gallery Page  │  Create Dict  │  Manage Words  │  Typing   │
│  (词典选择)    │  (创建词典)   │  (单词管理)    │  (练习)   │
└────────┬────────────────┬────────────────┬─────────────┬────┘
         │                │                │             │
         ▼                ▼                ▼             ▼
┌─────────────────────────────────────────────────────────────┐
│                        状态管理层 (Jotai)                    │
├─────────────────────────────────────────────────────────────┤
│  customDictionariesAtom  │  currentCustomDictAtom           │
│  currentDictWordsAtom    │  currentDictIdAtom (扩展)        │
└────────┬────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│                        业务逻辑层                            │
├─────────────────────────────────────────────────────────────┤
│  CustomDictService  │  WordService  │  ImportExportService  │
└────────┬────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│                        数据访问层 (Dexie)                    │
├─────────────────────────────────────────────────────────────┤
│  customDictionaries Table  │  customWords Table             │
└────────┬────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│                        IndexedDB                             │
└─────────────────────────────────────────────────────────────┘
```

### 数据流

**创建词典流程**：

```
用户输入 → CreateDictForm → CustomDictService.create()
         → Dexie.customDictionaries.add() → IndexedDB
         → 更新 customDictionariesAtom → 刷新 UI
```

**添加单词流程**：

```
用户输入 → AddWordForm → WordService.add()
         → Dexie.customWords.add() → IndexedDB
         → 更新词典 length → 更新 currentDictWordsAtom → 刷新 UI
```

**练习流程**：

```
选择自定义词典 → 加载 customWords → 转换为 Word[] 格式
              → 传递给 Typing 组件 → 正常练习流程
```

## 组件和接口

### 数据模型

#### CustomDictionary（自定义词典）

```typescript
interface CustomDictionary {
  id: string // 主键，等于 name
  name: string // 词典名称（1-50字符）
  description: string // 词典描述（最多200字符）
  category: string // 分类（固定为"自定义"）
  tags: string[] // 标签（默认 ["自定义"]）
  language: LanguageType // 语言类型（默认 "en"）
  languageCategory: LanguageCategoryType // 语言分类（默认 "en"）
  length: number // 单词数量
  chapterCount: number // 章节数（自动计算：Math.ceil(length / 20)）
  createdAt: number // 创建时间戳
  updatedAt: number // 更新时间戳
  isCustom: true // 标识为自定义词典
}
```

#### CustomWord（自定义单词）

```typescript
interface CustomWord {
  id?: number // 自增主键（由 Dexie 自动生成）
  dictId: string // 外键，关联词典 ID
  name: string // 单词（1-50字符）
  trans: string[] // 翻译数组
  usphone?: string // 美式音标（可选）
  ukphone?: string // 英式音标（可选）
  createdAt: number // 创建时间戳
  updatedAt: number // 更新时间戳
}
```

#### ExportFormat（导出格式）

```typescript
interface ExportFormat {
  metadata: {
    name: string
    description: string
    category: string
    length: number
    createdAt: number
    exportedAt: number
  }
  words: Array<{
    name: string
    trans: string[]
    usphone?: string
    ukphone?: string
  }>
}
```

### 核心服务接口

#### CustomDictService

```typescript
class CustomDictService {
  // 创建词典
  async create(dict: Omit<CustomDictionary, 'id' | 'createdAt' | 'updatedAt' | 'length' | 'chapterCount' | 'isCustom'>): Promise<string>

  // 更新词典元数据
  async update(
    id: string,
    updates: Partial<Pick<CustomDictionary, 'name' | 'description' | 'category' | 'tags' | 'language'>>,
  ): Promise<void>

  // 删除词典（级联删除所有单词）
  async delete(id: string): Promise<void>

  // 获取所有自定义词典
  async getAll(): Promise<CustomDictionary[]>

  // 根据 ID 获取词典
  async getById(id: string): Promise<CustomDictionary | undefined>

  // 更新词典的单词数量
  async updateLength(id: string, length: number): Promise<void>

  // 验证词典名称是否可用
  async isNameAvailable(name: string, excludeId?: string): Promise<boolean>
}
```

#### WordService

```typescript
class WordService {
  // 添加单词
  async add(word: Omit<CustomWord, 'id' | 'createdAt' | 'updatedAt'>): Promise<number>

  // 更新单词
  async update(id: number, updates: Partial<Omit<CustomWord, 'id' | 'dictId' | 'createdAt'>>): Promise<void>

  // 删除单词
  async delete(id: number): Promise<void>

  // 获取词典的所有单词
  async getByDictId(dictId: string): Promise<CustomWord[]>

  // 批量添加单词
  async addBatch(words: Array<Omit<CustomWord, 'id' | 'createdAt' | 'updatedAt'>>): Promise<number[]>

  // 搜索单词
  async search(dictId: string, query: string): Promise<CustomWord[]>
}
```

#### ImportExportService

```typescript
class ImportExportService {
  // 导出词典为 JSON
  async exportDict(dictId: string): Promise<Blob>

  // 导入词典
  async importDict(file: File): Promise<{ success: boolean; dictId?: string; error?: string }>

  // 验证导入文件格式
  validateImportFile(data: unknown): { valid: boolean; error?: string }

  // 生成导出文件名
  generateExportFilename(dictName: string): string
}
```

### React 组件接口

#### CreateCustomDictPage

```typescript
interface CreateCustomDictPageProps {}

// 表单数据
interface DictFormData {
  name: string
  description: string
  category: string
  language: LanguageType
}
```

#### ManageWordsPage

```typescript
interface ManageWordsPageProps {
  // 从路由参数获取 dictId
}

interface WordFormData {
  name: string
  trans: string
  usphone: string
  ukphone: string
}
```

#### CustomDictCard

```typescript
interface CustomDictCardProps {
  dict: CustomDictionary
  onEdit: (dict: CustomDictionary) => void
  onDelete: (dictId: string) => void
  onSelect: (dictId: string) => void
}
```

#### WordListTable

```typescript
interface WordListTableProps {
  words: CustomWord[]
  onEdit: (word: CustomWord) => void
  onDelete: (wordId: number) => void
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}
```

### 数据库 Schema

```typescript
// 扩展 RecordDB 类
class RecordDB extends Dexie {
  // 现有表...
  customDictionaries!: Table<CustomDictionary, string>
  customWords!: Table<CustomWord, number>

  constructor() {
    super('RecordDB')

    // 现有版本...

    // 新增版本 4
    this.version(4).stores({
      // 保留现有表定义...
      wordRecords: '++id,word,timeStamp,dict,chapter,wrongCount,[dict+chapter]',
      chapterRecords: '++id,timeStamp,dict,chapter,time,[dict+chapter]',
      reviewRecords: '++id,dict,createTime,isFinished',

      // 新增表
      customDictionaries: 'id,name,createdAt,updatedAt,category',
      customWords: '++id,dictId,name,[dictId+name],createdAt',
    })
  }
}
```

**索引说明**：

- `customDictionaries`:
  - 主键：`id`（词典名称）
  - 索引：`name`（用于名称唯一性检查）、`createdAt`（用于排序）
- `customWords`:
  - 主键：`++id`（自增）
  - 索引：`dictId`（用于查询词典的所有单词）、`[dictId+name]`（复合索引，用于检查同一词典内单词重复）

## 数据模型

### 实体关系图

```
┌─────────────────────────┐
│  CustomDictionary       │
├─────────────────────────┤
│  id (PK)                │
│  name                   │
│  description            │
│  category               │
│  tags                   │
│  language               │
│  languageCategory       │
│  length                 │
│  chapterCount           │
│  createdAt              │
│  updatedAt              │
│  isCustom               │
└────────┬────────────────┘
         │ 1
         │
         │ has many
         │
         │ N
┌────────▼────────────────┐
│  CustomWord             │
├─────────────────────────┤
│  id (PK)                │
│  dictId (FK)            │
│  name                   │
│  trans                  │
│  usphone                │
│  ukphone                │
│  createdAt              │
│  updatedAt              │
└─────────────────────────┘
```

### 数据转换

**CustomWord → Word（用于练习）**：

```typescript
function customWordToWord(customWord: CustomWord): Word {
  return {
    name: customWord.name,
    trans: customWord.trans,
    usphone: customWord.usphone || '',
    ukphone: customWord.ukphone || '',
  }
}
```

**CustomDictionary → Dictionary（用于展示）**：

```typescript
function customDictToDictionary(customDict: CustomDictionary): Dictionary {
  return {
    id: customDict.id,
    name: customDict.name,
    description: customDict.description,
    category: customDict.category,
    tags: customDict.tags,
    url: '', // 自定义词典没有 URL
    length: customDict.length,
    language: customDict.language,
    languageCategory: customDict.languageCategory,
    chapterCount: customDict.chapterCount,
  }
}
```

## 正确性属性

_属性是一个特征或行为，应该在系统的所有有效执行中保持为真——本质上是关于系统应该做什么的形式化陈述。属性作为人类可读规范和机器可验证正确性保证之间的桥梁。_

### 属性 1：词典创建的有效性

*对于任何*包含有效名称（非空、不重复、无特殊字符）和有效分类的词典数据，创建操作应该成功并返回新词典的 ID
**验证：需求 1.2**

### 属性 2：空白名称拒绝

*对于任何*仅由空白字符组成的字符串（空格、制表符、换行符等），作为词典名称提交时应该被拒绝
**验证：需求 1.3**

### 属性 3：重复名称拒绝

*对于任何*已存在的词典名称（无论是自定义词典还是系统词典），尝试创建同名词典应该被拒绝
**验证：需求 1.4**

### 属性 4：特殊字符名称拒绝

*对于任何*包含特殊字符（除英文字母、数字、下划线、中划线、空格外）的字符串，作为词典名称提交时应该被拒绝
**验证：需求 1.5**

### 属性 5：单词添加增加计数

*对于任何*词典和任何有效单词，成功添加单词后，词典的 length 字段应该增加 1
**验证：需求 2.4**

### 属性 6：单词删除减少计数

*对于任何*包含至少一个单词的词典，删除一个单词后，词典的 length 字段应该减少 1
**验证：需求 3.4**

### 属性 7：编辑表单预填充

*对于任何*单词，点击编辑按钮后显示的表单应该包含该单词的当前所有字段值（name、trans、usphone、ukphone）
**验证：需求 3.1**

### 属性 8：单词更新保持身份

*对于任何*单词，更新其字段后，单词的 ID 和 dictId 应该保持不变
**验证：需求 3.2**

### 属性 9：取消操作保持不变

*对于任何*删除操作，如果用户取消确认，则目标数据（单词或词典）应该保持完全不变
**验证：需求 3.5, 5.5**

### 属性 10：词典卡片显示完整信息

*对于任何*自定义词典，其卡片渲染应该包含名称、描述、单词数量和创建时间这四个字段
**验证：需求 4.2**

### 属性 11：自定义词典与系统词典等价

*对于任何*自定义词典，当被选中用于练习时，其单词加载和显示行为应该与系统词典完全相同
**验证：需求 4.4**

### 属性 12：级联删除完整性

*对于任何*词典，删除该词典后，所有关联的单词记录也应该被删除，且不应留下孤立的单词数据
**验证：需求 5.4**

### 属性 13：导出导入往返一致性

*对于任何*自定义词典，导出为 JSON 文件后再导入，应该创建一个包含相同单词数据的新词典（元数据如时间戳可能不同）
**验证：需求 6.1, 6.3, 7.2**

### 属性 14：导出文件命名格式

*对于任何*词典导出操作，生成的文件名应该符合格式 `{词典名称}_{YYYY-MM-DD}.json`
**验证：需求 6.2**

### 属性 15：名称冲突自动重命名

*对于任何*导入的词典，如果其名称与现有词典冲突，系统应该自动在名称后添加后缀 "(1)"、"(2)" 等，直到名称唯一
**验证：需求 7.3**

### 属性 16：无效 JSON 拒绝

*对于任何*不符合 JSON 格式或缺少必需字段（words 数组）的文件，导入操作应该失败并显示错误信息
**验证：需求 7.4**

### 属性 17：部分导入容错

*对于任何*包含部分无效单词数据的导入文件，系统应该跳过无效单词，导入有效单词，并在完成后报告跳过的数量
**验证：需求 7.5**

### 属性 18：分页一致性

*对于任何*包含超过 20 个单词的词典，单词列表应该被分页，且所有页面的单词总数应该等于词典的 length
**验证：需求 8.1**

### 属性 19：搜索过滤正确性

*对于任何*搜索查询，过滤后的单词列表中的每个单词的 name 或 trans 字段应该包含查询字符串
**验证：需求 8.2**

### 属性 20：单词列表表格完整性

*对于任何*单词列表渲染，每一行应该包含序号、单词、音标、翻译和操作按钮这五个元素
**验证：需求 8.3**

### 属性 21：数据持久化往返

*对于任何*创建或修改的词典数据，保存到 IndexedDB 后立即读取，应该得到相同的数据
**验证：需求 9.1, 9.2**

### 属性 22：时间戳自动记录

*对于任何*新创建的词典或单词，其 createdAt 字段应该被设置为当前时间戳；对于任何更新操作，updatedAt 字段应该被更新为当前时间戳
**验证：需求 9.3**

## 错误处理

### 数据库错误

**场景**：IndexedDB 操作失败（存储空间不足、权限问题等）

**处理策略**：

- 捕获 Dexie 异常并转换为用户友好的错误消息
- 显示 Toast 通知告知用户操作失败
- 对于关键操作（如创建词典），提供重试选项
- 记录错误到控制台以便调试

```typescript
try {
  await db.customDictionaries.add(dict)
} catch (error) {
  if (error.name === 'QuotaExceededError') {
    showToast('存储空间不足，请清理浏览器数据或导出词典备份')
  } else {
    showToast('保存失败，请重试')
    console.error('Failed to save dictionary:', error)
  }
}
```

### 验证错误

**场景**：用户输入不符合验证规则

**处理策略**：

- 在表单字段下方显示内联错误消息
- 禁用提交按钮直到所有验证通过
- 使用红色边框高亮显示错误字段
- 提供清晰的错误描述和修正建议

**验证规则**：

- 词典名称：1-50 字符，不能为空，不能重复，只能包含字母、数字、下划线、中划线、空格
- 词典描述：最多 200 字符
- 单词名称：1-50 字符，不能为空
- 单词翻译：1-200 字符，不能为空
- 音标：最多 100 字符

### 导入错误

**场景**：导入的文件格式不正确或数据无效

**处理策略**：

- 在文件选择后立即验证文件类型（必须是 .json）
- 解析 JSON 后验证数据结构
- 对于格式错误，显示具体的错误位置和原因
- 对于部分数据无效，显示成功导入的单词数和跳过的单词数

```typescript
interface ImportResult {
  success: boolean
  dictId?: string
  importedWords: number
  skippedWords: number
  errors: string[]
}
```

### 并发冲突

**场景**：多个标签页同时修改同一词典

**处理策略**：

- IndexedDB 本身支持事务，可以防止数据损坏
- 使用 Dexie 的事务机制确保原子性操作
- 对于可能的冲突（如同时删除），采用"最后写入获胜"策略
- 考虑使用 BroadcastChannel API 在标签页间同步状态（可选，V2 功能）

### 网络错误

**场景**：虽然是本地应用，但可能涉及音频资源加载

**处理策略**：

- 对于自定义词典，音频功能依赖在线 API（如有）
- 如果音频加载失败，显示提示但不阻止练习
- 提供"跳过发音"选项

## 测试策略

### 单元测试

使用 **Vitest** 作为测试框架，测试覆盖以下内容：

**服务层测试**：

- `CustomDictService` 的所有 CRUD 操作
- `WordService` 的所有 CRUD 操作
- `ImportExportService` 的导入导出逻辑
- 数据验证函数
- 数据转换函数

**示例测试用例**：

```typescript
describe('CustomDictService', () => {
  it('should create a dictionary with valid data', async () => {
    const dict = {
      name: 'Test Dict',
      description: 'Test description',
      category: '自定义',
      tags: ['自定义'],
      language: 'en' as LanguageType,
      languageCategory: 'en' as LanguageCategoryType,
    }
    const id = await CustomDictService.create(dict)
    expect(id).toBe('Test Dict')

    const saved = await CustomDictService.getById(id)
    expect(saved).toBeDefined()
    expect(saved?.name).toBe('Test Dict')
  })

  it('should reject duplicate dictionary names', async () => {
    const dict = {
      name: 'Duplicate',
      description: 'Test',
      category: '自定义',
      tags: ['自定义'],
      language: 'en' as LanguageType,
      languageCategory: 'en' as LanguageCategoryType,
    }
    await CustomDictService.create(dict)

    await expect(CustomDictService.create(dict)).rejects.toThrow()
  })
})
```

**组件测试**：

- 表单验证逻辑
- 用户交互处理
- 状态更新
- 条件渲染

使用 **React Testing Library** 进行组件测试：

```typescript
describe('CreateCustomDictPage', () => {
  it('should show validation error for empty name', async () => {
    render(<CreateCustomDictPage />)

    const submitButton = screen.getByText('创建')
    fireEvent.click(submitButton)

    expect(screen.getByText('词典名称不能为空')).toBeInTheDocument()
  })
})
```

### 属性测试

使用 **fast-check** 作为属性测试库（JavaScript/TypeScript 的 PBT 库）。每个属性测试配置为运行至少 100 次迭代。

**属性测试必须使用以下格式标注**：

```typescript
// Feature: custom-dictionary, Property 1: 词典创建的有效性
```

**核心属性测试**：

```typescript
import fc from 'fast-check'

// Feature: custom-dictionary, Property 1: 词典创建的有效性
describe('Property 1: Dictionary creation validity', () => {
  it('should create dictionary for any valid input', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 50 }).filter((s) => /^[a-zA-Z0-9_\-\s\u4e00-\u9fa5]+$/.test(s)),
          description: fc.string({ maxLength: 200 }),
          category: fc.constantFrom('自定义', '专业术语', '错题本', '其他'),
        }),
        async (dictData) => {
          const id = await CustomDictService.create({
            ...dictData,
            tags: ['自定义'],
            language: 'en',
            languageCategory: 'en',
          })

          expect(id).toBe(dictData.name)
          const saved = await CustomDictService.getById(id)
          expect(saved).toBeDefined()

          // Cleanup
          await CustomDictService.delete(id)
        },
      ),
      { numRuns: 100 },
    )
  })
})

// Feature: custom-dictionary, Property 2: 空白名称拒绝
describe('Property 2: Blank name rejection', () => {
  it('should reject any whitespace-only string as name', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string().filter((s) => s.trim() === '' && s.length > 0),
        async (blankName) => {
          await expect(
            CustomDictService.create({
              name: blankName,
              description: 'Test',
              category: '自定义',
              tags: ['自定义'],
              language: 'en',
              languageCategory: 'en',
            }),
          ).rejects.toThrow()
        },
      ),
      { numRuns: 100 },
    )
  })
})

// Feature: custom-dictionary, Property 5: 单词添加增加计数
describe('Property 5: Word addition increases count', () => {
  it('should increase dictionary length by 1 for any word addition', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          dictName: fc.string({ minLength: 1, maxLength: 20 }).filter((s) => /^[a-zA-Z0-9_\-]+$/.test(s)),
          word: fc.record({
            name: fc.string({ minLength: 1, maxLength: 50 }),
            trans: fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 1 }),
          }),
        }),
        async ({ dictName, word }) => {
          // Create dictionary
          const dictId = await CustomDictService.create({
            name: dictName,
            description: 'Test',
            category: '自定义',
            tags: ['自定义'],
            language: 'en',
            languageCategory: 'en',
          })

          const beforeLength = (await CustomDictService.getById(dictId))!.length

          // Add word
          await WordService.add({
            dictId,
            name: word.name,
            trans: word.trans,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          })

          const afterLength = (await CustomDictService.getById(dictId))!.length
          expect(afterLength).toBe(beforeLength + 1)

          // Cleanup
          await CustomDictService.delete(dictId)
        },
      ),
      { numRuns: 100 },
    )
  })
})

// Feature: custom-dictionary, Property 13: 导出导入往返一致性
describe('Property 13: Export-import round-trip consistency', () => {
  it('should preserve word data through export and import', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          dictName: fc.string({ minLength: 1, maxLength: 20 }).filter((s) => /^[a-zA-Z0-9_\-]+$/.test(s)),
          words: fc.array(
            fc.record({
              name: fc.string({ minLength: 1, maxLength: 20 }),
              trans: fc.array(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 3 }),
            }),
            { minLength: 1, maxLength: 10 },
          ),
        }),
        async ({ dictName, words }) => {
          // Create dictionary and add words
          const dictId = await CustomDictService.create({
            name: dictName,
            description: 'Test',
            category: '自定义',
            tags: ['自定义'],
            language: 'en',
            languageCategory: 'en',
          })

          for (const word of words) {
            await WordService.add({
              dictId,
              ...word,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            })
          }

          // Export
          const exportBlob = await ImportExportService.exportDict(dictId)
          const exportText = await exportBlob.text()
          const exportData = JSON.parse(exportText)

          // Import
          const importFile = new File([exportText], 'test.json', { type: 'application/json' })
          const result = await ImportExportService.importDict(importFile)

          expect(result.success).toBe(true)

          // Verify words match
          const importedWords = await WordService.getByDictId(result.dictId!)
          expect(importedWords.length).toBe(words.length)

          // Cleanup
          await CustomDictService.delete(dictId)
          await CustomDictService.delete(result.dictId!)
        },
      ),
      { numRuns: 100 },
    )
  })
})
```

**生成器策略**：

- 使用 `fc.string()` 生成各种字符串，配合 `filter` 约束到有效范围
- 使用 `fc.record()` 生成复杂对象
- 使用 `fc.array()` 生成单词列表
- 使用 `fc.constantFrom()` 从固定选项中选择
- 对于特殊字符测试，使用 `fc.char()` 和 `fc.unicode()` 生成各种字符

### 集成测试

使用 **Playwright** 进行端到端测试：

**测试场景**：

1. 完整的词典创建流程
2. 添加多个单词并练习
3. 编辑和删除操作
4. 导出和导入流程
5. 与系统词典的交互

**示例测试**：

```typescript
test('complete custom dictionary workflow', async ({ page }) => {
  await page.goto('/gallery')

  // Create dictionary
  await page.click('text=创建自定义词典')
  await page.fill('input[name="name"]', 'E2E Test Dict')
  await page.fill('textarea[name="description"]', 'Test description')
  await page.click('button:has-text("创建")')

  // Add words
  await page.click('text=添加单词')
  await page.fill('input[name="word"]', 'test')
  await page.fill('input[name="trans"]', '测试')
  await page.click('button:has-text("保存")')

  // Verify word appears in list
  await expect(page.locator('text=test')).toBeVisible()

  // Start practice
  await page.goto('/gallery')
  await page.click('text=E2E Test Dict')
  await page.goto('/')

  // Verify practice works
  await expect(page.locator('text=test')).toBeVisible()
})
```

### 测试数据管理

**测试前清理**：

```typescript
beforeEach(async () => {
  // Clear test data
  await db.customDictionaries.clear()
  await db.customWords.clear()
})
```

**测试后清理**：

```typescript
afterEach(async () => {
  // Cleanup any created test data
  const testDicts = await db.customDictionaries.filter((d) => d.name.startsWith('Test') || d.name.startsWith('E2E')).toArray()

  for (const dict of testDicts) {
    await CustomDictService.delete(dict.id)
  }
})
```

### 测试覆盖率目标

- 服务层代码覆盖率：> 90%
- 组件代码覆盖率：> 80%
- 属性测试：覆盖所有核心正确性属性
- 集成测试：覆盖所有主要用户流程
