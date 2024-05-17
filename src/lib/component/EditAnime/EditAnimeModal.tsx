'use client'

import { useGetAnimeQuery } from "@/lib/redux/animeSlice"
import { Dialog, DialogContent, DialogTitle, IconButton, TextField, useMediaQuery, useTheme } from "@mui/material"
import Grid from '@mui/material/Unstable_Grid2'
import { useEffect, useState } from "react"
import CloseIcon from '@mui/icons-material/Close';
import { Controller, useForm } from "react-hook-form"
import FormTextField from "./control/FormTextField"
import FormSelectMulti from "./control/FormSelectMulti"

interface EditAnimeModalProps {
    id: string
    onClose?: Function
}

export default function EditAnimeModal(props: EditAnimeModalProps) {
    const theme = useTheme()

    const { id: animeId, onClose } = props
    const { data: anime, isFetching: isLoading } = useGetAnimeQuery(animeId)

    const [internalShow, setInternalShow] = useState(true)
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))

    const { handleSubmit, reset, setValue, setFocus, control } = useForm({
        defaultValues: {
            name: '',
            status: '',
            download_status: '',
            rating: 0,
            comment: '',
            remark: '',
        }
    })

    useEffect(() => {
        if (!isLoading && anime) {
            reset({...anime})
        }
    }, [anime, isLoading])

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

            <DialogContent>
                <form>
                    <Grid container spacing={1} mt={1}>
                        <Grid xs={12}>
                            <FormTextField control={control} name='name' label='Name' TextFieldProps={{ fullWidth: true }} />
                        </Grid>

                        <Grid xs={12}>
                            <FormSelectMulti />
                        </Grid>
                    </Grid>
                </form>
            </DialogContent>
        </Dialog>
    )
}