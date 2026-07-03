import { fetchChapterRecords } from '@/api/record-api'
import { currentDictIdAtom } from '@/store'
import type { IChapterRecord } from '@/utils/db/record'
import { useAtomValue } from 'jotai'
import { useEffect, useState } from 'react'

export function useChapterStats(chapter: number, isStartLoad: boolean) {
  const dictID = useAtomValue(currentDictIdAtom)
  const [chapterStats, setChapterStats] = useState<IChapterStats | null>(null)

  useEffect(() => {
    const fetchChapterStats = async () => {
      const stats = await getChapterStats(dictID, chapter)
      setChapterStats(stats)
    }

    if (isStartLoad && !chapterStats) {
      fetchChapterStats()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dictID, chapter, isStartLoad])

  return chapterStats
}

interface IChapterStats {
  exerciseCount: number
  avgWrongCount: number
}

async function getChapterStats(dict: string, chapter: number | null): Promise<IChapterStats> {
  const records: IChapterRecord[] = await fetchChapterRecords(dict, chapter ?? undefined)

  const exerciseCount = records.length
  const totalWrongCount = records.reduce((total, { wrongCount }) => total + (wrongCount || 0), 0)
  const avgWrongCount = exerciseCount > 0 ? totalWrongCount / exerciseCount : 0

  return { exerciseCount, avgWrongCount }
}
