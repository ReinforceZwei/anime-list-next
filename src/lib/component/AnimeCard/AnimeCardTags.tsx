'use client'

import { TagRecord } from "@/lib/redux/tagSlice"
import { Box, Skeleton } from "@mui/material"
import TagChip from "@/lib/component/TagChip/TagChip"


interface AnimeCardTagsProps {
    tags?: TagRecord[]
    loading: boolean
}

export default function AnimeCardTags(props: AnimeCardTagsProps) {
    const { tags, loading } = props

    return (
        <Box>
        { loading ? <Skeleton /> : (
            tags && tags.map(tag => (
                <TagChip key={tag.id} name={tag.name} color={tag.color} />
            ))
        )}
        </Box>
    )
}