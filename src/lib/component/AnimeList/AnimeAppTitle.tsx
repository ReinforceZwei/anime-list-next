'use client'

import { Typography } from '@mui/material'
import { useGetUserSettingsQuery } from '@/lib/redux/userSettingsSlice';

interface AnimeAppTitleProps {
    title?: string
}

export default function AnimeAppTitle(props: AnimeAppTitleProps) {
    const { title } = props
    
    const { data: userSettings } = useGetUserSettingsQuery()
    const userTitle = userSettings ? userSettings.app_title : title

    return (
        <Typography variant="h3" align="center">{userTitle}</Typography>
    )
}