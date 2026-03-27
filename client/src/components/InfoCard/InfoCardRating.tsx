import { Group, Rating, Skeleton, Text } from '@mantine/core'
import { useInfoCard } from './InfoCardContext'

export default function InfoCardRating() {
  const { anime, loading } = useInfoCard()

  if (loading) return <Skeleton height={20} width={120} mb="xs" />
  if (!anime?.rating) return null

  return (
    <Group gap="xs" align="center" mb="xs">
      <Rating value={anime.rating} fractions={10} readOnly />
      <Text size="sm" c="dimmed">{anime.rating}</Text>
    </Group>
  )
}
