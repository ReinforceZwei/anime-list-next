import { Badge, Group, Skeleton } from '@mantine/core'
import { useInfoCard } from './InfoCardContext'

export default function InfoCardTags() {
  const { tags, loading } = useInfoCard()

  if (loading) return <Skeleton height={20} width="60%" mb="xs" />
  if (!tags.length) return null

  return (
    <Group gap={4} mb="xs">
      {tags.map((tag) => (
        <Badge
          key={tag.id}
          size="sm"
          variant="filled"
          color={tag.color ?? 'gray'}
          style={{ textTransform: 'none' }}
        >
          {tag.name}
        </Badge>
      ))}
    </Group>
  )
}
