'use client';
import { Noto_Sans_TC } from 'next/font/google';
import { Theme, createTheme } from '@mui/material/styles';
import { ThemeProvider } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery'
import { deepmerge } from '@mui/utils'
import { useMemo } from 'react';


const roboto = Noto_Sans_TC({
    weight: ['300', '400', '500', '700'],
    subsets: ['latin'],
});

export const themeOptions = {
    palette: {
        mode: 'light',
        primary: {
            main: '#f9a825',
        },
        secondary: {
            main: '#546e7a',
        },
    },
    typography: {
        fontFamily: roboto.style.fontFamily,
    },
} as Theme;

export default function CustomThemeProvider({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)') ? 'dark' : 'light'
    const theme = useMemo(() => createTheme(deepmerge(themeOptions, {
        palette: {
            mode: prefersDarkMode,
        },
    })), [prefersDarkMode])
    
    return (
        <ThemeProvider theme={theme}>
            {children}
        </ThemeProvider>
    )
}

//export default theme;