'use client'

import { Box, Fab, Menu, MenuItem, MenuList } from "@mui/material"
import { useState } from "react"
import ManageTagModalHolder from "@/lib/modalHolder/ManageTagModalHolder";
import { useAppDispatch } from "@/lib/hooks";
import { openManageTagModal, openSettingsModal } from "@/lib/redux/uiSlice";
import { createBrowserClient } from "@/lib/pocketbase";
import { useRouter } from "next/navigation";




export default function AppMenu() {
    const dispatch = useAppDispatch()
    const router = useRouter()

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const dispatchAppMenu = (action: { payload: undefined, type: string }) => {
        handleClose()
        dispatch(action)
    }

    const logout = () => {
        const pb = createBrowserClient()
        pb.authStore.clear()
        router.push('/login')
    }

    return (
        <Box>
            <Fab sx={{position: 'fixed', left: 10, top: 10}} size="medium" color="primary" onClick={handleClick}>
                A
            </Fab>

            <Menu
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                disableScrollLock
            >
                <MenuList dense disablePadding>
                    <MenuItem onClick={() => {router.refresh()}}>HeHeXD</MenuItem>
                    <MenuItem onClick={() => {dispatchAppMenu(openManageTagModal())}}>Tags</MenuItem>
                    <MenuItem onClick={() => {dispatchAppMenu(openSettingsModal())}}>Settings</MenuItem>
                    <MenuItem onClick={() => {logout()}}>Logout</MenuItem>
                </MenuList>
                
            </Menu>

            <ManageTagModalHolder />
        </Box>
    )
}