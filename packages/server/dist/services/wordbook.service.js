import { db, schema } from "../models";
import { eq, and } from "drizzle-orm";
export class WordbookService {
  async findAll() {
    return db.select().from(schema.wordbooks);
  }
  async create(name, description) {
    return db.insert(schema.wordbooks).values({
      name,
      description: description || null,
      userId: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  }
  async update(id, data) {
    return db
      .update(schema.wordbooks)
      .set({ ...data, updatedAt: Date.now() })
      .where(eq(schema.wordbooks.id, id));
  }
  async delete(id) {
    await db
      .delete(schema.wordbookWords)
      .where(eq(schema.wordbookWords.wordbookId, id));
    return db.delete(schema.wordbooks).where(eq(schema.wordbooks.id, id));
  }
  async getWords(wordbookId) {
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
      .where(eq(schema.wordbookWords.wordbookId, wordbookId));
  }
  async addWord(wordbookId, wordId) {
    const existing = await db
      .select()
      .from(schema.wordbookWords)
      .where(
        and(
          eq(schema.wordbookWords.wordbookId, wordbookId),
          eq(schema.wordbookWords.wordId, wordId)
        )
      );
    if (existing.length > 0) return existing[0];
    const allWords = await db
      .select({ sortOrder: schema.wordbookWords.sortOrder })
      .from(schema.wordbookWords)
      .where(eq(schema.wordbookWords.wordbookId, wordbookId));
    const maxSort =
      allWords.length > 0 ? Math.max(...allWords.map((w) => w.sortOrder)) : 0;
    const sortOrder = maxSort + 1;
    return db.insert(schema.wordbookWords).values({
      wordbookId,
      wordId,
      sortOrder,
    });
  }
  async removeWord(wordbookId, wordId) {
    return db
      .delete(schema.wordbookWords)
      .where(
        and(
          eq(schema.wordbookWords.wordbookId, wordbookId),
          eq(schema.wordbookWords.wordId, wordId)
        )
      );
  }
}
