'use client';
import { Noto_Sans_TC } from 'next/font/google';
import { Theme, createTheme } from '@mui/material/styles';
import { ThemeProvider } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery'
import { deepmerge } from '@mui/utils'
import { useMemo } from 'react';

declare module '@mui/material/styles' {
    interface Theme {
        status: {
            pending: string;
            inProgress: string;
            finished: string;
            abandon: string;
        };
        downloadStatus: {
            pending: string;
            inProgress: string;
            finished: string;
        };
    }
    // allow configuration using `createTheme`
    interface ThemeOptions {
        status?: {
            pending?: string;
            inProgress?: string;
            finished?: string;
            abandon?: string;
        };
        downloadStatus?: {
            pending?: string;
            inProgress?: string;
            finished?: string;
        };
    }
}

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

export const statusLightColorTheme = {
    status: {
        pending: 'palette.text.primary',
        inProgress: 'palette.text.primary',
        finished: '#ab1000',
        abandon: '#7e00de'
    },
    downloadStatus: {
        pending: 'palette.text.primary',
        inProgress: 'palette.text.primary',
        finished: '#00651a'
    }
}

export const statusDarkColorTheme = {
    status: {
        pending: 'palette.text.primary',
        inProgress: 'palette.text.primary',
        finished: '#c79b96',
        abandon: '#b98bdc'
    },
    downloadStatus: {
        pending: 'palette.text.primary',
        inProgress: 'palette.text.primary',
        finished: '#85b792'
    }
}

export default function CustomThemeProvider({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)') ? 'dark' : 'light'
    const statusColor = prefersDarkMode == 'light' ? statusLightColorTheme : statusDarkColorTheme
    const theme = useMemo(() => createTheme(deepmerge(themeOptions, {
        palette: {
            mode: prefersDarkMode,
        },
        ...statusColor,
    })), [prefersDarkMode])
    
    return (
        <ThemeProvider theme={theme}>
            {children}
        </ThemeProvider>
    )
}

//export default theme;