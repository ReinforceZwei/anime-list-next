'use client'

import { useGetAnimeQuery, STATUS_OPTIONS, DOWNLOAD_STATUS_OPTIONS, useUpdateAnimeMutation, AnimeRecord } from "@/lib/redux/animeSlice"
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, InputAdornment, ListItemIcon, ListItemText, MenuItem, TextField, Typography, useMediaQuery, useTheme } from "@mui/material"
import Grid from '@mui/material/Unstable_Grid2'
import { useEffect, useMemo, useState } from "react"
import CloseIcon from '@mui/icons-material/Close';
import { Controller, SubmitHandler, useForm } from "react-hook-form"
import FormTextField from "@/lib/component/control/FormTextField"
import FormSelect from "@/lib/component/control/FormSelect"
import { useGetTagsQuery } from "@/lib/redux/tagSlice"
import FormRating from "@/lib/component/control/FormRating"
import InfoIcon from '@mui/icons-material/Info';
import StatusMenuItem, { getStatusIcon } from "./StatusMenuItem"
import FormTagSelect from "../control/FormTagSelect"
import { useRouter } from 'next/navigation'


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

export default function EditAnimeModal(props: EditAnimeModalProps) {
    const theme = useTheme()
    const router = useRouter()

    const { id: animeId, onClose } = props
    const { data: anime, isFetching: isLoading } = useGetAnimeQuery(animeId)
    const { data: tags, isFetching: isTagsLoading } = useGetTagsQuery()

    const [updateAnime] = useUpdateAnimeMutation()

    const [internalShow, setInternalShow] = useState(true)
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))

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

    const tagsById = useMemo(() => tags ? tags.reduce((prev, curr) => {
        prev[curr.id] = curr
        return prev
    }, {} as any) : {}, [tags])

    useEffect(() => {
        if (!isLoading && anime) {
            // reset({...anime, tags: anime.tags.map((tag) => tagsById[tag])})
            reset({...anime, tags: anime.expand?.tags || [], categories: anime.expand?.categories || []})
        }
    }, [anime, isLoading])

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
            //fullScreen={fullScreen}
            fullWidth={true}
            maxWidth='sm'
            TransitionProps={{
                onExited: () => {onClose && onClose()}
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
                <IconButton>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <form onSubmit={handleSubmit(onSubmit)}>
            <DialogContent sx={{ pt: 0 }}>
                
                <Grid container spacing={1} mt={1}>
                    <Grid xs={12}>
                        <FormTextField control={control} name='name' label='Name' TextFieldProps={{ fullWidth: true }} />
                    </Grid>

                    <Grid xs={6}>
                        <FormSelect
                            control={control}
                            fullWidth
                            name='status'
                            label='Status'
                            // SelectProps={{
                            //     startAdornment: (<InputAdornment position="start"><InfoIcon /></InputAdornment>)
                            // }}
                        >
                            { STATUS_OPTIONS.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    <Box display='flex'>
                                        {getStatusIcon(option.value)}
                                        <Box component='span' pl={1}>{option.label}</Box>
                                    </Box>
                                </MenuItem>
                            )) }
                        </FormSelect>
                    </Grid>

                    <Grid xs={6}>
                        <FormSelect
                            control={control}
                            fullWidth
                            name='download_status'
                            label='Download Status'
                        >
                            { DOWNLOAD_STATUS_OPTIONS.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    <Box display='flex'>
                                        {getStatusIcon(option.value)}
                                        <Box component='span' pl={1}>{option.label}</Box>
                                    </Box>
                                </MenuItem>
                            )) }
                        </FormSelect>
                    </Grid>

                    {/* <Grid xs={12}>
                        <FormSelect
                            control={control}
                            fullWidth
                            multiple
                            name='tags'
                            label='Tags'
                            SelectProps={{
                                MenuProps: {
                                    slotProps: {
                                        paper: {
                                            sx: {
                                                maxHeight: 250
                                            }
                                        }
                                    }
                                }
                            }}
                        >
                            { isTagsLoading ? (<MenuItem>Loading...</MenuItem>) : (
                                tags?.map((tag) => (
                                    <MenuItem key={tag.id} value={tag.id}>{tag.name}</MenuItem>
                                ))
                            )}
                        </FormSelect>
                    </Grid> */}

                    <Grid xs>
                        <FormTagSelect
                            control={control}
                            name='tags'
                            label='Tags'
                            options={isTagsLoading ? [] : tags!}
                            getOptionLabel={(option) => option?.name}
                            compareOption={(a, b) => a?.id == b?.id}
                            getChipProps={(option) => {
                                return {
                                    //onDelete: undefined,
                                    sx: {
                                        backgroundColor: option?.color || ''
                                    }
                                }
                            }}
                        />
                    </Grid>
                    <Grid xs='auto'>
                        <IconButton><InfoIcon /></IconButton>
                        {/* <Button variant="outlined">Add</Button> */}
                    </Grid>

                    <Grid xs={12}>
                        <FormTagSelect
                            control={control}
                            name='categories'
                            label='Categories'
                            options={isTagsLoading ? [] : tags!}
                            getOptionLabel={(option) => option?.name}
                            compareOption={(a, b) => a?.id == b?.id}
                            getChipProps={(option) => {
                                return {
                                    //onDelete: undefined,
                                    sx: {
                                        backgroundColor: option?.color || ''
                                    }
                                }
                            }}
                        />
                    </Grid>

                    <Grid xs={12}>
                        <Typography component="legend">Rating</Typography>
                        <FormRating control={control} name='rating' />
                    </Grid>

                    <Grid xs={12}>
                        <FormTextField
                            control={control}
                            name='comment'
                            label='Comment'
                            TextFieldProps={{
                                fullWidth: true,
                                multiline: true,
                                rows: 4,
                            }}
                        />
                    </Grid>

                    <Grid xs={12}>
                        <FormTextField
                            control={control}
                            name='remark'
                            label='Remark'
                            TextFieldProps={{
                                fullWidth: true,
                            }}
                        />
                    </Grid>
                </Grid>
                
            </DialogContent>

            <DialogActions>
                <Button type='submit'>Save</Button>
            </DialogActions>
            </form>
        </Dialog>
    )
}