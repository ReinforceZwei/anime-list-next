import { getContrastRatio, alpha } from "@mui/material";


interface ColorStyle {
    color: string
    backgroundColor: string
}

export default function getColor(color: string): ColorStyle {
    return {
        backgroundColor: color,
        color: selectContrastColor(color, '#ffffff', '#000000')
    }
}

export function getMuiChipColor(color: string) {
    const bgColor = getColor(color)
    return {
        ...bgColor,
        '& .MuiChip-deleteIcon': {
            color: alpha(bgColor.color, 0.7),
            '&:hover': {
                color: bgColor.color
            }
        }
    }
}

export function selectContrastColor(color: string, light: string, dark: string): string {
    return getContrastRatio(light, color) > getContrastRatio(dark, color) ? light : dark
}