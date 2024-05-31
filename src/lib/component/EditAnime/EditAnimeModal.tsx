'use client'

import { useGetAnimeQuery, STATUS_OPTIONS, DOWNLOAD_STATUS_OPTIONS, useUpdateAnimeMutation, AnimeRecord } from "@/lib/redux/animeSlice"
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    useMediaQuery,
    useTheme
} from "@mui/material"
import Grid from '@mui/material/Unstable_Grid2'
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { useEffect, useMemo, useState, useTransition } from "react"
import CloseIcon from '@mui/icons-material/Close';
import { Controller, SubmitHandler, useForm } from "react-hook-form"
import { useRouter } from 'next/navigation'
import GeneralControl from "./GeneralControl"
import GutterlessTabPanel from "./GutterlessTabPanel";
import updateStartTimeOnStatusChange from "./updateRules/updateStartTimeOnStatusChange";
import updateFinishTimeOnStatusChange from "./updateRules/updateFinishTimeOnStatusChange";
import { useRouterRefresh } from "@/lib/routerHooks";


interface EditAnimeModalProps {
    id: string
    onClose?: (requireRefresh: boolean, requireScroll: boolean) => void
}

export type FormValues = {
    name: string
    status: 'pending' | 'in-progress' | 'finished' | 'abandon'
    download_status: 'pending' | 'in-progress' | 'finished'
    rating: number
    comment: string
    remark: string
    tags: string[]
    categories: string[]
    start_time: string  // Datetime stored as string
    finish_time: string // Datetime stored as string
}

type TabValues = 'general'

export default function EditAnimeModal(props: EditAnimeModalProps) {
    const theme = useTheme()

    const { id: animeId, onClose } = props
    const { data: anime, isFetching: isLoading } = useGetAnimeQuery(animeId)
    // const { data: tags, isFetching: isTagsLoading } = useGetTagsQuery()

    const [updateAnime] = useUpdateAnimeMutation()

    const [internalShow, setInternalShow] = useState(true)
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))
    const [tabValue, setTabValue] = useState<TabValues>('general')
    const [requireScroll, setRequireScroll] = useState(false)
    const [requireRefresh, setRequireRefresh] = useState(false)

    const { handleSubmit, reset, setValue, setFocus, control, formState } = useForm<FormValues>({
        defaultValues: {
            name: '',
            status: 'pending',
            download_status: 'pending',
            rating: 0,
            comment: '',
            remark: '',
        }
    })

    useEffect(() => {
        if (!isLoading && anime) {
            // reset({...anime, tags: anime.tags.map((tag) => tagsById[tag])})
            reset({...anime, tags: anime.expand?.tags || [], categories: anime.expand?.categories || []})
        }
    }, [anime, isLoading, reset])

    const onSubmit: SubmitHandler<FormValues> = (data) => {
        console.log(data)
        let final = {
            ...data,
            tags: data.tags?.map(x => x.id) || [],
            categories: data.categories?.map(x => x.id) || [],
        } as FormValues

        // Apply rules
        final = updateStartTimeOnStatusChange(final, formState)
        final = updateFinishTimeOnStatusChange(final, formState)

        // If status changed, scroll to new position after page update
        if (formState.dirtyFields.status) {
            setRequireScroll(true)
        }
        setRequireRefresh(true)


        console.log(final)
        updateAnime(final as unknown as AnimeRecord).unwrap().then(() => {
            //setInternalShow(false)

        }).catch((error) => {
            console.error(error)
            alert('Error update anime')
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
                onExited: () => {onClose && onClose(requireRefresh, requireScroll)}
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
                Edit
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
                        <GeneralControl control={control} />
                    </GutterlessTabPanel>
                
                </TabContext>
            </DialogContent>

            <DialogActions>
                <Button type='submit'>Save</Button>
            </DialogActions>
            
        </Dialog>
    )
}