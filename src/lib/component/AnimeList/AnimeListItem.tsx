'use client'
import { Chip, useTheme } from '@mui/material'
import TagChip from '@/lib/component/AnimeList/TagChip'
import { fieldSorter } from '@/lib/vendor/sortHelper'

interface AnimeListItemProps {
    name: string
    status: string
    downloadStatus: string
    tags: Array<any>
}



export default function AnimeListItem(props: AnimeListItemProps) {
    const { name, status, downloadStatus, tags } = props
    const theme = useTheme()

    let color = theme.palette.text.primary
    // if (downloadStatus == 'finished') {
    //     color = theme.downloadStatus.finished
    // } else if (status == 'finished') {
    //     color = theme.status.finished
    // } else if (status == 'abandon') {
    //     color = theme.status.abandon
    // }

    const sortedTags = tags.sort(fieldSorter(['weight', 'name']))


    const style = {
        color: color
    }
    return (
        <li>
            <span style={style}>{name}</span>
            { sortedTags && sortedTags.map(tag => (
                <TagChip key={tag.id} name={tag.name} />
            ))}
        </li>
    )
}