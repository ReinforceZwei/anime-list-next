'use client';
import { Noto_Sans_TC } from 'next/font/google';
import { createTheme } from '@mui/material/styles';

const roboto = Noto_Sans_TC({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
});

const theme = createTheme({
  typography: {
    fontFamily: roboto.style.fontFamily,
  },
});

export default theme;