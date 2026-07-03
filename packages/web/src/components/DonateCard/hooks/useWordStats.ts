import { fetchFirstWordRecord, fetchRecordCounts, fetchTotalWrongCount } from '@/api/record-api'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'

export function useChapterNumber() {
  const [chapterNumber, setChapterNumber] = useState<number>(0)

  useEffect(() => {
    const fetchChapterNumber = async () => {
      const { chapterCount } = await fetchRecordCounts()
      setChapterNumber(chapterCount)
    }

    fetchChapterNumber()
  }, [])

  return chapterNumber
}

export function useDayFromFirstWordRecord() {
  const [dayFromFirstWordRecord, setDayFromFirstWordRecord] = useState<number>(0)

  useEffect(() => {
    const fetchDayFromFirstWordRecord = async () => {
      const firstWordRecord = await fetchFirstWordRecord()
      const firstWordRecordTimeStamp = firstWordRecord?.timeStamp || 0
      const now = dayjs()
      const timestamp = dayjs.unix(firstWordRecordTimeStamp)
      const daysPassed = now.diff(timestamp, 'day')
      setDayFromFirstWordRecord(daysPassed)
    }

    fetchDayFromFirstWordRecord()
  }, [])

  return dayFromFirstWordRecord
}

export function useWordNumber() {
  const [wordNumber, setWordNumber] = useState<number>(0)

  useEffect(() => {
    const fetchWordNumber = async () => {
      const { wordCount } = await fetchRecordCounts()
      setWordNumber(wordCount)
    }

    fetchWordNumber()
  }, [])

  return wordNumber
}

export function useSumWrongCount() {
  const [sumWrongCount, setSumWrongCount] = useState<number>(0)

  useEffect(() => {
    const fetchSumWrongCount = async () => {
      const totalWrongCount = await fetchTotalWrongCount()
      setSumWrongCount(totalWrongCount)
    }

    fetchSumWrongCount()
  }, [])

  return sumWrongCount
}
