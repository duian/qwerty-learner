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
