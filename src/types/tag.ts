import { RecordModel } from "pocketbase"

export interface TagRecord extends RecordModel {
    name: string
    color?: string
    weight?: number
    user_id: string
    display: boolean
}