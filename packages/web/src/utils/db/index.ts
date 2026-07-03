import type { LetterMistakes } from './record'
import { deleteWordRecord as apiDeleteWordRecord, postChapterRecord, postWordRecord } from '@/api/record-api'
import { TypingContext, TypingStateActionType } from '@/pages/Typing/store'
import type { TypingState } from '@/pages/Typing/store/type'
import { currentChapterAtom, currentDictIdAtom, isReviewModeAtom } from '@/store'
import { getUTCUnixTimestamp } from '@/utils'
import { useAtomValue } from 'jotai'
import { useCallback, useContext } from 'react'

export function useSaveChapterRecord() {
  const currentChapter = useAtomValue(currentChapterAtom)
  const isRevision = useAtomValue(isReviewModeAtom)
  const dictID = useAtomValue(currentDictIdAtom)

  const saveChapterRecord = useCallback(
    async (typingState: TypingState) => {
      const {
        chapterData: { correctCount, wrongCount, userInputLogs, wordCount, words, wordRecordIds },
        timerData: { time },
      } = typingState
      const correctWordIndexes = userInputLogs.filter((log) => log.correctCount > 0 && log.wrongCount === 0).map((log) => log.index)

      try {
        await postChapterRecord({
          dict: dictID,
          chapter: isRevision ? -1 : currentChapter,
          timeStamp: getUTCUnixTimestamp(),
          time,
          correctCount,
          wrongCount,
          wordCount,
          correctWordIndexes,
          wordNumber: words.length,
          wordRecordIds: wordRecordIds ?? [],
        })
      } catch (e) {
        console.error(e)
      }
    },
    [currentChapter, dictID, isRevision],
  )

  return saveChapterRecord
}

export type WordKeyLogger = {
  letterTimeArray: number[]
  letterMistake: LetterMistakes
}

export function useSaveWordRecord() {
  const isRevision = useAtomValue(isReviewModeAtom)
  const currentChapter = useAtomValue(currentChapterAtom)
  const dictID = useAtomValue(currentDictIdAtom)

  const { dispatch } = useContext(TypingContext) ?? {}

  const saveWordRecord = useCallback(
    async ({
      word,
      wrongCount,
      letterTimeArray,
      letterMistake,
      overrideDictId,
      overrideChapter,
    }: {
      word: string
      wrongCount: number
      letterTimeArray: number[]
      letterMistake: LetterMistakes
      overrideDictId?: string
      overrideChapter?: number | null
    }) => {
      const timing = []
      for (let i = 1; i < letterTimeArray.length; i++) {
        const diff = letterTimeArray[i] - letterTimeArray[i - 1]
        timing.push(diff)
      }

      const finalDictId = overrideDictId ?? dictID
      const finalChapter = overrideChapter !== undefined ? overrideChapter : isRevision ? -1 : currentChapter

      let dbID = -1
      try {
        dbID = await postWordRecord({
          word,
          dict: finalDictId,
          chapter: finalChapter,
          timeStamp: getUTCUnixTimestamp(),
          timing,
          wrongCount,
          mistakes: letterMistake,
        })
      } catch (e) {
        console.error(e)
      }
      if (dispatch) {
        dbID > 0 && dispatch({ type: TypingStateActionType.ADD_WORD_RECORD_ID, payload: dbID })
        dispatch({ type: TypingStateActionType.SET_IS_SAVING_RECORD, payload: false })
      }
    },
    [currentChapter, dictID, dispatch, isRevision],
  )

  return saveWordRecord
}

export function useDeleteWordRecord() {
  const deleteWordRecord = useCallback(async (word: string, dict: string) => {
    try {
      await apiDeleteWordRecord(word, dict)
    } catch (error) {
      console.error(`删除单词记录时出错：`, error)
    }
  }, [])

  return { deleteWordRecord }
}
