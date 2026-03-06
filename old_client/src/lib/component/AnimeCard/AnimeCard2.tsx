'use client'
import { useGetAnimeQuery } from "@/lib/redux/animeSlice"
import { Box, Button, Card, CardActionArea, CardActions, CardContent, CardMedia, Divider, Fab, IconButton, Rating, Skeleton, Tooltip, Typography, useTheme } from "@mui/material"
import { alpha } from "@mui/material";
import { fieldSorter } from '@/lib/vendor/sortHelper'
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import FlagIcon from '@mui/icons-material/Flag';
import { useGetImageBaseQuery, useLazyGetDetailsQuery, useLazyMultiSearchQuery } from "@/lib/redux/tmdbApi"
import { useEffect, useMemo, useState } from "react"
import { useAppDispatch } from "@/lib/hooks"
import AnimeCardTitle from "./AnimeCardTitle";
import AnimeCardTags from "./AnimeCardTags";
import AnimeCardRating from "./AnimeCardRating";
import AnimeCardDateTime from "./AnimeCardDateTime";
import AnimeCardTextWithTitle from "./AnimeCardTextWithTitle";
import { closeAnimeCard, openEditAnimeModal, openPosterModal } from "@/lib/redux/uiSlice";
import { TagRecord } from "@/types/tag";
import AnimeCardQuickAction from "./AnimeCardQuickAction";
import { usePrevious } from "@/lib/vendor/reactHooks";
import { TvShowDetails } from "tmdb-ts";


interface AnimeCard2Props {
    id: string
}

export default function AnimeCard2({ id }: AnimeCard2Props) {
    const dispatch = useAppDispatch()
    const theme = useTheme()

    const { data: anime, isLoading, isFetching } = useGetAnimeQuery(id)

    // Show as loading when:
    // - first time open
    // - card id changed
    // same id updating wont show loading
    const previousId = usePrevious(id)
    const [isLoadingNewId, setIsLoadingNewId] = useState(isLoading)
    useEffect(() => {
        if (id != previousId || !isFetching) {
            setIsLoadingNewId(isFetching)
        }
    }, [previousId, id, isFetching])

    const tags: TagRecord[] = anime?.expand?.tags || []
    const sortedTags = tags.slice().sort(fieldSorter(['weight', 'name']))

    const [search, result] = useLazyMultiSearchQuery()
    const [getDetail, details] = useLazyGetDetailsQuery()
    const { data: imageBase } = useGetImageBaseQuery()
    const [tmdbData, setTmdbData] = useState<TvShowDetails | null>(null)
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
            dispatch(openPosterModal(posterUrl))
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
            display: 'flex',
            flexDirection: 'column',
        }}>
            <Box sx={{position: 'fixed', zIndex: 5000}}>
                <Fab
                    sx={{
                        position: 'sticky',
                        right: 4,
                        top: 4,
                        height: 32,
                        width: 32,
                        minHeight: 32,
                    }}
                    onClick={() => dispatch(closeAnimeCard())}
                ><CloseIcon /></Fab>
            </Box>

            <CardActionArea
                onClick={handlePoster}
                sx={{
                    position: 'fixed',
                    height: '98vh',
                    maxHeight: 467,
                    maxWidth: 350,
                }}
            >
                <CardMedia
                    sx={{
                        height: '100%',
                        transition: 'background .5s',
                        backgroundColor: '#83838324',
                        borderTopLeftRadius: 4,
                        borderTopRightRadius: 4,
                    }}
                    image={posterUrl || undefined}
                ></CardMedia>
            </CardActionArea>

            {/* Placeholder to squeeze info card to bottom */}
            <Box
                sx={{
                    maxHeight: 467,
                    minHeight: 30,
                    height: 467,
                }}
            ></Box>
            
            <Box sx={{
                flex: 1,
                backdropFilter: 'blur(10px)',
                backgroundColor: alpha(theme.palette.background.default, 0.3),
            }}>
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
                    onClick={() => dispatch(openEditAnimeModal(id))}
                ><EditIcon /></Fab>

                {/* Title + Copy Button */}
                <AnimeCardTitle loading={isLoadingNewId} title={anime?.name} />
                
                
                {/* Tags/Categories */}
                <AnimeCardTags loading={isLoadingNewId} tags={sortedTags} />

                {/* Rating */}
                <AnimeCardRating loading={isLoadingNewId} rating={anime?.rating} />

                {/* Date Time */}
                <AnimeCardDateTime
                    loading={isLoadingNewId}
                    createTime={anime?.created}
                    startTime={anime?.start_time}
                    finishTime={anime?.finish_time}
                />

                {/* Comment */}
                <AnimeCardTextWithTitle loading={isLoadingNewId} title="感想" content={anime?.comment} />

                <AnimeCardTextWithTitle loading={isLoadingNewId} title="備註" content={anime?.remark} />

                {tmdbData && tmdbData.id}
            </CardContent>

            <CardActions>
                <AnimeCardQuickAction id={id} />
            </CardActions>

            </Box>

        </Card>
    )
}