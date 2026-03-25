import type { AnimeRecord } from "@/types/anime"
import { List } from "@mantine/core"
import styles from "./Item.module.css"

function getItemClass(record: AnimeRecord): string | undefined {
  if (record.status === "dropped") return styles.dropped
  if (record.downloadStatus === "downloaded") return styles.downloaded
  if (record.status === "completed") return styles.completed
  return undefined
}

export default function Item({
  record,
  onClick,
  itemRef,
}: {
  record: AnimeRecord
  onClick?: (record: AnimeRecord) => void
  itemRef?: (el: HTMLElement | null) => void
}) {
  return (
    <List.Item
      ref={itemRef}
      className={getItemClass(record)}
      style={{ fontSize: '1.1rem' }}
    >
      <span
        style={onClick ? { cursor: 'pointer' } : undefined}
        onClick={onClick ? () => onClick(record) : undefined}
      >
        {record.customName || record.cachedTitle || record.tmdbId}
      </span>
    </List.Item>
  )
}