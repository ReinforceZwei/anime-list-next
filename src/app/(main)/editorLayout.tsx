'use client'

import EditAnimeModal from "@/lib/component/EditAnime/EditAnimeModal"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { closeEditor } from "@/lib/redux/animeSlice"
import { useRouterRefresh } from "@/lib/routerHooks"
import { Box } from "@mui/material"



export default function EditorLayout() {
    const dispatch = useAppDispatch()
    const id = useAppSelector(state => state.anime.editingId)
    const refresh = useRouterRefresh()

    const handleOnClose = (requireRefresh: boolean, requireScroll: boolean) => {
        if (requireRefresh) {
            refresh().then(() => {
                if (requireScroll) {
                    document.querySelector(`span[data-anime-id="${id}"]`)?.scrollIntoView({
                        behavior: 'smooth'
                    })
                }
            }).finally(() => {
                dispatch(closeEditor())
            })
        } else {
            dispatch(closeEditor())
        }
    }

    if (id !== null) {
        return (
            <Box sx={{
                position: 'fixed',
                right: 5,
                top: 5,
                maxWidth: 350,
                width: '100%',
                zIndex: 'drawer',
            }}>
                <EditAnimeModal id={id} onClose={handleOnClose} />
            </Box>
        )
    }
    return null
}