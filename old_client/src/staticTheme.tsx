'use client'

import { ThemeProvider, createTheme } from "@mui/material";
import { deepmerge } from '@mui/utils'
import { statusDarkColorTheme } from "./theme";
import { useMemo } from "react";
import { themeOptions } from "./themeOptions";

export default function StaticThemeProvider({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) { 
    const colorMode = 'dark'
    const statusColor = statusDarkColorTheme
    const theme = useMemo(() => createTheme(deepmerge(themeOptions, {
        palette: {
            mode: colorMode,
        },
        ...statusColor,
    })), [colorMode])
    
    return (
        <ThemeProvider theme={theme}>
            {children}
        </ThemeProvider>
    )
}