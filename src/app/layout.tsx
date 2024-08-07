import type { Metadata } from "next";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import CustomThemeProvider from '../theme';
import { CssBaseline } from '@mui/material';
import "./globals.css";
import StoreProvider from "@/lib/StoreProvider";

export const metadata: Metadata = {
  title: "Anime List",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
      
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <StoreProvider>
            <CustomThemeProvider>
              <CssBaseline />
              {children}
            </CustomThemeProvider>
          </StoreProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
