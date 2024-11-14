'use client'

import { useAppDispatch } from "@/lib/hooks";
import PosterViewerModalHolder from "@/lib/modalHolder/PosterViewerModalHolder";
import { Button, Fab } from "@mui/material";
import AddIcon from '@mui/icons-material/Add'
import { closePosterModal, openPosterModal } from "@/lib/redux/uiSlice";
import TmdbInfoCardModal from "@/lib/component/TmdbInfoCard/TmdbInfoCardModal";


export default function Page() {
    const dispatch = useAppDispatch()
    const src = 'https://image.tmdb.org/t/p/original/iypUQsBWnuRiszsuQxS5bCwxfvg.jpg'

    return (
        <div>
            <Button onClick={() => dispatch(openPosterModal(src))}>OPEN</Button>
            <Button onClick={() => dispatch(closePosterModal())}>RESET</Button>
            <Fab onClick={() => dispatch(openPosterModal(src))}><AddIcon /></Fab>
            <PosterViewerModalHolder />

            <TmdbInfoCardModal tmdbId={65844} mediaType="tv" />
        </div>
    )
}