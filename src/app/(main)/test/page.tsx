'use client'

import { useAppDispatch } from "@/lib/hooks";
import PosterViewerModalHolder from "@/lib/modalHolder/PosterViewerModalHolder";
import { closePoster, openPoster } from "@/lib/redux/animeSlice";
import { Button } from "@mui/material";



export default function Page() {
    const dispatch = useAppDispatch()
    const src = 'https://image.tmdb.org/t/p/original/iypUQsBWnuRiszsuQxS5bCwxfvg.jpg'

    return (
        <div>
            <Button onClick={() => dispatch(openPoster(src))}>OPEN</Button>
            <Button onClick={() => dispatch(closePoster())}>RESET</Button>
            <PosterViewerModalHolder />
        </div>
    )
}