import type { AnimeRecord } from "@/types/anime"
import { List } from "@mantine/core"
import styles from "./Item.module.css"

function getItemClass(record: AnimeRecord): string | undefined {
  if (record.downloadStatus === "downloaded") return styles.downloaded
  if (record.status === "completed") return styles.completed
  if (record.status === "dropped") return styles.dropped
  return undefined
}

export default function Item({ record }: { record: AnimeRecord }) {
  return (
    <List.Item className={getItemClass(record)} style={{ fontSize: '1.1rem' }}>
      {record.customName || record.cachedTitle || record.tmdbId}
    </List.Item>
  )
}