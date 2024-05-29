'use server'

import { cookies } from "next/headers"
import { createServerClient } from "../pocketbase"

export async function getAnimes(filter?: string, sort?: string) {
    const cookie = cookies()
    const pb = createServerClient(cookie)

    return await pb.collection('animes').getFullList({
        filter, sort,
        expand: 'tags,categories'
    })
}