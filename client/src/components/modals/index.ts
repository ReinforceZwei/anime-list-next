import { AddAnimeModal } from './AddAnimeModal'
import { EditAnimeModal } from './EditAnimeModal'
import { TmdbSearchModal } from './TmdbSearchModal'
import { ManageTagsModal } from './ManageTagsModal'
import { TagFormModal } from './TagFormModal'

export const modals = {
  addAnime: AddAnimeModal,
  editAnime: EditAnimeModal,
  tmdbSearch: TmdbSearchModal,
  manageTags: ManageTagsModal,
  tagForm: TagFormModal,
}

declare module '@mantine/modals' {
  export interface MantineModalsOverride {
    modals: typeof modals
  }
}
