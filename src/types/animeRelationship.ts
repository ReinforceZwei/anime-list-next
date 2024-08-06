import { RecordModel } from "pocketbase"

export interface AnimeRelationshipRecord extends RecordModel {
    relationship: string[]
    user_id: string
}