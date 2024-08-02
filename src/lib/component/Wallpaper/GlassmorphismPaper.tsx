'use client'
import { Paper, styled, alpha } from "@mui/material";



const GlassmorphismPaper = styled(Paper)(({ theme }) => ({
    backdropFilter: 'blur(20px)',
    backgroundColor: alpha(theme.palette.background.default, 0.6),
}))

export default GlassmorphismPaper