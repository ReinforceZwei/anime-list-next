'use client'

import AddTagModal from "@/lib/component/AddTag/AddTagModal"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { Box } from "@mui/material"
import { closeAddTagModal } from "../redux/uiSlice"



export default function AddTagModalHolder() {
    const dispatch = useAppDispatch()
    const { open } = useAppSelector((state) => state.ui.addTagModal)

    return (
        <Box>
            { open && (
                <AddTagModal onClose={() => dispatch(closeAddTagModal())} />
            )}
        </Box>
    )
}