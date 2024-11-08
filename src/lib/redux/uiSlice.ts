import { PayloadAction, createSlice } from '@reduxjs/toolkit'


interface BaseModalState {
    open: boolean
}

interface ModalStateWithPayload<T> extends BaseModalState {
    payload?: T
}

// Optional modal payload
export type ModalState<T = void> = T extends void ? BaseModalState : ModalStateWithPayload<T>

type PosterImageSrc = string
type AnimeId = string
type SearchQuery = string | undefined

export interface UiState {
    addAnimeModal: ModalState
    posterModal: ModalState<PosterImageSrc>
    animeCard: ModalState<AnimeId>
    editAnimeModal: ModalState<AnimeId>
    addTagModal: ModalState
    manageTagModal: ModalState
    settingsModal: ModalState
    searchTmdbModal: ModalState<SearchQuery>
}

const initialState: UiState = {
    addAnimeModal: { open: false },
    posterModal: { open: false },
    animeCard: { open: false },
    editAnimeModal: { open: false },
    addTagModal: { open: false },
    manageTagModal: { open: false },
    settingsModal: { open: false },
    searchTmdbModal: { open: false },
}

export const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        openAddAnimeModal: (state) => {
            state.addAnimeModal = { open: true }
        },
        closeAddAnimeModal: (state) => {
            state.addAnimeModal = { open: false }
        },
        openPosterModal: (state, action: PayloadAction<PosterImageSrc>) => {
            state.posterModal = { open: true, payload: action.payload }
        },
        closePosterModal: (state) => {
            state.posterModal = { open: false }
        },
        openAnimeCard: (state, action: PayloadAction<AnimeId>) => {
            state.animeCard = { open: true, payload: action.payload }
        },
        closeAnimeCard: (state) => {
            state.animeCard = { open: false }
        },
        openEditAnimeModal: (state, action: PayloadAction<AnimeId>) => {
            state.editAnimeModal = { open: true, payload: action.payload }
        },
        closeEditAnimeModal: (state) => {
            state.editAnimeModal = { open: false }
        },
        openAddTagModal: (state) => {
            state.addTagModal = { open: true }
        },
        closeAddTagModal: (state) => {
            state.addTagModal = { open: false }
        },
        openManageTagModal: (state) => {
            state.manageTagModal = { open: true }
        },
        closeManageTagModal: (state) => {
            state.manageTagModal = { open: false }
        },
        openSettingsModal: (state) => {
            state.settingsModal = { open: true }
        },
        closeSettingsModal: (state) => {
            state.settingsModal = { open: false }
        },
        openSearchTmdbModal: (state, action: PayloadAction<SearchQuery>) => {
            state.searchTmdbModal = { open: true, payload: action.payload }
        },
        closeSearchTmdbModal: (state) => {
            state.searchTmdbModal = { open: false }
        },
    }
})

export const {
    openAddAnimeModal, closeAddAnimeModal,
    openPosterModal, closePosterModal,
    openAnimeCard, closeAnimeCard,
    openEditAnimeModal, closeEditAnimeModal,
    openAddTagModal, closeAddTagModal,
    openManageTagModal, closeManageTagModal,
    openSettingsModal, closeSettingsModal,
    openSearchTmdbModal, closeSearchTmdbModal,
} = uiSlice.actions

export default uiSlice.reducer