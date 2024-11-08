'use client'

import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { Box } from "@mui/material"
import { closeSearchTmdbModal } from "../redux/uiSlice"
import SearchTmdbModal from "../component/SearchTmdb/SearchTmdbModal"

export default function SearchTmdbModalHolder() {
    const dispatch = useAppDispatch()
    const { open, payload } = useAppSelector((state) => state.ui.searchTmdbModal)

    return (
        <Box>
            { open && <SearchTmdbModal onClose={() => dispatch(closeSearchTmdbModal())} initialQuery={payload} /> }
        </Box>
    )
}