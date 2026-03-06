import StoreProvider from "@/lib/StoreProvider";
import MuiConfirmProvider from "@/lib/component/MuiConfirm/MuiConfirmProvider";
import GlassmorphismPaper from "@/lib/component/Wallpaper/GlassmorphismPaper";
import WallpaperWrapper from "@/lib/component/Wallpaper/WallpaperWrapper";
import CustomThemeProvider from "@/theme";
import { Box, Container, Paper } from "@mui/material";



export default function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div>
            {/* <CustomThemeProvider> */}
                <MuiConfirmProvider>
                    <WallpaperWrapper>
                        <Container maxWidth={false} sx={{maxWidth: '700px'}} disableGutters>
                            {children}
                        </Container>
                    </WallpaperWrapper>
                </MuiConfirmProvider>
            {/* </CustomThemeProvider> */}
        </div>
    )
}