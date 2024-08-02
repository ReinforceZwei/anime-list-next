import { RecordModel } from "pocketbase";
import { baseApi } from "./api";
import { createBrowserClient } from "@/lib/pocketbase";
import { generateCacheTagList } from '../vendor/rtkQueryUtils';


export const userSettingsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getUserSettings: builder.query({
            providesTags: [{ type: 'userSettings', id: '*' }],
            queryFn: async () => {
                const pb = createBrowserClient()
                try {
                    const data = await pb.collection<UserSettingsRecord>('userSettings').getFirstListItem('')
                    return { data }
                } catch (error) {
                    return { error: error }
                }
            }
        })
    })
})



export interface UserSettingsRecord extends RecordModel {
    background_image: string
    color_mode: 'light' | 'dark'
    app_title: string
    glass_effect: boolean
}