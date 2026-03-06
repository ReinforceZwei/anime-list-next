'use client'

import { Button, IconButton, Skeleton, Tooltip, Typography } from "@mui/material"
import { useState } from "react";
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import FlagIcon from '@mui/icons-material/Flag';


interface AnimeCardQuickActionProps {
    id: string
}

export default function AnimeCardQuickAction(props: AnimeCardQuickActionProps) {
    const { id } = props


    return (
        <>
        <Button variant="contained" size='small' color="secondary" startIcon={<KeyboardDoubleArrowRightIcon />}>Watching</Button>
        <Button variant="contained" size='small' color="secondary" startIcon={<FlagIcon />}>Finished</Button>
        </>
    )
}