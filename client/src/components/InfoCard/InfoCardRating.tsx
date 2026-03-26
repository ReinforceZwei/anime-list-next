import { Rating, Skeleton } from '@mantine/core'
import { useInfoCard } from './InfoCardContext'

export default function InfoCardRating() {
  const { anime, loading } = useInfoCard()

  if (loading) return <Skeleton height={20} width={120} mb="xs" />
  if (!anime?.rating) return null

  return (
    <Rating
      value={anime.rating}
      readOnly
      mb="xs"
    />
  )
}
