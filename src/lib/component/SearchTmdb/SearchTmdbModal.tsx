'use client'

import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    List,
    ListItem,
    Paper,
    Skeleton,
    TextField,
    useMediaQuery,
    useTheme
} from "@mui/material"
import CloseIcon from '@mui/icons-material/Close';
import { useState } from "react"
import { useAppDispatch } from "@/lib/hooks";
import { useDebounce } from "@/lib/vendor/reactHooks";
import { useLazyMultiSearchQuery } from "@/lib/redux/tmdbApi";
import SearchResultList from "./SearchResultList";
import SearchResultListItem from "./SearchResultListItem";

interface SearchTmdbModalProps {
    onClose?: Function
    initialQuery?: string
}

export default function SearchTmdbModal(props: SearchTmdbModalProps) {
    const { onClose, initialQuery } = props
    const theme = useTheme()
    const dispatch = useAppDispatch()

    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))
    const [internalShow, setInternalShow] = useState(true)

    const [searchInput, setSearchInput] = useState(initialQuery ?? '')

    const [searchTmdb, searchResult] = useLazyMultiSearchQuery()
    const { isLoading, data } = searchResult

    useDebounce(() => {
        searchTmdb(searchInput)
    }, [searchInput], 800)

    if (data) {
        console.log(data)
    }

    return (
        <>
        <Dialog
            open={internalShow}
            onClose={() => setInternalShow(false)}
            fullScreen={fullScreen}
            fullWidth={true}
            maxWidth='sm'
            TransitionProps={{
                onExited: () => {onClose && onClose()}
            }}
            scroll="paper"
        >
            <DialogTitle
                component='div'
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                Search
                <IconButton onClick={() => setInternalShow(false)}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                <Box>
                    <TextField
                        label="Name"
                        variant="outlined"
                        fullWidth
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                    />
                </Box>
                
                <SearchResultList>
                    { data && data.results.map(x => (
                        <SearchResultListItem key={x.id} result={x} />
                    ))}
                </SearchResultList>
            </DialogContent>

            {/* <DialogActions>
                <Button type='submit'>Save</Button>
            </DialogActions> */}
        </Dialog>

        </>
    )
}