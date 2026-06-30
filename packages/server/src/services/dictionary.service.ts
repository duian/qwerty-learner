import { db, schema } from "../models";
import { eq } from "drizzle-orm";

export class DictionaryService {
  async findAll() {
    return db.select().from(schema.dictionaries);
  }

  async findById(id: string) {
    const result = await db
      .select()
      .from(schema.dictionaries)
      .where(eq(schema.dictionaries.id, id));
    return result[0] || null;
  }
}
