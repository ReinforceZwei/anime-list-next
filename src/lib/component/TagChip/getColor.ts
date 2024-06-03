import { getContrastRatio } from "@mui/material";


interface ColorStyle {
    color: string
    backgroundColor: string
}

export default function getColor(color: string): ColorStyle {
    const a = getContrastRatio('#000000', color)
    return {
        backgroundColor: color,
        color: a >= 3 ? '#000000' : '#ffffff'
    }
}