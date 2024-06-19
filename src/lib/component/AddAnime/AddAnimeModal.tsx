'use client'

import {
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
import { useEffect, useState } from "react"
import CloseIcon from '@mui/icons-material/Close';
import { SubmitHandler, useForm } from "react-hook-form";
import FormTextField from "../control/FormTextField";
import { AnimeRecord, useAddAnimeMutation } from "@/lib/redux/animeSlice";
import { useRouter } from "next/navigation";

const defaultValues = {
    status: 'pending',
    download_status: 'pending',
}

type FormValues = {
    name: string
}

interface AddAnimeModalProps {
    onClose?: Function
}

export default function AddAnimeModal(props: AddAnimeModalProps) {
    const { onClose } = props
    const theme = useTheme()
    const router = useRouter()

    const [addAnime] = useAddAnimeMutation()

    const { handleSubmit, reset, setValue, setFocus, control } = useForm<FormValues>({
        defaultValues: {
            name: '',
        }
    })

    const [internalShow, setInternalShow] = useState(true)

    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))

    useEffect(() => {
        setTimeout(() => setFocus('name'), 1)
        
    }, [setFocus])

    const onSubmit: SubmitHandler<FormValues> = (data) => {
        console.log(data)
        const final = {
            ...defaultValues,
            ...data,
        }
        console.log('final', final)
        addAnime(final as AnimeRecord).unwrap().then(() => {
            setInternalShow(false)
            if (onClose) {
                onClose()
            }
            router.refresh()
        }).catch((error) => {
            console.error(error)
            alert('Fail to add anime')
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
                Add
                <IconButton onClick={() => setInternalShow(false)}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            
            <DialogContent sx={{ pt: 2 }} dividers>

                <Grid container>
                    <Grid xs={12}>
                        <FormTextField
                            control={control}
                            name='name'
                            label='Name'
                            TextFieldProps={{
                                fullWidth: true,
                                autoFocus: true,
                            }}
                            rules={{
                                required: true,
                            }}
                        />
                    </Grid>
                </Grid>

                

                {/* TODO: Create relationship */}

                
            </DialogContent>

            <DialogActions>
                <Button type='submit'>Save</Button>
            </DialogActions>
            
        </Dialog>
    )
}