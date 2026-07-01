export declare const dictionaries: import("drizzle-orm/sqlite-core").SQLiteTableWithColumns<{
  name: "dictionaries";
  schema: undefined;
  columns: {
    id: import("drizzle-orm/sqlite-core").SQLiteColumn<
      {
        name: "id";
        tableName: "dictionaries";
        dataType: "string";
        columnType: "SQLiteText";
        data: string;
        driverParam: string;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: true;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        generated: undefined;
      },
      object
    >;
    name: import("drizzle-orm/sqlite-core").SQLiteColumn<
      {
        name: "name";
        tableName: "dictionaries";
        dataType: "string";
        columnType: "SQLiteText";
        data: string;
        driverParam: string;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        generated: undefined;
      },
      object
    >;
    description: import("drizzle-orm/sqlite-core").SQLiteColumn<
      {
        name: "description";
        tableName: "dictionaries";
        dataType: "string";
        columnType: "SQLiteText";
        data: string;
        driverParam: string;
        notNull: false;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        generated: undefined;
      },
      object
    >;
    category: import("drizzle-orm/sqlite-core").SQLiteColumn<
      {
        name: "category";
        tableName: "dictionaries";
        dataType: "string";
        columnType: "SQLiteText";
        data: string;
        driverParam: string;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        generated: undefined;
      },
      object
    >;
    language: import("drizzle-orm/sqlite-core").SQLiteColumn<
      {
        name: "language";
        tableName: "dictionaries";
        dataType: "string";
        columnType: "SQLiteText";
        data: string;
        driverParam: string;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        generated: undefined;
      },
      object
    >;
    languageCategory: import("drizzle-orm/sqlite-core").SQLiteColumn<
      {
        name: "language_category";
        tableName: "dictionaries";
        dataType: "string";
        columnType: "SQLiteText";
        data: string;
        driverParam: string;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        generated: undefined;
      },
      object
    >;
    tags: import("drizzle-orm/sqlite-core").SQLiteColumn<
      {
        name: "tags";
        tableName: "dictionaries";
        dataType: "string";
        columnType: "SQLiteText";
        data: string;
        driverParam: string;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        generated: undefined;
      },
      object
    >;
    wordCount: import("drizzle-orm/sqlite-core").SQLiteColumn<
      {
        name: "word_count";
        tableName: "dictionaries";
        dataType: "number";
        columnType: "SQLiteInteger";
        data: number;
        driverParam: number;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      object
    >;
    userId: import("drizzle-orm/sqlite-core").SQLiteColumn<
      {
        name: "user_id";
        tableName: "dictionaries";
        dataType: "string";
        columnType: "SQLiteText";
        data: string;
        driverParam: string;
        notNull: false;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        generated: undefined;
      },
      object
    >;
    createdAt: import("drizzle-orm/sqlite-core").SQLiteColumn<
      {
        name: "created_at";
        tableName: "dictionaries";
        dataType: "number";
        columnType: "SQLiteInteger";
        data: number;
        driverParam: number;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      object
    >;
    updatedAt: import("drizzle-orm/sqlite-core").SQLiteColumn<
      {
        name: "updated_at";
        tableName: "dictionaries";
        dataType: "number";
        columnType: "SQLiteInteger";
        data: number;
        driverParam: number;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      object
    >;
  };
  dialect: "sqlite";
}>;
export declare const words: import("drizzle-orm/sqlite-core").SQLiteTableWithColumns<{
  name: "words";
  schema: undefined;
  columns: {
    id: import("drizzle-orm/sqlite-core").SQLiteColumn<
      {
        name: "id";
        tableName: "words";
        dataType: "number";
        columnType: "SQLiteInteger";
        data: number;
        driverParam: number;
        notNull: true;
        hasDefault: true;
        isPrimaryKey: true;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      object
    >;
    dictId: import("drizzle-orm/sqlite-core").SQLiteColumn<
      {
        name: "dict_id";
        tableName: "words";
        dataType: "string";
        columnType: "SQLiteText";
        data: string;
        driverParam: string;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        generated: undefined;
      },
      object
    >;
    name: import("drizzle-orm/sqlite-core").SQLiteColumn<
      {
        name: "name";
        tableName: "words";
        dataType: "string";
        columnType: "SQLiteText";
        data: string;
        driverParam: string;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        generated: undefined;
      },
      object
    >;
    trans: import("drizzle-orm/sqlite-core").SQLiteColumn<
      {
        name: "trans";
        tableName: "words";
        dataType: "string";
        columnType: "SQLiteText";
        data: string;
        driverParam: string;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        generated: undefined;
      },
      object
    >;
    usphone: import("drizzle-orm/sqlite-core").SQLiteColumn<
      {
        name: "usphone";
        tableName: "words";
        dataType: "string";
        columnType: "SQLiteText";
        data: string;
        driverParam: string;
        notNull: false;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        generated: undefined;
      },
      object
    >;
    ukphone: import("drizzle-orm/sqlite-core").SQLiteColumn<
      {
        name: "ukphone";
        tableName: "words";
        dataType: "string";
        columnType: "SQLiteText";
        data: string;
        driverParam: string;
        notNull: false;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        generated: undefined;
      },
      object
    >;
    notation: import("drizzle-orm/sqlite-core").SQLiteColumn<
      {
        name: "notation";
        tableName: "words";
        dataType: "string";
        columnType: "SQLiteText";
        data: string;
        driverParam: string;
        notNull: false;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        generated: undefined;
      },
      object
    >;
    sortOrder: import("drizzle-orm/sqlite-core").SQLiteColumn<
      {
        name: "sort_order";
        tableName: "words";
        dataType: "number";
        columnType: "SQLiteInteger";
        data: number;
        driverParam: number;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      object
    >;
  };
  dialect: "sqlite";
}>;
export declare const favorites: import("drizzle-orm/sqlite-core").SQLiteTableWithColumns<{
  name: "favorites";
  schema: undefined;
  columns: {
    id: import("drizzle-orm/sqlite-core").SQLiteColumn<
      {
        name: "id";
        tableName: "favorites";
        dataType: "number";
        columnType: "SQLiteInteger";
        data: number;
        driverParam: number;
        notNull: true;
        hasDefault: true;
        isPrimaryKey: true;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      object
    >;
    userId: import("drizzle-orm/sqlite-core").SQLiteColumn<
      {
        name: "user_id";
        tableName: "favorites";
        dataType: "string";
        columnType: "SQLiteText";
        data: string;
        driverParam: string;
        notNull: false;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        generated: undefined;
      },
      object
    >;
    wordId: import("drizzle-orm/sqlite-core").SQLiteColumn<
      {
        name: "word_id";
        tableName: "favorites";
        dataType: "number";
        columnType: "SQLiteInteger";
        data: number;
        driverParam: number;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      object
    >;
    dictId: import("drizzle-orm/sqlite-core").SQLiteColumn<
      {
        name: "dict_id";
        tableName: "favorites";
        dataType: "string";
        columnType: "SQLiteText";
        data: string;
        driverParam: string;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        generated: undefined;
      },
      object
    >;
    createdAt: import("drizzle-orm/sqlite-core").SQLiteColumn<
      {
        name: "created_at";
        tableName: "favorites";
        dataType: "number";
        columnType: "SQLiteInteger";
        data: number;
        driverParam: number;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      object
    >;
  };
  dialect: "sqlite";
}>;
export declare const wordbooks: import("drizzle-orm/sqlite-core").SQLiteTableWithColumns<{
  name: "wordbooks";
  schema: undefined;
  columns: {
    id: import("drizzle-orm/sqlite-core").SQLiteColumn<
      {
        name: "id";
        tableName: "wordbooks";
        dataType: "number";
        columnType: "SQLiteInteger";
        data: number;
        driverParam: number;
        notNull: true;
        hasDefault: true;
        isPrimaryKey: true;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      object
    >;
    userId: import("drizzle-orm/sqlite-core").SQLiteColumn<
      {
        name: "user_id";
        tableName: "wordbooks";
        dataType: "string";
        columnType: "SQLiteText";
        data: string;
        driverParam: string;
        notNull: false;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        generated: undefined;
      },
      object
    >;
    name: import("drizzle-orm/sqlite-core").SQLiteColumn<
      {
        name: "name";
        tableName: "wordbooks";
        dataType: "string";
        columnType: "SQLiteText";
        data: string;
        driverParam: string;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        generated: undefined;
      },
      object
    >;
    description: import("drizzle-orm/sqlite-core").SQLiteColumn<
      {
        name: "description";
        tableName: "wordbooks";
        dataType: "string";
        columnType: "SQLiteText";
        data: string;
        driverParam: string;
        notNull: false;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        generated: undefined;
      },
      object
    >;
    createdAt: import("drizzle-orm/sqlite-core").SQLiteColumn<
      {
        name: "created_at";
        tableName: "wordbooks";
        dataType: "number";
        columnType: "SQLiteInteger";
        data: number;
        driverParam: number;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      object
    >;
    updatedAt: import("drizzle-orm/sqlite-core").SQLiteColumn<
      {
        name: "updated_at";
        tableName: "wordbooks";
        dataType: "number";
        columnType: "SQLiteInteger";
        data: number;
        driverParam: number;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      object
    >;
  };
  dialect: "sqlite";
}>;
export declare const wordbookWords: import("drizzle-orm/sqlite-core").SQLiteTableWithColumns<{
  name: "wordbook_words";
  schema: undefined;
  columns: {
    id: import("drizzle-orm/sqlite-core").SQLiteColumn<
      {
        name: "id";
        tableName: "wordbook_words";
        dataType: "number";
        columnType: "SQLiteInteger";
        data: number;
        driverParam: number;
        notNull: true;
        hasDefault: true;
        isPrimaryKey: true;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      object
    >;
    wordbookId: import("drizzle-orm/sqlite-core").SQLiteColumn<
      {
        name: "wordbook_id";
        tableName: "wordbook_words";
        dataType: "number";
        columnType: "SQLiteInteger";
        data: number;
        driverParam: number;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      object
    >;
    wordId: import("drizzle-orm/sqlite-core").SQLiteColumn<
      {
        name: "word_id";
        tableName: "wordbook_words";
        dataType: "number";
        columnType: "SQLiteInteger";
        data: number;
        driverParam: number;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      object
    >;
    sortOrder: import("drizzle-orm/sqlite-core").SQLiteColumn<
      {
        name: "sort_order";
        tableName: "wordbook_words";
        dataType: "number";
        columnType: "SQLiteInteger";
        data: number;
        driverParam: number;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      object
    >;
  };
  dialect: "sqlite";
}>;
