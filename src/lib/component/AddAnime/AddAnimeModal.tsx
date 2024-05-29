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
import { useState } from "react"
import CloseIcon from '@mui/icons-material/Close';
import { SubmitHandler, useForm } from "react-hook-form";
import FormTextField from "../control/FormTextField";

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

    const { handleSubmit, reset, setValue, setFocus, control } = useForm<FormValues>({
        defaultValues: {
            name: '',
        }
    })

    const [internalShow, setInternalShow] = useState(true)

    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))

    const onSubmit: SubmitHandler<FormValues> = (data) => {
        console.log(data)
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