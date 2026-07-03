import { api } from '@/utils/api'
import type { IChapterRecord, IWordRecord } from '@/utils/db/record'

export async function postWordRecord(
  data: Omit<IWordRecord, 'id'>
): Promise<number> {
  const res = await api.post('/records/word', data)
  return res.data.data.id
}

export async function fetchWordErrors(dict?: string): Promise<IWordRecord[]> {
  const params = dict ? { dict } : {}
  const res = await api.get('/records/word/errors', { params })
  return res.data.data
}

export async function deleteWordRecord(
  word: string,
  dict: string
): Promise<void> {
  await api.delete('/records/word', { params: { word, dict } })
}

export async function postChapterRecord(
  data: Omit<IChapterRecord, 'id'>
): Promise<number> {
  const res = await api.post('/records/chapter', data)
  return res.data.data.id
}

export async function fetchChapterRecords(
  dict?: string,
  chapter?: number
): Promise<IChapterRecord[]> {
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
