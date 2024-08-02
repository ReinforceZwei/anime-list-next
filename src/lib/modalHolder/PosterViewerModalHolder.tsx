'use client'

import { Box } from "@mui/material"
import PosterViewer from "../component/PosterViewer/PosterViewer"
import { useAppDispatch, useAppSelector } from "../hooks"
import { closePosterModal } from "../redux/uiSlice"



export default function PosterViewerModalHolder() {
    const dispatch = useAppDispatch()
    const { open, payload: src } = useAppSelector((state) => state.ui.posterModal)

    const handleClose = () => {
        dispatch(closePosterModal())
    }
    

    return (
        <Box>
            { open && src && <PosterViewer imageSrc={src} onClose={handleClose} /> }
        </Box>
    )
}