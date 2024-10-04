import { Noto_Sans_TC } from 'next/font/google';
import { Theme } from '@mui/material/styles';

const roboto = Noto_Sans_TC({
    subsets: ['latin'],
});

export const themeOptions = {
    palette: {
        mode: 'light',
        primary: {
            main: '#f8bbd0',
        },
        secondary: {
            main: '#f50057',
        },
    },
    typography: {
        fontFamily: roboto.style.fontFamily,
    },
} as Theme;