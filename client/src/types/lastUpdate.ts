import type { RecordModel } from "pocketbase";

export interface LastUpdateRecord extends RecordModel {
  userId: string;
  collection: string;
  lastUpdated: string;
  created: string;
}