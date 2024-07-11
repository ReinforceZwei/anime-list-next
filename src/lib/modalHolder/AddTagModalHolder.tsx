'use client'

import AddTagModal from "@/lib/component/AddTag/AddTagModal"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { closeAddTag } from "@/lib/redux/tagSlice"
import { Box } from "@mui/material"



export default function AddTagModalHolder() {
    const dispatch = useAppDispatch()
    const open = useAppSelector((state) => state.tag.openAddTag)

    return (
        <Box>
            { open && (
                <AddTagModal onClose={() => dispatch(closeAddTag())} />
            )}
        </Box>
    )
}