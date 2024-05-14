'use client'

import AnimeCard from "@/lib/component/AnimeCard/AnimeCard"
import AnimeCard2 from "@/lib/component/AnimeCard/AnimeCard2"
import { useAppSelector } from "@/lib/hooks"
import { Box } from "@mui/material"



export default function CardLayout() {
    const open = useAppSelector(state => state.anime.open)
    const id = useAppSelector(state => state.anime.viewingId)

    if (open && id) {
        return (
            <Box sx={{
                position: 'fixed',
                right: 5,
                top: 5,
                maxWidth: 350,
                width: '100%',
            }}>
                <AnimeCard2 id={id} />
            </Box>
        )
    }
    return null
}