import PocketBase from 'pocketbase'

export const pb = new PocketBase(import.meta.env.VITE_PB_URL)

export const Collections = {
  Users: 'users',
  Animes: 'animes',
  Tags: 'tags',
  LastUpdates: 'lastUpdates',
  UserPreferences: 'userPreferences',
} as const

export type CollectionName = (typeof Collections)[keyof typeof Collections]