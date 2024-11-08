import { useGetImageBaseQuery } from "@/lib/redux/tmdbApi";
import { ResultMovie, ResultTv } from "@/types/tmdb";
import { Card, CardHeader, CardMedia, ListItem, Paper } from "@mui/material";


interface SearchResultListItemProps {
    result: ResultTv | ResultMovie
}

export default function SearchResultListItem(props: SearchResultListItemProps) {
    const { result } = props

    const { data: tmdbImageBase } = useGetImageBaseQuery()

    const isMovie = Boolean((result as ResultMovie).title)
    const title = (result as ResultMovie).title ?? (result as ResultTv).name
    const originalTitle = (result as ResultMovie).original_title ?? (result as ResultTv).original_name

    const imageSrc = tmdbImageBase && result.poster_path ? `${tmdbImageBase}w780${result.poster_path}` : null

    return (
        <ListItem disableGutters>
            <Card sx={{
                display: 'flex',
                width: '100%',
            }}>
                { imageSrc && (
                    <CardMedia
                        component="img"
                        image={imageSrc}
                        sx={{
                            minWidth: '94px',
                            width: '94px', // copied from tmdb ui
                            height: '141px',
                        }}
                    />
                )}
                
                <CardHeader title={title} subheader={originalTitle} />
            </Card>
        </ListItem>
    )
}