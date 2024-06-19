'use client'
import { Chip, ChipProps, Skeleton, styled, useTheme } from "@mui/material"
import getColor from "./getColor"


interface TagChipProps {
    name: string
    color?: string
    ChipProps?: ChipProps
}

export default function MuiTagChip(props: TagChipProps) {
    const theme = useTheme()
    const { name, color, ChipProps } = props

    const style = {
        ...getColor(color || theme.palette.primary.main),
        transition: 'none',
    }
    return (
        <Chip {...ChipProps} style={style} label={name} />
    )
}