'use client'
import { Paper, styled, alpha } from "@mui/material";



const GlassmorphismPaper = styled(Paper)(({ theme }) => ({
    backdropFilter: 'blur(20px)',
    backgroundColor: alpha(theme.palette.background.default, theme.palette.mode === 'light' ? 0.6 : 0.8),
}))

export default GlassmorphismPaper