# 词典收藏功能实现计划

## 方案概述

在 Gallery 词典列表页顶部新增「我的收藏」模块，用户可以收藏/取消收藏词典，收藏列表持久化到 localStorage。

## 实现步骤

### 1. 新增全局 atom（src/store/index.ts）

添加 `favoriteDictIdsAtom`，使用 `atomWithStorage<string[]>` 存储收藏的词典 ID 列表。

### 2. 词典卡片添加收藏按钮（src/pages/Gallery-N/DictionaryWithoutCover.tsx）

在词典卡片右上角添加一个星标/心形图标按钮：

- 点击切换收藏状态
- 已收藏显示实心图标（黄色），未收藏显示空心图标
- 点击事件 stopPropagation，不触发卡片的 Dialog 打开

### 3. 新增收藏词典模块组件（src/pages/Gallery-N/FavoriteDicts.tsx）

创建一个展示收藏词典的独立区块组件：

- 标题：「⭐ 我的收藏」
- 使用与现有词典卡片相同的 grid 布局
- 收藏为空时不显示该模块
- 复用现有的 `DictionaryComponent` 卡片

### 4. 在 Gallery 页面集成（src/pages/Gallery-N/index.tsx）

在分类词典列表的上方（ScrollArea 内部顶部）渲染 FavoriteDicts 组件。

## 技术细节

- 状态持久化：`atomWithStorage('favoriteDictIds', [])` — 遵循项目现有模式
- 图标：使用 unplugin-icons 中的 tabler 图标（star / star-filled）
- 布局：复用现有的 grid 样式 `grid gap-x-5 gap-y-10 sm:grid-cols-1 md:grid-cols-2 dic3:grid-cols-3 dic4:grid-cols-4`
