'use client'

import Grid from '@mui/material/Unstable_Grid2'
import { Control } from 'react-hook-form'

interface RelationshipControlProps {
    control: Control<any>
}

export default function RelationshipControl(props: RelationshipControlProps) {
    const { control } = props


    return (
        <Grid container></Grid>
    )
}