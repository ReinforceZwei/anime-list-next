import { baseApi } from "./api";
import { createBrowserClient } from "@/lib/pocketbase";
import { UserSettingsRecord } from "@/types/userSettings";


export const userSettingsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getUserSettings: builder.query<UserSettingsRecord, void>({
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
        }),
        updateUserSettings: builder.mutation<UserSettingsRecord, Partial<UserSettingsRecord> | FormData>({
            invalidatesTags: [{ type: 'userSettings', id: '*' }],
            queryFn: async (settings) => {
                const pb = createBrowserClient()
                try {
                    let id: string
                    if (settings instanceof FormData) {
                        id = settings.get('id') as string
                    } else {
                        id = settings.id!
                    }
                    const data = await pb.collection<UserSettingsRecord>('userSettings').update(id, settings)
                    return { data }
                } catch (error) {
                    return { error: error }
                }
            }
        }),
    })
})

export const {
    useGetUserSettingsQuery,
    useUpdateUserSettingsMutation,
} = userSettingsApi