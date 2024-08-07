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
import ThemePanel from "./ThemePanel";
import { useGetUserSettingsQuery, useUpdateUserSettingsMutation } from "@/lib/redux/userSettingsSlice";
import GeneralPanel from "./GeneralPanel";
import { useRouter } from "next/navigation";

export type FormValues = {
    background_image: string
    background_image_input: FileList
    color_mode: 'light' | 'dark'
    app_title: string
    glass_effect: boolean
}

type TabValues = 'general' | 'theme'

interface SettingsModalProps {
    onClose?: Function
}

export default function SettingsModal(props: SettingsModalProps) {
    const { onClose } = props
    const theme = useTheme()
    const router = useRouter()

    const [internalShow, setInternalShow] = useState(true)
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))

    const [tabValue, setTabValue] = useState<TabValues>('general')

    const { handleSubmit, reset, setValue, setFocus, control, formState } = useForm<FormValues>()

    const { data: userSettings, isLoading } = useGetUserSettingsQuery()
    const [updateUserSettings] = useUpdateUserSettingsMutation()

    useEffect(() => {
        if (!isLoading && userSettings) {
            reset(userSettings)
        }
    }, [isLoading, userSettings])

    const onSubmit: SubmitHandler<FormValues> = (data) => {
        console.log(data)
        let final: FormValues | FormData = data
        if (data.background_image_input && data.background_image_input.length > 0) {
            // upload background image using FormData
            const formData = new FormData()
            Object.keys(data).forEach(key => formData.append(key, (data as any)[key]))

            formData.delete('background_image_input')
            formData.delete('background_image')
            formData.append('background_image', data.background_image_input[0])

            final = formData
        }
        //console.log([...final])
        updateUserSettings(final).unwrap().then(() => {
            setInternalShow(false)
            //router.refresh()
        }).catch(error => {
            console.error(error)
            alert('Fail to save settings')
        })
    }

    return (
        <Dialog
            open={internalShow}
            onClose={() => setInternalShow(false)}
            fullScreen={fullScreen}
            fullWidth={true}
            maxWidth='sm'
            TransitionProps={{
                onExited: () => {onClose && onClose()}
            }}
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
                        <Tab label='Theme' value='theme' />
                    </TabList>

                    <GeneralPanel control={control} />

                    <ThemePanel control={control} />
                
                </TabContext>
            </DialogContent>

            <DialogActions>
                <Button type='submit'>Save</Button>
            </DialogActions>
            
        </Dialog>
    )
}