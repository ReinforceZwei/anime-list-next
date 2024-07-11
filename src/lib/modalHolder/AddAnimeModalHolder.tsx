'use client'

import AddAnimeModal from "@/lib/component/AddAnime/AddAnimeModal"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { closeAddAnime, closeEditor, openAddAnime } from "@/lib/redux/animeSlice"
import { Box, Fab } from "@mui/material"
import AddIcon from '@mui/icons-material/Add'



export default function AddAnimeModalHolder() {
    const dispatch = useAppDispatch()
    const isOpen = useAppSelector(state => state.anime.openAddAnime)

    return (
        <Box>
            <Fab sx={{position: 'fixed', right: 10, bottom: 10}} size="small" color="primary" onClick={() => dispatch(openAddAnime())}>
                <AddIcon />
            </Fab>

            { isOpen && <AddAnimeModal onClose={() => dispatch(closeAddAnime())} /> }
        </Box>
    )
}