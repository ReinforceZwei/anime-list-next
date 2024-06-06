'use client'

import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Typography,
    useMediaQuery,
    useTheme
} from "@mui/material"
import Grid from '@mui/material/Unstable_Grid2'
import { useState } from "react"
import CloseIcon from '@mui/icons-material/Close';
import { SubmitHandler, useForm } from "react-hook-form";
import FormTextField from "../control/FormTextField";
import { AnimeRecord, useAddAnimeMutation } from "@/lib/redux/animeSlice";
import { useRouter } from "next/navigation";
import FormSwitch from "../control/FormSwitch";
import FormColorPicker from "../control/FormColorPicker";


interface FormValues {
    name: string
    color?: string
    weight?: number
    display: boolean
}

interface AddTagModalProps {
    onClose?: Function
}

export default function AddTagModal(props: AddTagModalProps) {
    const { onClose } = props

    const { handleSubmit, reset, setValue, setFocus, control } = useForm<FormValues>({
        defaultValues: {
            name: '',
            color: '',
            weight: 100,
            display: true,
        }
    })

    const [internalShow, setInternalShow] = useState(true)

    const onSubmit: SubmitHandler<FormValues> = (data) => {
        console.log(data)
    }


    return (
        <Dialog
            open={internalShow}
            onClose={() => setInternalShow(false)}
            // fullScreen={fullScreen}
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
                Add New Tag
                <IconButton onClick={() => setInternalShow(false)}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            
            <DialogContent sx={{ pt: 2 }} dividers>

                <Grid container spacing={1.5}>
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

                    <Grid xs={12}>
                        <FormTextField
                            control={control}
                            name='weight'
                            label='Weight'
                            TextFieldProps={{
                                fullWidth: true,
                                inputMode: 'numeric',
                                type: 'number',
                            }}
                        />
                    </Grid>

                    <Grid xs={12}>
                        <Typography component="legend">Color</Typography>
                        <FormColorPicker
                            control={control}
                            name='color'
                        />
                    </Grid>

                    <Grid xs={12}>
                        <FormSwitch
                            control={control}
                            name='display'
                            label='Display on list'
                        />
                    </Grid>
                </Grid>

                

                

                
            </DialogContent>

            <DialogActions>
                <Button type='submit'>Create</Button>
            </DialogActions>
            
        </Dialog>
    )
}