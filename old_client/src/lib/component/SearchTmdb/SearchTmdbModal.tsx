'use client'

import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    InputAdornment,
    List,
    ListItem,
    Paper,
    Skeleton,
    TextField,
    useMediaQuery,
    useTheme
} from "@mui/material"
import CloseIcon from '@mui/icons-material/Close';
import { useRef, useState } from "react"
import { useAppDispatch } from "@/lib/hooks";
import { useDebounce } from "@/lib/vendor/reactHooks";
import { useIsTmdbAvailableQuery, useLazyMultiSearchQuery } from "@/lib/redux/tmdbApi";
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

    const inputRef = useRef<HTMLInputElement>()
    const [searchInput, setSearchInput] = useState(initialQuery ?? '')

    const { data: tmdbAvailable } = useIsTmdbAvailableQuery()
    // const tmdbAvailable = false
    const [searchTmdb, searchResult] = useLazyMultiSearchQuery()
    const { isLoading, data } = searchResult

    useDebounce(() => {
        if (tmdbAvailable && searchInput) {
            searchTmdb(searchInput)
        }
    }, [searchInput, tmdbAvailable], 800)

    const clearInput = () => {
        setSearchInput('')
        inputRef.current?.focus()
    }

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
                Create
                <IconButton onClick={() => setInternalShow(false)}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent  sx={{overflowY: 'initial'}}>
                <Box>
                    <TextField
                        label="Name"
                        variant="outlined"
                        fullWidth
                        value={searchInput}
                        inputRef={inputRef}
                        onChange={(e) => setSearchInput(e.target.value)}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => clearInput()}>
                                        <CloseIcon />
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                        
                    />
                </Box>
            </DialogContent>

            { tmdbAvailable && (
            <DialogContent >
                { isLoading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <CircularProgress />
                    </Box>
                )}
                { data && (
                    <SearchResultList>
                        { data.results.map(x => (
                            <SearchResultListItem key={x.id} result={x} />
                        ))}
                    </SearchResultList>
                )}
            </DialogContent>
            )}

            <DialogActions>
                <Button type='submit' disabled={!searchInput}>
                    { data ? 'Create without TMDB' : 'Create' }
                </Button>
            </DialogActions>
        </Dialog>

        </>
    )
}