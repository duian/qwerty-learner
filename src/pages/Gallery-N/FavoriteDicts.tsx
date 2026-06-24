import DictionaryComponent from './DictionaryWithoutCover'
import { idDictionaryMap } from '@/resources/dictionary'
import { favoriteDictIdsAtom } from '@/store'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import IconStarFilled from '~icons/tabler/star-filled'

export default function FavoriteDicts() {
  const favoriteDictIds = useAtomValue(favoriteDictIdsAtom)

  const favoriteDicts = useMemo(() => favoriteDictIds.map((id) => idDictionaryMap[id]).filter(Boolean), [favoriteDictIds])

  if (favoriteDicts.length === 0) return null

  return (
    <div className="mb-14">
      <div className="mb-8 flex items-center">
        <IconStarFilled className="mr-2 h-5 w-5 text-yellow-400" />
        <h2 className="text-lg font-medium text-gray-700 dark:text-gray-200">我的收藏</h2>
      </div>
      <div className="grid gap-x-5 gap-y-10 px-1 pb-4 sm:grid-cols-1 md:grid-cols-2 dic3:grid-cols-3 dic4:grid-cols-4">
        {favoriteDicts.map((dict) => (
          <DictionaryComponent key={dict.id} dictionary={dict} />
        ))}
      </div>
    </div>
  )
}
