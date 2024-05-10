import { Typography } from "@mui/material"
import { createServerClient } from "@/lib/pocketbase"
import { cookies } from "next/headers"
import AnimeListItem from '@/lib/component/AnimeList/AnimeListItem'

interface AnimeListProps {
    title: string
    filter: string
    sort: string
}

export default async function AnimeList(props: AnimeListProps) {
    const { title, filter, sort } = props
    const pb = createServerClient(cookies())

    const animes = await pb.collection('animes').getFullList({
        filter: filter,
        sort: sort,
        expand: 'tags',
    })


    return (
        <div>
            { title && <Typography variant="subtitle1" align="center">{title}</Typography> }
            { (
                <ol>
                {animes.map((anime) => (
                    <AnimeListItem key={anime.id} name={anime.name} status={anime.status} downloadStatus={anime.download_status} tags={anime.expand?.tags || []} />
                ))}
                </ol>
            )}
        </div>
    )
}