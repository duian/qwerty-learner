import type { PronunciationType } from '.'
import type { LanguageType } from '@qwerty-learner/shared'

export type PronunciationConfig = {
  name: string
  pron: PronunciationType
}

export type LanguagePronunciationMapConfig = {
  defaultPronIndex: number
  pronunciation: PronunciationConfig[]
}

export type LanguagePronunciationMap = {
  [key in LanguageType]: LanguagePronunciationMapConfig
}

export type SoundResource = {
  key: string
  name: string
  filename: string
}
