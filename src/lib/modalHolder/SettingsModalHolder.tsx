'use client'

import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { Box } from "@mui/material"
import SettingsModal from "../component/Settings/SettingsModal"
import { closeSettingsModal } from "../redux/uiSlice"



export default function SettingsModalHolder() {
    const dispatch = useAppDispatch()
    const { open } = useAppSelector((state) => state.ui.settingsModal)

    return (
        <Box>
            { open && <SettingsModal onClose={() => dispatch(closeSettingsModal())} /> }
        </Box>
    )
}