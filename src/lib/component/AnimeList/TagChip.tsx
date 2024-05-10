'use client'
import { Chip, Skeleton, styled, useTheme } from "@mui/material"

const Tag = styled('span')(({ theme }) => ({
    color: theme.palette.getContrastText(theme.palette.text.secondary),
    backgroundColor: theme.palette.text.secondary,
    borderRadius: '10px',
    paddingLeft: 5,
    paddingRight: 5,
    fontSize: "0.825em",
    whiteSpace: 'nowrap',
    marginLeft: 2,
    marginRight: 2,
    userSelect: 'none',
}))

interface TagChipProps {
    name: string
    color?: string
}

export default function TagChip(props: TagChipProps) {
    const theme = useTheme()
    const { name, color } = props

    
    return (
        <Tag sx={{backgroundColor: color || 'pink', color: theme.palette.getContrastText('#FFC0CB')}}>{name}</Tag>
    )
}