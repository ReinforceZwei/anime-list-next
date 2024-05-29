import { Typography } from "@mui/material"
import { createServerClient } from "@/lib/pocketbase"
import { cookies } from "next/headers"
import AnimeListItem from '@/lib/component/AnimeList/AnimeListItem'
import { getAnimes } from "@/lib/service/anime"

interface AnimeListProps {
    title: string
    filter: string
    sort: string
}

export default async function AnimeList(props: AnimeListProps) {
    const { title, filter, sort } = props
    const pb = createServerClient(cookies())

    // const animes = await pb.collection('animes').getFullList({
    //     filter: filter,
    //     sort: sort,
    //     expand: 'tags',
    // })

    const animes = await getAnimes(filter, sort)


    return (
        <div>
            { title && <Typography variant="subtitle1" align="center">{title}</Typography> }
            { (
                <ol>
                {animes.map((anime) => (
                    <AnimeListItem key={anime.id} id={anime.id} name={anime.name} status={anime.status} downloadStatus={anime.download_status} tags={anime.expand?.tags || []} />
                ))}
                </ol>
            )}
        </div>
    )
}