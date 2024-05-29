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
import { useEffect, useMemo, useState } from "react"
import CloseIcon from '@mui/icons-material/Close';
import { Controller, SubmitHandler, useForm } from "react-hook-form"
import { useRouter } from 'next/navigation'
import GeneralControl from "./GeneralControl"
import GutterlessTabPanel from "./GutterlessTabPanel";


interface EditAnimeModalProps {
    id: string
    onClose?: Function
}

type FormValues = {
    name: string
    status: 'pending' | 'in-progress' | 'finished' | 'abandon'
    download_status: 'pending' | 'in-progress' | 'finished'
    rating: number
    comment: string
    remark: string
    tags: string[]
    categories: string[]
}

type TabValues = 'general'

export default function EditAnimeModal(props: EditAnimeModalProps) {
    const theme = useTheme()
    const router = useRouter()

    const { id: animeId, onClose } = props
    const { data: anime, isFetching: isLoading } = useGetAnimeQuery(animeId)
    // const { data: tags, isFetching: isTagsLoading } = useGetTagsQuery()

    const [updateAnime] = useUpdateAnimeMutation()

    const [internalShow, setInternalShow] = useState(true)
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))
    const [tabValue, setTabValue] = useState<TabValues>('general')

    const { handleSubmit, reset, setValue, setFocus, control } = useForm<FormValues>({
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
        const final = {
            ...data,
            tags: data.tags?.map(x => x.id) || [],
            categories: data.categories?.map(x => x.id) || [],
        } as unknown
        console.log(final)
        updateAnime(final as AnimeRecord).unwrap().then(() => {
            setInternalShow(false)
            router.refresh()
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