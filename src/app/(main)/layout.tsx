import StoreProvider from "@/lib/StoreProvider";
import MuiConfirmProvider from "@/lib/component/MuiConfirm/MuiConfirmProvider";
import { Box, Container, Paper } from "@mui/material";



export default function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div>
            <StoreProvider>
                <MuiConfirmProvider>
                    <Container maxWidth={false} sx={{maxWidth: '700px'}} disableGutters>
                        <Paper elevation={5}>
                            <Box padding={{ sm: 6, xs: 2 }}>
                                {children}
                            </Box>
                        </Paper>
                    </Container>
                </MuiConfirmProvider>
            </StoreProvider>
        </div>
    )
}