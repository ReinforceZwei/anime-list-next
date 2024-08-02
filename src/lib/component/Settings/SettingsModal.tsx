'use client'
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Tab,
    useMediaQuery,
    useTheme
} from "@mui/material"
import Grid from '@mui/material/Unstable_Grid2'
import { useEffect, useState } from "react"
import CloseIcon from '@mui/icons-material/Close';
import { SubmitHandler, useForm } from "react-hook-form";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import GutterlessTabPanel from "../Tab/GutterlessTabPanel";

export type FormValues = {
    background_image: string
    color_mode: 'light' | 'dark'
    app_title: string
    glass_effect: boolean
}

type TabValues = 'general' | 'theme'

export default function SettingsModal() {
    const theme = useTheme()

    const [internalShow, setInternalShow] = useState(true)
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))

    const [tabValue, setTabValue] = useState<TabValues>('general')

    const { handleSubmit, reset, setValue, setFocus, control, formState } = useForm<FormValues>()

    const onSubmit: SubmitHandler<FormValues> = (data) => {

    }

    return (
        <Dialog
            open={internalShow}
            onClose={() => setInternalShow(false)}
            fullScreen={fullScreen}
            fullWidth={true}
            maxWidth='sm'
            scroll="paper"
            PaperProps={{
                component: 'form',
                onSubmit: handleSubmit(onSubmit),
            }}
        >
            <DialogTitle
                component='div'
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                Settings
                <IconButton onClick={() => setInternalShow(false)}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            
            <DialogContent sx={{ pt: 0 }} dividers>

                <TabContext value={tabValue}>
                    <TabList onChange={(event, newValue) => setTabValue(newValue)}>
                        <Tab label='General' value='general' />
                    </TabList>

                    <GutterlessTabPanel value='general'>
                        
                    </GutterlessTabPanel>
                
                </TabContext>
            </DialogContent>

            <DialogActions sx={{ justifyContent: 'space-between'}}>
                <Button type='submit'>Save</Button>
            </DialogActions>
            
        </Dialog>
    )
}