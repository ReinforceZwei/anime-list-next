'use client'

import { useGetDetailsQuery, useGetImageBaseQuery } from "@/lib/redux/tmdbApi"
import { Card, CardHeader, CardMedia, Skeleton } from "@mui/material"
import CardMediaFallback from "../CardMediaFallback/CardMediaFallback"



interface TvCardProps {
    tmdbId: number
}

export default function TvCard(props: TvCardProps) {
    const { tmdbId } = props

    const { data: imageBase } = useGetImageBaseQuery()
    const { data, isLoading } = useGetDetailsQuery(tmdbId)

    if (isLoading || !data) {
        return (
            <Card>
                <Skeleton variant="text"/>
                <Skeleton variant="text"/>
            </Card>
        )
    }

    const imageSrc = imageBase ? `${imageBase}w500${data.poster_path}` : undefined
    const imageStyle = {
        width: '285px',
        height: '425px',
    }

    return (
        <Card
            sx={{
                display: 'flex',
                width: '100%',
            }}
        >
            { imageSrc ? (
                <CardMedia
                    image={imageSrc}
                    sx={imageStyle}
                />
            ) : (
                <CardMediaFallback sx={imageStyle} />
            ) }
            <CardHeader title={data.name} subheader={data.original_name} />
        </Card>
    )
}