'use client'

import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { Box } from "@mui/material"
import ManageTagModal from "@/lib/component/ManageTag/ManageTagModal"
import { closeManageTag } from "@/lib/redux/tagSlice"





export default function ManageTagModalHolder() {
    const dispatch = useAppDispatch()
    const isOpen = useAppSelector((state) => state.tag.openManageTag)

    return (
        <Box>
            { isOpen && <ManageTagModal onClose={() => dispatch(closeManageTag())} /> }
        </Box>
    )
}