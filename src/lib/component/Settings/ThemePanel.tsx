'use client'

import { Control } from "react-hook-form"
import Grid from '@mui/material/Unstable_Grid2'
import GutterlessTabPanel from "../Tab/GutterlessTabPanel"




interface ThemePanelProps {
    control: Control<any>
}

export default function ThemePanel(props: ThemePanelProps) {
    const { control } = props

    return (
        <GutterlessTabPanel value='theme'>
            <Grid container spacing={1.5} mt={2}>
                <Grid xs={12}></Grid>
            </Grid>
        </GutterlessTabPanel>
    )
}