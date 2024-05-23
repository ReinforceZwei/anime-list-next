'use client'

import { ReactNode } from "react";
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import WorkHistoryIcon from '@mui/icons-material/WorkHistory';
import DoneIcon from '@mui/icons-material/Done';
import DoDisturbIcon from '@mui/icons-material/DoDisturb';
import { ListItemIcon, MenuItem } from "@mui/material";


interface StatusMenuItemProps {
    name: string
    children?: ReactNode
}

export function getStatusIcon(name: string): ReactNode {
    switch (name) {
        case 'pending': return <HourglassBottomIcon />;
        case 'in-progress': return <WorkHistoryIcon />;
        case 'finished': return <DoneIcon />;
        case 'abandon': return <DoDisturbIcon />;
        default: return null
    }
}

export default function StatusMenuItem(props: StatusMenuItemProps) {
    const { name, children, ...rest } = props
    const icon = getStatusIcon(props.name)
    return (
        <MenuItem value={name} {...rest}>
            <ListItemIcon>
                {icon}
            </ListItemIcon>
            {children}
        </MenuItem>
    )
}