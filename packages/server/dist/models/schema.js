import {
  sqliteTable,
  text,
  integer,
  uniqueIndex,
  index,
} from "drizzle-orm/sqlite-core";
export const dictionaries = sqliteTable("dictionaries", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  language: text("language").notNull(),
  languageCategory: text("language_category").notNull(),
  tags: text("tags").notNull(), // JSON string
  wordCount: integer("word_count").notNull(),
  userId: text("user_id"),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});
export const words = sqliteTable(
  "words",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    dictId: text("dict_id")
      .notNull()
      .references(() => dictionaries.id),
    name: text("name").notNull(),
    trans: text("trans").notNull(), // JSON string
    usphone: text("usphone"),
    ukphone: text("ukphone"),
    notation: text("notation"),
    sortOrder: integer("sort_order").notNull(),
  },
  (table) => ({
    dictSortIdx: index("idx_words_dict_sort").on(table.dictId, table.sortOrder),
  })
);
export const favorites = sqliteTable(
  "favorites",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id"),
    wordId: integer("word_id")
      .notNull()
      .references(() => words.id),
    dictId: text("dict_id").notNull(),
    createdAt: integer("created_at").notNull(),
  },
  (table) => ({
    userWordUniq: uniqueIndex("uniq_favorites_user_word").on(
      table.userId,
      table.wordId
    ),
  })
);
export const wordbooks = sqliteTable("wordbooks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id"),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});
export const wordbookWords = sqliteTable(
  "wordbook_words",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    wordbookId: integer("wordbook_id")
      .notNull()
      .references(() => wordbooks.id),
    wordId: integer("word_id")
      .notNull()
      .references(() => words.id),
    sortOrder: integer("sort_order").notNull(),
  },
  (table) => ({
    wordbookWordUniq: uniqueIndex("uniq_wordbook_words").on(
      table.wordbookId,
      table.wordId
    ),
  })
);
