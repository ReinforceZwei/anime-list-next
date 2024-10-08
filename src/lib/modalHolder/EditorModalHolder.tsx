'use client'

import EditAnimeModal from "@/lib/component/EditAnime/EditAnimeModal"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { useRouterRefresh } from "@/lib/routerHooks"
import { Box } from "@mui/material"
import { closeEditAnimeModal } from "../redux/uiSlice"

/**
 * Scroll element into view only when element is not in viewport
 * @param element Element to scroll into
 * @returns 
 */
function scrollIntoView(element: Element | null) {
    if (!element) {
        return
    }

    const top = element.getBoundingClientRect().top
    const isInView = top >= 0 && top <= window.innerHeight
    if (!isInView) {
        element.scrollIntoView({
            behavior: 'smooth'
        })
    }
}


export default function EditorModalHolder() {
    const dispatch = useAppDispatch()
    const { open, payload: id } = useAppSelector(state => state.ui.editAnimeModal)
    const refresh = useRouterRefresh()

    const handleOnClose = (requireRefresh: boolean, requireScroll: boolean) => {
        if (requireRefresh) {
            refresh().then(() => {
                if (requireScroll) {
                    scrollIntoView(document.querySelector(`span[data-anime-id="${id}"]`))
                }
            }).finally(() => {
                dispatch(closeEditAnimeModal())
            })
        } else {
            dispatch(closeEditAnimeModal())
        }
    }

    if (open && id) {
        return (
            <Box sx={{
                position: 'fixed',
                right: 5,
                top: 5,
                maxWidth: 350,
                width: '100%',
                zIndex: 'drawer',
            }}>
                <EditAnimeModal id={id} onClose={handleOnClose} />
            </Box>
        )
    }
    return null
}