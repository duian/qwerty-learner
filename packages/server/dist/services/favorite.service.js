import { db, schema } from "../models";
import { eq } from "drizzle-orm";
export class FavoriteService {
  async findAll(dictId) {
    if (dictId) {
      return db
        .select()
        .from(schema.favorites)
        .where(eq(schema.favorites.dictId, dictId));
    }
    return db.select().from(schema.favorites);
  }
  async create(wordId, dictId) {
    return db.insert(schema.favorites).values({
      wordId,
      dictId,
      userId: null,
      createdAt: Date.now(),
    });
  }
  async delete(id) {
    return db.delete(schema.favorites).where(eq(schema.favorites.id, id));
  }
}
