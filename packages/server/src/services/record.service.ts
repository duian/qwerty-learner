import { db } from "../models";
import { wordRecords, chapterRecords, reviewRecords } from "../models/schema";
import { eq, and, gt, gte, lte, desc, count, sql } from "drizzle-orm";

export class RecordService {
  async addWordRecord(data: {
    word: string;
    dict: string;
    chapter: number | null;
    timing: number[];
    wrongCount: number;
    mistakes: Record<number, string[]>;
    timeStamp: number;
  }) {
    const result = await db
      .insert(wordRecords)
      .values({
        word: data.word,
        dict: data.dict,
        chapter: data.chapter,
        timing: JSON.stringify(data.timing),
        wrongCount: data.wrongCount,
        mistakes: JSON.stringify(data.mistakes),
        timeStamp: data.timeStamp,
      })
      .returning({ id: wordRecords.id });
    return result[0].id;
  }

  async getWordRecordsWithErrors(dict?: string) {
    const conditions = [gt(wordRecords.wrongCount, 0)];
    if (dict) {
      conditions.push(eq(wordRecords.dict, dict));
    }
    const rows = await db
      .select()
      .from(wordRecords)
      .where(and(...conditions));
    return rows.map((r) => ({
      ...r,
      timing: JSON.parse(r.timing) as number[],
      mistakes: JSON.parse(r.mistakes) as Record<number, string[]>,
    }));
  }

  async deleteWordRecordsByWordAndDict(word: string, dict: string) {
    await db
      .delete(wordRecords)
      .where(and(eq(wordRecords.word, word), eq(wordRecords.dict, dict)));
  }

  async addChapterRecord(data: {
    dict: string;
    chapter: number | null;
    timeStamp: number;
    time: number;
    correctCount: number;
    wrongCount: number;
    wordCount: number;
    wordNumber: number;
    correctWordIndexes: number[];
    wordRecordIds: number[];
  }) {
    const result = await db
      .insert(chapterRecords)
      .values({
        ...data,
        correctWordIndexes: JSON.stringify(data.correctWordIndexes),
        wordRecordIds: JSON.stringify(data.wordRecordIds),
      })
      .returning({ id: chapterRecords.id });
    return result[0].id;
  }

  async getChapterRecords(dict?: string, chapter?: number) {
    const conditions = [];
    if (dict) conditions.push(eq(chapterRecords.dict, dict));
    if (chapter !== undefined)
      conditions.push(eq(chapterRecords.chapter, chapter));
    const rows = await db
      .select()
      .from(chapterRecords)
      .where(conditions.length ? and(...conditions) : undefined);
    return rows.map((r) => ({
      ...r,
      correctWordIndexes: JSON.parse(r.correctWordIndexes) as number[],
      wordRecordIds: JSON.parse(r.wordRecordIds) as number[],
    }));
  }

  async getLatestReviewRecord(dict: string) {
    const rows = await db
      .select()
      .from(reviewRecords)
      .where(
        and(eq(reviewRecords.dict, dict), eq(reviewRecords.isFinished, false))
      )
      .orderBy(desc(reviewRecords.createTime))
      .limit(1);
    if (rows.length === 0) return null;
    return { ...rows[0], words: JSON.parse(rows[0].words) };
  }

  async upsertReviewRecord(data: {
    id?: number;
    dict: string;
    index: number;
    createTime: number;
    isFinished: boolean;
    words: unknown[];
  }) {
    if (data.id) {
      await db
        .update(reviewRecords)
        .set({
          index: data.index,
          isFinished: data.isFinished,
          words: JSON.stringify(data.words),
        })
        .where(eq(reviewRecords.id, data.id));
      return data.id;
    }
    const result = await db
      .insert(reviewRecords)
      .values({
        dict: data.dict,
        index: data.index,
        createTime: data.createTime,
        isFinished: data.isFinished,
        words: JSON.stringify(data.words),
      })
      .returning({ id: reviewRecords.id });
    return result[0].id;
  }

  async getWordRecordsByTimeRange(startTimeStamp: number, endTimeStamp: number) {
    const rows = await db
      .select()
      .from(wordRecords)
      .where(
        and(
          gte(wordRecords.timeStamp, startTimeStamp),
          lte(wordRecords.timeStamp, endTimeStamp)
        )
      );
    return rows.map((r) => ({
      ...r,
      timing: JSON.parse(r.timing) as number[],
      mistakes: JSON.parse(r.mistakes) as Record<number, string[]>,
    }));
  }

  async getWordRecordCount() {
    const result = await db.select({ value: count() }).from(wordRecords);
    return result[0].value;
  }

  async getChapterRecordCount() {
    const result = await db.select({ value: count() }).from(chapterRecords);
    return result[0].value;
  }

  async getFirstWordRecord() {
    const rows = await db
      .select()
      .from(wordRecords)
      .orderBy(wordRecords.timeStamp)
      .limit(1);
    if (rows.length === 0) return null;
    const r = rows[0];
    return {
      ...r,
      timing: JSON.parse(r.timing) as number[],
      mistakes: JSON.parse(r.mistakes) as Record<number, string[]>,
    };
  }

  async getTotalWrongCount() {
    const result = await db
      .select({ value: sql<number>`sum(${chapterRecords.wrongCount})` })
      .from(chapterRecords);
    return result[0].value ?? 0;
  }

  async getRevisionWordCount(dict: string) {
    const rows = await db
      .select({ word: wordRecords.word, dict: wordRecords.dict })
      .from(wordRecords)
      .where(and(eq(wordRecords.dict, dict), gt(wordRecords.wrongCount, 0)));
    // deduplicate by word+dict
    const seen = new Set<string>();
    for (const r of rows) {
      seen.add(r.word + r.dict);
    }
    return seen.size;
  }

  async getAllWordRecords() {
    const rows = await db.select().from(wordRecords);
    return rows.map((r) => ({
      ...r,
      timing: JSON.parse(r.timing) as number[],
      mistakes: JSON.parse(r.mistakes) as Record<number, string[]>,
    }));
  }

  async getAllChapterRecords() {
    const rows = await db.select().from(chapterRecords);
    return rows.map((r) => ({
      ...r,
      correctWordIndexes: JSON.parse(r.correctWordIndexes) as number[],
      wordRecordIds: JSON.parse(r.wordRecordIds) as number[],
    }));
  }
}
