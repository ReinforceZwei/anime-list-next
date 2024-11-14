import { CardMedia, styled } from '@mui/material'
import CardMediaFallback from '../CardMediaFallback/CardMediaFallback';

const ResultCardPoster = styled(CardMedia)({
    minWidth: '94px',
    width: '94px', // copied from tmdb ui
    height: '141px',
    backgroundColor: 'rgb(219, 219, 219)',
})

interface SearchResultPosterProps {
    image?: string | null
}

export default function SearchResultPoster(props: SearchResultPosterProps) {
    const { image } = props

    if (image) {
        return <ResultCardPoster image={image} />
    }
    return <CardMediaFallback sx={{ minWidth: '94px', width: '94px', height: '141px' }} />
}