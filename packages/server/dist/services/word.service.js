import { db, schema } from "../models";
import { eq, and, like, asc } from "drizzle-orm";
const DEFAULT_PAGE_SIZE = 20;
export class WordService {
  async findByChapter(dictId, chapter, pageSize = DEFAULT_PAGE_SIZE) {
    const offset = chapter * pageSize;
    return db
      .select()
      .from(schema.words)
      .where(eq(schema.words.dictId, dictId))
      .orderBy(asc(schema.words.sortOrder))
      .limit(pageSize)
      .offset(offset);
  }
  async search(dictId, keyword) {
    return db
      .select()
      .from(schema.words)
      .where(
        and(
          eq(schema.words.dictId, dictId),
          like(schema.words.name, `%${keyword}%`)
        )
      )
      .orderBy(asc(schema.words.sortOrder))
      .limit(50);
  }
}
