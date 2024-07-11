'use client'
import { closeCard, openEditor, openPoster, useGetAnimeQuery } from "@/lib/redux/animeSlice"
import { Box, Button, Card, CardActionArea, CardActions, CardContent, CardMedia, Divider, Fab, IconButton, Rating, Skeleton, Tooltip, Typography } from "@mui/material"
import { fieldSorter } from '@/lib/vendor/sortHelper'
import TagChip from '@/lib/component/TagChip/TagChip'
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import { DateTime } from 'luxon'
import { useGetImageBaseQuery, useLazyGetDetailsQuery, useLazySearchQuery } from "@/lib/redux/tmdbApi"
import { useEffect, useMemo, useState } from "react"
import { TvSeriesDetail } from "@/lib/service/types/tmdb"
import { useAppDispatch } from "@/lib/hooks"
import { TagRecord } from "@/lib/redux/tagSlice"


interface AnimeCard2Props {
    id: string
}

export default function AnimeCard2({ id }: AnimeCard2Props) {
    const dispatch = useAppDispatch()
    const { data: anime, isFetching: isLoading } = useGetAnimeQuery(id)
    const tags: TagRecord[] = anime?.expand?.tags || []

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

    const handlePoster = () => {
        if (posterUrl) {
            dispatch(openPoster(posterUrl))
        }
    }

    const [copySucessMsg, setCopySucessMsg] = useState(false)
    const handleCopy = () => {
        if (anime) {
            navigator.clipboard.writeText(anime.name).then(() => {
                setCopySucessMsg(true)
                setTimeout(() => {
                    setCopySucessMsg(false)
                }, 1000)
            })
        }
    }


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

            <CardActionArea
                onClick={handlePoster}
            >
                <CardMedia
                    sx={{
                        height: 467,
                        display: 'flex',
                        flexDirection: 'column-reverse',
                        transition: 'background .5s',
                        backgroundColor: '#83838324',
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
                    onClick={() => dispatch(openEditor(id))}
                ><EditIcon /></Fab>

                {/* Title + Copy Button */}
                <Typography variant="h5" component='div'>
                    { isLoading ? <Skeleton /> : (
                        <>
                        {anime!.name}
                        <Tooltip title='Copied' placement="top" arrow open={copySucessMsg}>
                            <IconButton size="small" color="primary" onClick={handleCopy}>
                                <ContentCopyIcon fontSize="inherit" />
                            </IconButton>
                        </Tooltip>
                        </>
                    ) }
                    
                </Typography>
                
                {/* Tags/Categories */}
                <Box>
                { isLoading ? <Skeleton /> : (
                    sortedTags && sortedTags.map(tag => (
                        <TagChip key={tag.id} name={tag.name} color={tag.color} />
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

                    {anime?.start_time && (
                    <Typography variant="caption" color='warning.light' component='div'>
                        開始於 {DateTime.fromSQL(anime?.start_time).toLocaleString(DateTime.DATETIME_SHORT)}
                    </Typography>
                    )}

                    {anime?.finish_time && (
                    <Typography variant="caption" color='success.light' component='div'>
                        完成於 {DateTime.fromSQL(anime?.finish_time).toLocaleString(DateTime.DATETIME_SHORT)}
                        { anime?.start_time && (
                            <span>{' '}({Math.ceil(DateTime.fromSQL(anime?.finish_time).diff(DateTime.fromSQL(anime?.start_time)).as('days'))}日)</span>
                        ) }
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