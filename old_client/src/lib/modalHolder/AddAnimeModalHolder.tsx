'use client'

import AddAnimeModal from "@/lib/component/AddAnime/AddAnimeModal"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { Box, Fab } from "@mui/material"
import AddIcon from '@mui/icons-material/Add'
import { closeAddAnimeModal, openAddAnimeModal } from "../redux/uiSlice"



export default function AddAnimeModalHolder() {
    const dispatch = useAppDispatch()
    const { open } = useAppSelector(state => state.ui.addAnimeModal)

    return (
        <Box>
            <Fab sx={{position: 'fixed', right: 10, bottom: 10}} size="small" color="primary" onClick={() => dispatch(openAddAnimeModal())}>
                <AddIcon />
            </Fab>

            { open && <AddAnimeModal onClose={() => dispatch(closeAddAnimeModal())} /> }
        </Box>
    )
}