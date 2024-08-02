'use client'

import { Box, Fab, Menu, MenuItem, MenuList } from "@mui/material"
import { useState } from "react"
import ManageTagModalHolder from "@/lib/modalHolder/ManageTagModalHolder";
import { useAppDispatch } from "@/lib/hooks";
import { openManageTagModal } from "@/lib/redux/uiSlice";




export default function AppMenu() {
    const dispatch = useAppDispatch()

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

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
                    <MenuItem>HeHeXD</MenuItem>
                    <MenuItem onClick={() => {handleClose();dispatch(openManageTagModal())}}>Tags</MenuItem>
                </MenuList>
                
            </Menu>

            <ManageTagModalHolder />
        </Box>
    )
}