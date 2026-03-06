'use client'

import { Box, Button, Fab, Paper, Typography } from '@mui/material'
import GlassmorphismPaper from '@/lib/component/Wallpaper/GlassmorphismPaper';
import { useGetUserSettingsQuery } from '@/lib/redux/userSettingsSlice';
import { ReactNode } from 'react';

interface AnimePaperProps {
    children: ReactNode
    glassEffect?: boolean
}

export default function AnimePaper(props: AnimePaperProps) {
    const { children, glassEffect } = props
    
    const { data: userSettings } = useGetUserSettingsQuery()
    const useGlassEffect = userSettings ? userSettings.glass_effect : glassEffect

    const PaperToUse = useGlassEffect ? GlassmorphismPaper : Paper

    return (
        <PaperToUse elevation={5}>
            {children}
        </PaperToUse>
    )
}