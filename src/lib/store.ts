import { configureStore } from '@reduxjs/toolkit'
import { baseApi } from '@/lib/redux/api'
import { tmdbApi } from '@/lib/redux/tmdbApi'
import animeReducer from '@/lib/redux/animeSlice'
import tagReducer from '@/lib/redux/tagSlice'

export const makeStore = () => {
    return configureStore({
        reducer: {
            [baseApi.reducerPath]: baseApi.reducer,
            [tmdbApi.reducerPath]: tmdbApi.reducer,
            anime: animeReducer,
            tag: tagReducer,
        },
        middleware: (getDefaultMiddleware) => {
            return getDefaultMiddleware().concat(baseApi.middleware).concat(tmdbApi.middleware)
        },
    })
}

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']