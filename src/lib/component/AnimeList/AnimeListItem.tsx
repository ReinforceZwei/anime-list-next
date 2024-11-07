'use client'
import { Chip, useTheme } from '@mui/material'
import TagChip from '@/lib/component/TagChip/TagChip'
import { fieldSorter } from '@/lib/vendor/sortHelper'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { animeTouched, useGetAnimeQuery } from '@/lib/redux/animeSlice'
import { CSSProperties, useCallback, useEffect, useMemo } from 'react'
import { openAnimeCard } from '@/lib/redux/uiSlice'
import TagChipReactive from '../TagChip/TagChipReactive'

interface AnimeListItemProps {
    id: string
    name: string
    status: string
    downloadStatus: string
    tags: Array<any>
    remark: string
}



export default function AnimeListItem(props: AnimeListItemProps) {
    const { id, name, status, downloadStatus, tags, remark } = props
    const theme = useTheme()
    const dispatch = useAppDispatch()
    const touchedIds = useAppSelector(state => state.anime.touchedAnimeId)
    const isMeTouched = useMemo(() => touchedIds.includes(id), [touchedIds])
    const { data: anime, isLoading } = useGetAnimeQuery(id, { skip: !isMeTouched })

    // Select data source between props and query
    let myName: string,
        myStatus: string,
        myDownloadStatus: string,
        myTags: Array<any>
    if (isMeTouched && !isLoading && anime) {
        myName = anime.name
        myStatus = anime.status as string
        myDownloadStatus = anime.download_status as string
        myTags = [anime.expand?.tags || []]
    } else {
        myName = name
        myStatus = status
        myDownloadStatus = downloadStatus
        myTags = tags
    }

    let color = theme.palette.text.primary
    let textDecoration = undefined
    if (myDownloadStatus == 'finished') {
        color = theme.downloadStatus.finished
    } else if (myStatus == 'finished') {
        color = theme.status.finished
    } else if (myStatus == 'abandon') {
        color = theme.status.abandon
        textDecoration = 'line-through'
    }

    const sortedTags = useMemo(() => myTags.slice().sort(fieldSorter(['weight', 'name'])), [myTags])

    const handleOnClick = useCallback(() => {
        dispatch(openAnimeCard(id))
        dispatch(animeTouched(id))
    }, [id])


    const style: CSSProperties = {
        color: color,
        cursor: 'pointer',
        textDecoration: textDecoration
    }
    return (
        <li>
            <span style={style} onClick={handleOnClick} data-anime-id={id}>{myName}</span>
            { remark && <span style={{ color: theme.remark }}>（{remark}）</span> }
            { sortedTags && sortedTags.map(tag => (
                <TagChipReactive key={tag.id} id={tag.id} name={tag.name} color={tag.color} />
            ))}
        </li>
    )
}