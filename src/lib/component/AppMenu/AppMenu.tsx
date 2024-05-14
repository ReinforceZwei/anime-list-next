'use client'

import { Box, Fab, Menu, MenuItem, MenuList } from "@mui/material"
import { useState } from "react"




export default function AppMenu() {
    const [menuOpen, setMenuOpen] = useState(false)

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
                </MenuList>
                
            </Menu>
        </Box>
    )
}