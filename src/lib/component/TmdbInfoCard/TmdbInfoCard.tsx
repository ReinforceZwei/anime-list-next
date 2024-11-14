'use client'

import { useGetDetailsQuery, useGetMovieDetailsQuery } from "@/lib/redux/tmdbApi"
import { Card, Container } from "@mui/material"
import TvCard from "./TvCard"

interface TmdbInfoCardProps {
    tmdbId: number
    mediaType: 'tv' | 'movie'
}

export default function TmdbInfoCard(props: TmdbInfoCardProps) {
    const { tmdbId, mediaType } = props

    const isMovie = mediaType === 'movie'

    const CardElement = isMovie ? TvCard : TvCard
    return (
        <Container
            sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <CardElement tmdbId={tmdbId} />
        </Container>
    )
}