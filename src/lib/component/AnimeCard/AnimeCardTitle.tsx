'use client'

import { IconButton, Skeleton, Tooltip, Typography } from "@mui/material"
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useState } from "react";


interface AnimeCardTitleProps {
    title?: string
    loading: boolean
}

export default function AnimeCardTitle(props: AnimeCardTitleProps) {
    const { title, loading } = props

    const [copySucessMsg, setCopySucessMsg] = useState(false)
    const handleCopy = () => {
        if (title) {
            navigator.clipboard.writeText(title).then(() => {
                setCopySucessMsg(true)
                setTimeout(() => {
                    setCopySucessMsg(false)
                }, 1000)
            })
        }
    }

    return (
        <Typography variant="h5" component='div'>
            { loading ? <Skeleton /> : (
                <>
                {title}
                <Tooltip title='Copied' placement="top" arrow open={copySucessMsg}>
                    <IconButton size="small" color="primary" onClick={handleCopy}>
                        <ContentCopyIcon fontSize="inherit" />
                    </IconButton>
                </Tooltip>
                </>
            ) }
        </Typography>
    )
}