'use client'
import { Typography } from "@mui/material"
import AnimeListItem from '@/lib/component/AnimeList/AnimeListItem'
import { getAnimes } from "@/lib/service/anime"
import { AnimeRecord } from "@/types/anime"
import { useAppDispatch } from "@/lib/hooks"
import { useEffect } from "react"
import { populateAnimes } from "@/lib/redux/animeSlice"

interface AnimeListClientProps {
    animes: AnimeRecord[]
    title: string
    filter: string
    sort: string
}

// This component not really needed, but just in case if I found
// any way to turn anime list server component to client component
// at client side
export default function AnimeListClient(props: AnimeListClientProps) {
    const { animes, title, filter, sort } = props
    const dispatch = useAppDispatch()

    useEffect(() => {
        dispatch(populateAnimes(animes))
    }, [])
    //const pb = createServerClient(cookies())

    // const animes = await pb.collection('animes').getFullList({
    //     filter: filter,
    //     sort: sort,
    //     expand: 'tags',
    // })

    //const animes = await getAnimes(filter, sort)


    return (
        <ol>
        {animes.map((anime) => (
            <AnimeListItem
                key={anime.id}
                id={anime.id}
                name={anime.name}
                status={anime.status || ''}
                downloadStatus={anime.download_status || ''}
                tags={anime.expand?.tags || []}
                remark={anime.remark || ''}
            />
        ))}
        </ol>
    )
}