import { useGetImageBaseQuery } from "@/lib/redux/tmdbApi";
import { ResultMovie, ResultTv } from "@/types/tmdb";
import { Card, CardActionArea, CardHeader, CardMedia, ListItem, Paper } from "@mui/material";
import SearchResultPoster from "./SearchResultPoster";
import { MultiSearchResult, TV, Movie } from "tmdb-ts";


interface SearchResultListItemProps {
    result: MultiSearchResult
}

export default function SearchResultListItem(props: SearchResultListItemProps) {
    const { result } = props

    const { data: tmdbImageBase } = useGetImageBaseQuery()

    if (result.media_type === 'person') {
        // we dont handle person
        return null
    }

    const isMovie = result.media_type === 'movie'
    const title = isMovie ? (result as Movie).title : (result as TV).name
    const originalTitle = isMovie ? (result as Movie).original_title : (result as TV).original_name

    const imageSrc = tmdbImageBase && result.poster_path ? `${tmdbImageBase}w780${result.poster_path}` : null

    const handleOnClick = () => {

    }

    return (
        <ListItem disableGutters>
            <Card sx={{
                width: '100%',
            }}>
                <CardActionArea
                    onClick={handleOnClick}
                    sx={{
                        display: 'flex',
                        justifyContent: 'initial',
                        width: '100%',
                    }}
                >
                    <SearchResultPoster image={imageSrc} />
                    
                    <CardHeader title={title} subheader={originalTitle} />
                </CardActionArea>
            </Card>
        </ListItem>
    )
}