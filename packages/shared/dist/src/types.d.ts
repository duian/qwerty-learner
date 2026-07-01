export type LanguageType =
  | "en"
  | "romaji"
  | "zh"
  | "ja"
  | "code"
  | "de"
  | "kk"
  | "hapin"
  | "id";
export type LanguageCategoryType = "en" | "ja" | "de" | "code" | "kk" | "id";
export type Word = {
  name: string;
  trans: string[];
  usphone: string;
  ukphone: string;
  notation?: string;
};
export type WordWithIndex = Word & {
  index: number;
};
export type DictionaryResource = {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  url: string;
  length: number;
  language: LanguageType;
  languageCategory: LanguageCategoryType;
  defaultPronIndex?: number;
};
export type Dictionary = DictionaryResource & {
  chapterCount: number;
};
//# sourceMappingURL=types.d.ts.map
