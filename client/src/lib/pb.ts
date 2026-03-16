import PocketBase from 'pocketbase'

export const pb = new PocketBase(import.meta.env.VITE_PB_URL)

export const Collections = {
  Users: 'users',
  Animes: 'animeRecords',
  Tags: 'tags',
  LastUpdates: 'lastUpdates',
} as const

export type CollectionName = (typeof Collections)[keyof typeof Collections]