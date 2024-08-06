import { baseApi } from "./api";
import { createBrowserClient } from "@/lib/pocketbase";
import { UserSettingsRecord } from "@/types/userSettings";


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
