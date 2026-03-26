import { Box, Divider, Text } from '@mantine/core'
import { useInfoCard } from './InfoCardContext'
import type { AnimeRecord } from '../../types/anime'

interface InfoCardTextSectionProps {
  label: string
  /** Key of AnimeRecord to read content from */
  contentKey: keyof Pick<AnimeRecord, 'comment' | 'remark'>
}

export default function InfoCardTextSection({ label, contentKey }: InfoCardTextSectionProps) {
  const { anime, loading } = useInfoCard()

  if (loading || !anime?.[contentKey]) return null

  return (
    <Box mb="xs">
      <Divider
        label={<Text size="xs" c="dimmed">{label}</Text>}
        labelPosition="center"
        mb={6}
      />
      <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
        {anime[contentKey]}
      </Text>
    </Box>
  )
}
