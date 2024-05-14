'use client'
import { useGetAnimeQuery } from "@/lib/redux/animeSlice"
import { Box, Button, Card, CardActions, CardContent, CardMedia, Divider, IconButton, Rating, Typography } from "@mui/material"
import { fieldSorter } from '@/lib/vendor/sortHelper'
import TagChip from '@/lib/component/AnimeList/TagChip'
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { DateTime } from 'luxon'
import { useGetImageBaseQuery, useLazyGetDetailsQuery, useLazySearchQuery } from "@/lib/redux/tmdbApi"
import { useEffect, useMemo, useState } from "react"
import { TvSeriesDetail } from "@/lib/service/types/tmdb"


interface AnimeCard2Props {
    id: string
}

export default function AnimeCard2({ id }: AnimeCard2Props) {
    const { data: anime, isLoading } = useGetAnimeQuery(id)
    const tags = anime?.expand?.tags || []

    const sortedTags = tags.slice().sort(fieldSorter(['weight', 'name']))

    const [search, result] = useLazySearchQuery()
    const [getDetail, details] = useLazyGetDetailsQuery()
    const { data: imageBase } = useGetImageBaseQuery()
    const [tmdbData, setTmdbData] = useState<TvSeriesDetail | null>(null)
    useEffect(() => {
        if (anime) {
            if (anime?.tmdb_id) {
                getDetail(Number(anime.tmdb_id), true).unwrap().then(data => {
                    setTmdbData(data)
                })
            } else {
                search(anime?.name).unwrap().then(result => {
                    if (result.results.length) {
                        getDetail(result.results[0].id, true).unwrap().then(data => {
                            setTmdbData(data)
                        })
                    } else {
                        setTmdbData(null)
                    }
                })
            }
        }
        
    }, [anime])
    const backdropUrl = useMemo(() => (
        imageBase && tmdbData?.backdrop_path ? `${imageBase}w780${tmdbData.backdrop_path}` : null
    ), [imageBase, tmdbData])
    const posterUrl = useMemo(() => (
        imageBase && tmdbData?.poster_path ? `${imageBase}w500${tmdbData.poster_path}` : null
    ), [imageBase, tmdbData])

    if (isLoading) {
        return (<div>Loading</div>)
    }

    return (
        <Card sx={{ maxWidth: 350, position: 'relative' }}>
            <CardMedia
                sx={{
                    height: 540,//200,
                }}
                image={posterUrl || undefined}
                component='img'
            ></CardMedia>
            <IconButton
                sx={{
                    position: 'absolute',
                    right: 4,
                    top: 4,
                }}
            ><FullscreenIcon /></IconButton>

            
            <CardContent>
                <Typography variant="h5" component='div'>
                    {anime.name}
                    <IconButton size="small" color="secondary"><ContentCopyIcon fontSize="inherit" /></IconButton>
                </Typography>
                
                <Box>
                { sortedTags && sortedTags.map(tag => (
                    <TagChip key={tag.id} name={tag.name} />
                ))}
                </Box>

                <Box>
                    <Rating value={anime?.rating} readOnly />
                </Box>

                <Box>
                    <Typography variant="caption" color='text.secondary' component='div'>
                        新增於 {DateTime.fromSQL(anime?.created).toLocaleString(DateTime.DATETIME_SHORT)} 
                    </Typography>

                    {anime?.finish_time && (
                    <Typography variant="caption" color='success.light' component='div'>
                        完成於 {DateTime.fromSQL(anime?.finish_time).toLocaleString(DateTime.DATETIME_SHORT)} 
                    </Typography>
                    )}
                    
                </Box>

                <Divider><Typography variant="caption" color='text.secondary'>感想</Typography></Divider>

                <Box sx={{ whiteSpace: 'break-spaces' }}>
                    {anime?.comment && (
                    <Typography variant="body2" component='div'>
                        {anime?.comment}
                    </Typography>
                    )}
                </Box>
            </CardContent>

            <CardActions>
                <Button>Edit</Button>
            </CardActions>

            

            
            

            
        </Card>
    )
}