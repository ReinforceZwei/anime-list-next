'use client'

import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { Box } from "@mui/material"
import ManageTagModal from "@/lib/component/ManageTag/ManageTagModal"
import { closeManageTagModal } from "../redux/uiSlice"





export default function ManageTagModalHolder() {
    const dispatch = useAppDispatch()
    const { open } = useAppSelector((state) => state.ui.manageTagModal)

    return (
        <Box>
            { open && <ManageTagModal onClose={() => dispatch(closeManageTagModal())} /> }
        </Box>
    )
}