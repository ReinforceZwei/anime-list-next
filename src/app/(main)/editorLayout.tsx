'use client'

import EditAnimeModal from "@/lib/component/EditAnime/EditAnimeModal"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { closeEditor } from "@/lib/redux/animeSlice"
import { Box } from "@mui/material"



export default function EditorLayout() {
    const dispatch = useAppDispatch()
    const id = useAppSelector(state => state.anime.editingId)

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
                <EditAnimeModal id={id} onClose={() => dispatch(closeEditor())} />
            </Box>
        )
    }
    return null
}