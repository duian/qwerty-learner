# 错题集练习功能实现计划

## 方案概述

在错题集页面添加"开始练习"按钮，点击后将错题集中的单词加载到 Typing 页面进行练习。练习完成后，正确输入的单词自动从错题集数据库中移除。

## 实现方式

利用已有的 **review mode** 机制：将错题集单词注入 `reviewModeInfoAtom`，导航到 Typing 页进行练习。

## 实现步骤

### 1. 错题集页面添加"开始练习"按钮（src/pages/ErrorBook/index.tsx）

- 在页面顶部操作栏添加"开始练习"按钮
- 点击后：
  1. 从 DB 查询所有错题单词的完整 Word 数据（name, trans, usphone, ukphone）
  2. 构建 ReviewRecord 对象，将错题单词列表作为 words
  3. 设置 `reviewModeInfoAtom` 为 `{ isReviewMode: true, reviewRecord }`
  4. 导航到 `/`

### 2. 新增 hook 获取错题集 Word 数据（src/pages/ErrorBook/hooks/useErrorBookWords.ts）

- 从 DB 获取所有 wrongCount > 0 的单词记录
- 去重（按 word name）
- 通过 wordListFetcher 获取对应词典的完整 Word 数据
- 返回 Word[] 用于填充 review mode

### 3. ResultScreen 结束时清理错题记录

在 Typing 完成章节（isFinished）后，如果是从错题集进入的 review mode：

- 获取正确完成的单词列表（wrongCount === 0 的 userInputLogs）
- 从 DB 中删除这些单词的错误记录

### 4. 标识"错题练习模式"

在 reviewRecord 中使用 `dict: 'errorBook'` 作为标识，区分普通 review mode 和错题练习模式。ResultScreen 可据此判断是否需要清理错题记录。

## 技术细节

- 错题单词数据来源：直接使用 DB 中存储的 word name，再通过各词典 URL fetch 获取完整 Word 对象（已有 useGetWord 可参考）
- 简化方案：直接从 groupedRecords 中构建 Word 对象（name + trans from record 中无 trans，需要从词典获取）
- 最简方案：由于 WordRecord 只存 word name 和 dict，用 SWR 批量拉取词典获取完整数据

考虑到简洁性，最终方案：在 ErrorBook 页面已经有按词典分组的 records，直接批量 fetch 各词典文件，匹配出对应 Word 对象即可。
