'use client'

import { Modal } from "@mui/material"
import TmdbInfoCard from "./TmdbInfoCard"


interface TmdbInfoCardModalProps {
    onClose?: Function
    tmdbId: number
    mediaType: 'tv' | 'movie'
}

export default function TmdbInfoCardModal(props: TmdbInfoCardModalProps) {
    const { onClose, tmdbId, mediaType } = props

    return (
        <Modal open={true} onClose={() => onClose && onClose()}>
            <TmdbInfoCard tmdbId={tmdbId} mediaType={mediaType} />
        </Modal>
    )
}