'use client'
import { closeCard, useGetAnimeQuery } from "@/lib/redux/animeSlice"
import { Box, Button, Card, CardActionArea, CardActions, CardContent, CardMedia, Divider, Fab, IconButton, Rating, Skeleton, Typography } from "@mui/material"
import { fieldSorter } from '@/lib/vendor/sortHelper'
import TagChip from '@/lib/component/AnimeList/TagChip'
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import { DateTime } from 'luxon'
import { useGetImageBaseQuery, useLazyGetDetailsQuery, useLazySearchQuery } from "@/lib/redux/tmdbApi"
import { useEffect, useMemo, useState } from "react"
import { TvSeriesDetail } from "@/lib/service/types/tmdb"
import { useAppDispatch } from "@/lib/hooks"


interface AnimeCard2Props {
    id: string
}

export default function AnimeCard2({ id }: AnimeCard2Props) {
    const dispatch = useAppDispatch()
    const { data: anime, isFetching: isLoading } = useGetAnimeQuery(id)
    const tags = anime?.expand?.tags || []

    const sortedTags = tags.slice().sort(fieldSorter(['weight', 'name']))

    const [search, result] = useLazySearchQuery()
    const [getDetail, details] = useLazyGetDetailsQuery()
    const { data: imageBase } = useGetImageBaseQuery()
    const [tmdbData, setTmdbData] = useState<TvSeriesDetail | null>(null)
    useEffect(() => {
        if (!isLoading && anime) {
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
        } else {
            setTmdbData(null)
        }
        
    }, [anime, isLoading])
    const backdropUrl = useMemo(() => (
        imageBase && tmdbData?.backdrop_path ? `${imageBase}w780${tmdbData.backdrop_path}` : null
    ), [imageBase, tmdbData, id])
    const posterUrl = useMemo(() => (
        imageBase && tmdbData?.poster_path ? `${imageBase}w500${tmdbData.poster_path}` : null
    ), [imageBase, tmdbData, id])


    if (tmdbData) {
        console.log(tmdbData)
    }

    return (
        <Card sx={{
            maxWidth: 350,
            position: 'relative',
            maxHeight: '98vh',
            overflow: 'auto',
            zIndex: 'drawer',
        }}>
            <Box sx={{position: 'fixed', zIndex: 5000}}>
                <Fab
                    sx={{
                        position: 'sticky',
                        right: 4,
                        top: 4,
                        height: 22,
                        width: 22,
                        minHeight: 22,
                    }}
                    onClick={() => dispatch(closeCard())}
                ><CloseIcon fontSize="small" /></Fab>
            </Box>

            <CardActionArea>
                <CardMedia
                    sx={{
                        height: 467,
                        display: 'flex',
                        flexDirection: 'column-reverse',
                        transition: 'background .5s',
                    }}
                    image={posterUrl || undefined}
                ></CardMedia>
            </CardActionArea>
            
            <Box>
            <CardContent sx={{position: 'relative'}}>
                {/* Edit Button */}
                <Fab
                    sx={{
                        position: 'absolute',
                        right: 15,
                        top: -20,
                    }}
                    size='small'
                    color='primary'
                ><EditIcon /></Fab>

                {/* Title + Copy Button */}
                <Typography variant="h5" component='div'>
                    { isLoading ? <Skeleton /> : (
                        <>
                        {anime!.name}
                        <IconButton size="small" color="secondary"><ContentCopyIcon fontSize="inherit" /></IconButton>
                        </>
                    ) }
                    
                </Typography>
                
                {/* Tags/Categories */}
                <Box>
                { isLoading ? <Skeleton /> : (
                    sortedTags && sortedTags.map(tag => (
                        <TagChip key={tag.id} name={tag.name} />
                    ))
                )}
                </Box>

                {/* Rating */}
                <Box>
                    { isLoading ? <Skeleton /> : <Rating value={anime?.rating} readOnly /> }
                </Box>

                {/* Date Time */}
                { isLoading ? <Skeleton /> : (
                <Box>
                    <Typography variant="caption" color='text.secondary' component='div'>
                        新增於 {DateTime.fromSQL(anime?.created!).toLocaleString(DateTime.DATETIME_SHORT)} 
                    </Typography>

                    {anime?.finish_time && (
                    <Typography variant="caption" color='success.light' component='div'>
                        完成於 {DateTime.fromSQL(anime?.finish_time).toLocaleString(DateTime.DATETIME_SHORT)} 
                    </Typography>
                    )}
                    
                </Box>
                )}

                {/* Comment */}
                {!isLoading && anime?.comment && (
                <>
                <Divider><Typography variant="caption" color='text.secondary'>感想</Typography></Divider>

                <Box sx={{ whiteSpace: 'break-spaces' }}>
                    
                    <Typography variant="body2" component='div'>
                        {anime?.comment}
                    </Typography>
                    
                </Box>
                </>
                )}

                {tmdbData && tmdbData.id}
            </CardContent>

            <CardActions>
                <Button>Edit</Button>
            </CardActions>

            </Box>

        </Card>
    )
}