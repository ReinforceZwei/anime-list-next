'use client'
import { Chip, useTheme } from '@mui/material'
import TagChip from '@/lib/component/TagChip/TagChip'
import { fieldSorter } from '@/lib/vendor/sortHelper'
import { useAppDispatch } from '@/lib/hooks'
import { openCard } from '@/lib/redux/animeSlice'
import { CSSProperties } from 'react'

interface AnimeListItemProps {
    id: string
    name: string
    status: string
    downloadStatus: string
    tags: Array<any>
}



export default function AnimeListItem(props: AnimeListItemProps) {
    const { id, name, status, downloadStatus, tags } = props
    const theme = useTheme()
    const dispatch = useAppDispatch()

    let color = theme.palette.text.primary
    if (downloadStatus == 'finished') {
        color = theme.downloadStatus.finished
    } else if (status == 'finished') {
        color = theme.status.finished
    } else if (status == 'abandon') {
        color = theme.status.abandon
    }

    const sortedTags = tags.sort(fieldSorter(['weight', 'name']))

    const handleOnClick = () => {
        dispatch(openCard(id))
    }


    const style: CSSProperties = {
        color: color,
        cursor: 'pointer',
    }
    return (
        <li>
            <span style={style} onClick={handleOnClick} data-anime-id={id}>{name}</span>
            { sortedTags && sortedTags.map(tag => (
                <TagChip key={tag.id} name={tag.name} color={tag.color} />
            ))}
        </li>
    )
}