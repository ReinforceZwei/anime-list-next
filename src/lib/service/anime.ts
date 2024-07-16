'use server'

import { cookies } from "next/headers"
import { createServerClient } from "../pocketbase"
import { AnimeRecord } from "../redux/animeSlice"

export async function getAnimes(filter?: string, sort?: string): Promise<AnimeRecord[]> {
    const cookie = cookies()
    const pb = createServerClient(cookie)

    return await pb.collection<AnimeRecord>('animes').getFullList({
        filter, sort,
        expand: 'tags,categories'
    })
}