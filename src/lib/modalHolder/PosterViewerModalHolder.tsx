'use client'

import { Box } from "@mui/material"
import PosterViewer from "../component/PosterViewer/PosterViewer"
import { useAppDispatch, useAppSelector } from "../hooks"
import { closePoster } from "../redux/animeSlice"



export default function PosterViewerModalHolder() {
    const dispatch = useAppDispatch()
    const src = useAppSelector((state) => state.anime.posterSrc)

    const handleClose = () => {
        dispatch(closePoster())
    }
    

    return (
        <Box>
            { src && <PosterViewer imageSrc={src} onClose={handleClose} /> }
        </Box>
    )
}