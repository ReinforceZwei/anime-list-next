'use client'
import { Chip, useTheme } from '@mui/material'
import TagChip from '@/lib/component/AnimeList/TagChip'
import { fieldSorter } from '@/lib/vendor/sortHelper'
import { useAppDispatch } from '@/lib/hooks'
import { open } from '@/lib/redux/animeSlice'

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
        dispatch(open(id))
    }


    const style = {
        color: color
    }
    return (
        <li>
            <span style={style} onClick={handleOnClick}>{name}</span>
            { sortedTags && sortedTags.map(tag => (
                <TagChip key={tag.id} name={tag.name} />
            ))}
        </li>
    )
}