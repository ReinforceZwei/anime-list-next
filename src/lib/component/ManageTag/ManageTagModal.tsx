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
    List,
    ListItem,
    useMediaQuery,
    useTheme
} from "@mui/material"
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { useState } from "react"
import { openAddTag, useGetTagsQuery } from "@/lib/redux/tagSlice";
import MuiTagChip from "../TagChip/MuiTagChip";
import EditTagModal from "../EditTag/EditTagModal";
import { useAppDispatch } from "@/lib/hooks";

interface ManageTagModalProps {
    onClose?: Function
}

export default function ManageTagModal(props: ManageTagModalProps) {
    const { onClose } = props
    const theme = useTheme()
    const dispatch = useAppDispatch()

    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))
    const [internalShow, setInternalShow] = useState(true)

    const { data: tags, isLoading: isFetching } = useGetTagsQuery()

    const [editingId, setEditingId] = useState<string | null>(null)

    return (
        <>
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
        >
            <DialogTitle
                component='div'
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                Manage Tags
                <IconButton onClick={() => setInternalShow(false)}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>

                <Box>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => dispatch(openAddTag())}>Create</Button>
                </Box>

                <Box pt={1} pb={1}>
                    <Divider>Edit</Divider>
                </Box>

                { !isFetching && (
                    tags?.map(tag => (
                        <Box key={tag.id} display='inline'>
                            <MuiTagChip
                                name={tag.name}
                                color={tag.color}
                                ChipProps={{
                                    onClick: (e) => {setEditingId(tag.id)},
                                    sx: {
                                        m: 0.5,
                                    }
                                }}
                            />
                        </Box>
                    ))
                )}
                
            </DialogContent>

            {/* <DialogActions>
                <Button type='submit'>Save</Button>
            </DialogActions> */}
        </Dialog>

        { editingId && <EditTagModal id={editingId} onClose={() => setEditingId(null)} />}

        </>
    )
}