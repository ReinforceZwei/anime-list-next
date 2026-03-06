'use client'

import { Box, Skeleton, Rating } from "@mui/material"



interface AnimeCardRatingProps {
    rating?: number
    loading: boolean
}

export default function AnimeCardRating(props: AnimeCardRatingProps) {
    const { rating, loading } = props

    return (
        <Box>
            { loading ? <Skeleton /> : <Rating value={rating} readOnly /> }
        </Box>
    )
}