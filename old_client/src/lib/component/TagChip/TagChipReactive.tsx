'use client'

import { useGetTagQuery } from "@/lib/redux/tagSlice"
import TagChip from "./TagChip"


interface TagChipReactiveProps {
    id: string
    name: string
    color?: string
}

/**
 * Tag Chip with RTK query to auto-update tag content
 * @param props 
 * @returns 
 */
export default function TagChipReactive(props: TagChipReactiveProps) {
    const { id, name, color } = props

    const { data: tag, isLoading } = useGetTagQuery(id)

    if (!isLoading && tag) {
        return <TagChip name={tag.name} color={tag.color} />
    } else {
        return <TagChip name={name} color={color} />
    }
}