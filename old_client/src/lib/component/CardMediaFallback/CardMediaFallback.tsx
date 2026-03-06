import { CardMedia, CardMediaOwnProps, styled } from "@mui/material"
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';

const IconHolder = styled(CardMedia)({
    backgroundColor: 'rgb(219, 219, 219)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
})

export default function CardMediaFallback(props: CardMediaOwnProps) {
    return (//@ts-expect-error
        <IconHolder {...props} component='div'>
            <ImageOutlinedIcon sx={{ fontSize: '3rem' }} />
        </IconHolder>
    )
}