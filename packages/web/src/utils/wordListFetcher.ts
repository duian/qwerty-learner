import type { Word } from '@/typings'

import { api } from './api'

const USE_API = import.meta.env.VITE_USE_API === 'true'

/**
 * Fetch words from the backend API (paginated by chapter).
 */
async function fetchFromAPI(dictId: string, chapter: number, pageSize = 20): Promise<Word[]> {
  const res = await api.get(`/dictionaries/${dictId}/words`, {
    params: { chapter, pageSize },
  })
  return res.data.data
}

/**
 * Fetch the full word list from a static JSON file (original behaviour).
 */
async function fetchFromJSON(url: string): Promise<Word[]> {
  const URL_PREFIX: string = REACT_APP_DEPLOY_ENV === 'pages' ? '/qwerty-learner' : ''
  const response = await fetch(URL_PREFIX + url)
  return response.json()
}

// Backward-compatible alias used by error-book and gallery hooks
const wordListFetcher = fetchFromJSON

export { fetchFromAPI, fetchFromJSON, USE_API, wordListFetcher }
