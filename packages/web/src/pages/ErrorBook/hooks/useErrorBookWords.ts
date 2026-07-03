import { fetchWordErrors } from '@/api/record-api'
import { idDictionaryMap } from '@/resources/dictionary'
import type { Word } from '@/typings'
import { wordListFetcher } from '@/utils/wordListFetcher'
import { useCallback, useState } from 'react'

/**
 * 获取错题集中所有单词的完整 Word 数据
 * 从 API 读取错题记录，去重后按词典分组，批量 fetch 词典文件匹配出 Word 对象
 */
export function useErrorBookWords() {
  const [isLoading, setIsLoading] = useState(false)

  const fetchErrorBookWords = useCallback(async (): Promise<Word[]> => {
    setIsLoading(true)
    try {
      const records = await fetchWordErrors()

      // 按词典分组，去重单词
      const dictWordMap = new Map<string, Set<string>>()
      for (const record of records) {
        if (!dictWordMap.has(record.dict)) {
          dictWordMap.set(record.dict, new Set())
        }
        dictWordMap.get(record.dict)!.add(record.word)
      }

      // 批量 fetch 各词典并匹配单词
      const words: Word[] = []
      const fetchPromises = Array.from(dictWordMap.entries()).map(async ([dictId, wordNames]) => {
        const dict = idDictionaryMap[dictId]
        if (!dict) return

        try {
          const wordList = await wordListFetcher(dict.url)
          for (const word of wordList) {
            if (wordNames.has(word.name)) {
              words.push(word)
            }
          }
        } catch {
          // 词典加载失败则跳过
        }
      })

      await Promise.all(fetchPromises)
      return words
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { fetchErrorBookWords, isLoading }
}
