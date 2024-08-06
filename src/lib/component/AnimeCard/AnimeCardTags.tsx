'use client'

import { Box, Skeleton } from "@mui/material"
import TagChip from "@/lib/component/TagChip/TagChip"
import { TagRecord } from "@/types/tag"


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