'use client'

import { Control } from "react-hook-form"
import Grid from '@mui/material/Unstable_Grid2'
import GutterlessTabPanel from "../Tab/GutterlessTabPanel"
import FormSelect from "../control/FormSelect"
import { MenuItem } from "@mui/material"
import FormTextField from "../control/FormTextField"




interface GeneralPanelProps {
    control: Control<any>
}

export default function GeneralPanel(props: GeneralPanelProps) {
    const { control } = props

    return (
        <GutterlessTabPanel value='general'>
            <Grid container spacing={1.5} mt={2}>
                <Grid xs={12}>
                    <FormTextField
                        control={control}
                        name='app_title'
                        label='App Title'
                        TextFieldProps={{
                            fullWidth: true
                        }}
                    />
                </Grid>
            </Grid>
        </GutterlessTabPanel>
    )
}