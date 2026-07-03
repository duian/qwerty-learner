import { api } from '@/utils/api'
import type { IChapterRecord, IWordRecord } from '@/utils/db/record'

export async function postWordRecord(data: Omit<IWordRecord, 'id'>): Promise<number> {
  const res = await api.post('/records/word', data)
  return res.data.data.id
}

export async function fetchWordErrors(dict?: string): Promise<IWordRecord[]> {
  const params = dict ? { dict } : {}
  const res = await api.get('/records/word/errors', { params })
  return res.data.data
}

export async function deleteWordRecord(word: string, dict: string): Promise<void> {
  await api.delete('/records/word', { params: { word, dict } })
}

export async function postChapterRecord(data: Omit<IChapterRecord, 'id'>): Promise<number> {
  const res = await api.post('/records/chapter', data)
  return res.data.data.id
}

export async function fetchChapterRecords(dict?: string, chapter?: number): Promise<IChapterRecord[]> {
  const params: Record<string, string> = {}
  if (dict) params.dict = dict
  if (chapter !== undefined) params.chapter = String(chapter)
  const res = await api.get('/records/chapter', { params })
  return res.data.data
}

export async function fetchLatestReview(dict: string) {
  const res = await api.get('/records/review/latest', { params: { dict } })
  return res.data.data
}

export async function postReviewRecord(data: {
  id?: number
  dict: string
  index: number
  createTime: number
  isFinished: boolean
  words: unknown[]
}): Promise<number> {
  const res = await api.post('/records/review', data)
  return res.data.data.id
}

export async function fetchWordRecordsByTimeRange(startTimeStamp: number, endTimeStamp: number): Promise<IWordRecord[]> {
  const res = await api.get('/records/word/range', { params: { startTimeStamp, endTimeStamp } })
  return res.data.data
}

export async function fetchRecordCounts(): Promise<{ wordCount: number; chapterCount: number }> {
  const res = await api.get('/records/counts')
  return res.data.data
}

export async function fetchFirstWordRecord(): Promise<IWordRecord | null> {
  const res = await api.get('/records/word/first')
  return res.data.data
}

export async function fetchTotalWrongCount(): Promise<number> {
  const res = await api.get('/records/chapter/total-wrong')
  return res.data.data.totalWrongCount
}

export async function fetchRevisionWordCount(dict: string): Promise<number> {
  const res = await api.get('/records/word/revision-count', { params: { dict } })
  return res.data.data.wordCount
}

export async function fetchAllRecords(): Promise<{ wordRecords: IWordRecord[]; chapterRecords: IChapterRecord[] }> {
  const res = await api.get('/records/export')
  return res.data.data
}
