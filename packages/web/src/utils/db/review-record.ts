import { ReviewRecord } from './record'
import { fetchLatestReview, postReviewRecord } from '@/api/record-api'
import type { TErrorWordData } from '@/pages/Gallery-N/hooks/useErrorWords'
import type { Word } from '@/typings'
import { getUTCUnixTimestamp } from '@/utils'
import { useEffect, useState } from 'react'

export function useGetLatestReviewRecord(dictID: string) {
  const [wordReviewRecord, setWordReviewRecord] = useState<ReviewRecord | undefined>(undefined)
  useEffect(() => {
    const fetchWordReviewRecords = async () => {
      const record = await getLatestReviewRecord(dictID)
      setWordReviewRecord(record)
    }
    if (dictID) {
      fetchWordReviewRecords()
    }
  }, [dictID])
  return wordReviewRecord
}

async function getLatestReviewRecord(dictID: string): Promise<ReviewRecord | undefined> {
  const data = await fetchLatestReview(dictID)
  if (!data) return undefined
  if (data.isFinished) return undefined

  // Reconstruct ReviewRecord from server response
  const record = new ReviewRecord(data.dict, data.words as Word[])
  record.id = data.id
  record.index = data.index
  record.createTime = data.createTime
  record.isFinished = data.isFinished
  return record
}

type TRankedErrorWordData = TErrorWordData & {
  errorCountScore: number
  latestErrorTimeScore: number
}

export async function generateNewWordReviewRecord(dictID: string, errorData: TErrorWordData[]) {
  const errorCountRankings = [...errorData].sort((a, b) => a.errorCount - b.errorCount)
  const latestErrorTimeRankings = [...errorData].sort((a, b) => a.latestErrorTime - b.latestErrorTime)

  // 计算每个对象的排名得分
  const errorDataWithRank: TRankedErrorWordData[] = errorData.map((item) => ({
    ...item,
    errorCountScore: errorCountRankings.indexOf(item) + 1,
    latestErrorTimeScore: latestErrorTimeRankings.indexOf(item) + 1,
  }))

  // 根据加权排名进行排序
  const errorCountWeight = 0.6
  const latestErrorTimeWeight = 0.4

  const sortedWords: Word[] = errorDataWithRank
    .sort((a, b) => {
      // 计算 a 和 b 的得分
      const scoreA = a.errorCountScore * errorCountWeight + a.latestErrorTimeScore * latestErrorTimeWeight
      const scoreB = b.errorCountScore * errorCountWeight + b.latestErrorTimeScore * latestErrorTimeWeight

      // 根据得分进行排序
      return scoreA - scoreB
    })
    .map((item) => item.originData)

  const createTime = getUTCUnixTimestamp()
  const id = await postReviewRecord({
    dict: dictID,
    index: 0,
    createTime,
    isFinished: false,
    words: sortedWords,
  })

  const record = new ReviewRecord(dictID, sortedWords)
  record.id = id
  record.createTime = createTime
  return record
}

export async function putWordReviewRecord(record: ReviewRecord) {
  await postReviewRecord({
    id: record.id,
    dict: record.dict,
    index: record.index,
    createTime: record.createTime,
    isFinished: record.isFinished,
    words: record.words,
  })
}
