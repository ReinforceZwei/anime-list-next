'use server'

import { cookies } from "next/headers"
import PocketBase from "pocketbase";
import { createServerClient } from "../pocketbase"
import { UserSettingsRecord } from "@/types/userSettings"

export async function getUserSettings(): Promise<UserSettingsRecord | null> {
    const cookie = cookies()
    const pb = createServerClient(cookie)

    try{
        return await pb.collection<UserSettingsRecord>('userSettings').getFirstListItem('')
    } catch {
        return null
    }
}

export async function getBackgroundImageUrl(record: UserSettingsRecord) {
    const cookie = cookies()
    const pb = createServerClient(cookie)

    return pb.files.getUrl(record, record.background_image)
}

export async function getBackgroundImageUrlForClient(record: UserSettingsRecord) {
    const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_API_URL)
    return pb.files.getUrl(record, record.background_image)
}