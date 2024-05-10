import { Box, Container, Paper } from "@mui/material";



export default function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div>
            <Container maxWidth={false} sx={{maxWidth: '700px'}} disableGutters>
                <Paper elevation={5}>
                    <Box padding={{ sm: 6, xs: 2 }}>
                        {children}
                    </Box>
                </Paper>
            </Container>
            
        </div>
    )
}