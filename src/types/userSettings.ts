import { RecordModel } from "pocketbase"

export interface UserSettingsRecord extends RecordModel {
    background_image: string
    color_mode: 'light' | 'dark'
    app_title: string
    glass_effect: boolean
}