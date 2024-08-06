'use client'

import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    Typography,
    useMediaQuery,
    useTheme
} from "@mui/material"
import Grid from '@mui/material/Unstable_Grid2'
import { useEffect, useState } from "react"
import CloseIcon from '@mui/icons-material/Close';
import { SubmitHandler, useForm } from "react-hook-form";
import FormTextField from "../control/FormTextField";
import FormSwitch from "../control/FormSwitch";
import FormColorPicker from "../control/FormColorPicker";
import TagChip from "../TagChip/TagChip";
import MuiTagChip from "../TagChip/MuiTagChip";
import { useDeleteTagMutation, useGetTagQuery, useUpdateTagMutation } from "@/lib/redux/tagSlice";
import { useConfirm } from "material-ui-confirm";


interface FormValues {
    name: string
    color?: string
    weight?: number
    display: boolean
}

interface EditTagModalProps {
    id: string
    onClose?: Function
}

export default function EditTagModal(props: EditTagModalProps) {
    const { id, onClose } = props
    const confirm = useConfirm()

    const [isDeleted, setIsDeleted] = useState(false)

    const { data: tag, isFetching } = useGetTagQuery(id, { skip: isDeleted })
    const [ updateTag ] = useUpdateTagMutation()
    const [ deleteTag ] = useDeleteTagMutation()
    const { handleSubmit, reset, setValue, setFocus, control, watch } = useForm<FormValues>({
        defaultValues: {
            name: '',
            color: '',
            weight: 100,
            display: true,
        }
    })

    const inputName = watch('name')
    const inputColor = watch('color')

    const [internalShow, setInternalShow] = useState(true)
    

    const onSubmit: SubmitHandler<FormValues> = (data) => {
        console.log(data)
        updateTag(data).unwrap().then(() => {
            setInternalShow(false)
        }).catch((error) => {
            console.error(error)
            alert('Fail to update tag')
        })
    }

    const onDelete = () => {
        confirm().then(() => {
            setIsDeleted(true)
            deleteTag(id).unwrap().then(() => {
                setInternalShow(false)
            }).catch((error) => {
                console.error(error)
                alert('Fail to delete tag')
            })
        }).catch(() => {
            console.log('cancel it!')
        })
    }

    useEffect(() => {
        if (!isFetching) {
            reset({...tag})
        }
    }, [isFetching, tag])


    return (
        <Dialog
            open={internalShow}
            //onClose={() => setInternalShow(false)}
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
                Edit Tag
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

                    <Grid xs={12}>
                    <Divider><Typography variant="overline">預覽</Typography></Divider>
                    </Grid>

                    <Grid xs={12}>
                    
                        <Box display='flex' justifyContent='center'>
                            <MuiTagChip name={inputName || 'New Tag'} color={inputColor} />
                        </Box>
                        
                    </Grid>
                </Grid>
            </DialogContent>

            <DialogActions>
                <Button variant='outlined' sx={{mr: 'auto'}} color="error" onClick={() => onDelete()}>Delete</Button>
                <Button onClick={() => setInternalShow(false)}>Cancel</Button>
                <Button type='submit' variant='contained'>Save</Button>
            </DialogActions>
            
        </Dialog>
    )
}