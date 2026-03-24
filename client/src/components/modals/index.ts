import { AddAnimeModal } from './AddAnimeModal'
import { EditAnimeModal } from './EditAnimeModal'
import { TmdbSearchModal } from './TmdbSearchModal'
import { ManageTagsModal } from './ManageTagsModal'
import { TagFormModal } from './TagFormModal'
import { PreferencesModal } from './PreferencesModal'

export const modals = {
  addAnime: AddAnimeModal,
  editAnime: EditAnimeModal,
  tmdbSearch: TmdbSearchModal,
  manageTags: ManageTagsModal,
  tagForm: TagFormModal,
  preferences: PreferencesModal,
}

declare module '@mantine/modals' {
  export interface MantineModalsOverride {
    modals: typeof modals
  }
}
