'use client'

import { Control, useWatch } from "react-hook-form"
import Grid from '@mui/material/Unstable_Grid2'
import GutterlessTabPanel from "../Tab/GutterlessTabPanel"
import FormSelect from "../control/FormSelect"
import { MenuItem } from "@mui/material"
import FormSwitch from "../control/FormSwitch"
import FormFileInput from "../control/FormFileInput"
import ImageInputPreview from "../ImageInputPreview/ImageInputPreview"




interface ThemePanelProps {
    control: Control<any>
}

export default function ThemePanel(props: ThemePanelProps) {
    const { control } = props

    const imageFiles = useWatch({ control, name: 'background_image_input' })

    return (
        <GutterlessTabPanel value='theme'>
            <Grid container spacing={1.5} mt={2}>
                <Grid xs={6}>
                    <FormSelect
                        control={control}
                        fullWidth
                        name='color_mode'
                        label='Color Mode'
                    >
                        <MenuItem value='light'>Light</MenuItem>
                        <MenuItem value='dark'>Dark</MenuItem>
                    </FormSelect>
                </Grid>
                <Grid xs={6}>
                    <FormSwitch
                        control={control}
                        name='glass_effect'
                        label='Use Glass Effect'
                    />
                </Grid>
                <Grid xs={12}>
                    <FormFileInput
                        control={control}
                        name='background_image_input'
                        label='Background Image'
                        accept="image/*"
                    />
                    <ImageInputPreview imageFile={imageFiles ? imageFiles[0] : undefined} />
                </Grid>
            </Grid>
        </GutterlessTabPanel>
    )
}