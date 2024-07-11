'use client'

import { Box, Fade, Modal } from "@mui/material"
import { CSSProperties, useState } from "react"



interface PosterViewerProps {
    onClose?: Function
    imageSrc: string
}

const imgStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    cursor: 'pointer',
}

export default function PosterViewer(props: PosterViewerProps) {
    const { onClose, imageSrc } = props
    const [open, setOpen] = useState(true)

    const handleClose = () => {
        setOpen(false)
    }

    return (
        <Modal
            open={open}
            onClose={() => handleClose()}
            closeAfterTransition
            onTransitionExited={() => {onClose && onClose()}}
        >
            <Fade in={open}>
                <Box
                    sx={{
                        width: '100%',
                        height: '100%',
                    }}
                >
                    { imageSrc && <img src={imageSrc} style={imgStyle} onClick={() => handleClose()} />}
                </Box>
            </Fade>
        </Modal>
    )
}