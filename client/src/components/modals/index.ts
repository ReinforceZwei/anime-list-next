import { AddAnimeModal } from './AddAnimeModal'
import { EditAnimeModal } from './EditAnimeModal'
import { TmdbSearchModal } from './TmdbSearchModal'

export const modals = {
  addAnime: AddAnimeModal,
  editAnime: EditAnimeModal,
  tmdbSearch: TmdbSearchModal,
}

declare module '@mantine/modals' {
  export interface MantineModalsOverride {
    modals: typeof modals
  }
}
