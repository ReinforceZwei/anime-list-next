'use client'

import { Box, Divider, Typography } from "@mui/material"


interface AnimeCardTextWithTitleProps {
    title?: string
    content?: string
    loading: boolean
}

export default function AnimeCardTextWithTitle(props: AnimeCardTextWithTitleProps) {
    const { title, content, loading } = props

    return (loading || !content) ? null : (
        <>
        <Divider>
            <Typography variant="caption" color='text.secondary'>{title}</Typography>
        </Divider>

        <Box sx={{ whiteSpace: 'break-spaces' }}>
            <Typography variant="body2" component='div'>
                {content}
            </Typography>
        </Box>
        </>
    )
}