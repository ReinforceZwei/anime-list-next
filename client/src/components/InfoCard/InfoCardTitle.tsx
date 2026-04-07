import { useState } from 'react'
import { ActionIcon, Group, Skeleton, Text, Tooltip } from '@mantine/core'
import { IconCopy, IconCheck } from '@tabler/icons-react'
import { getDisplayTitle } from '@/lib/animeUtils'
import { useInfoCard } from './InfoCardContext'

export default function InfoCardTitle() {
  const { anime, loading } = useInfoCard()
  const [copied, setCopied] = useState(false)

  const title = anime ? getDisplayTitle(anime) : undefined

  const handleCopy = () => {
    if (title) {
      navigator.clipboard.writeText(title).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 1200)
      })
    }
  }

  if (loading) return <Skeleton height={28} mb="xs" />

  return (
    <Group gap={4} align="flex-start" wrap="nowrap" mb="xs">
      <Text fw={700} size="lg" style={{ flex: 1, lineHeight: 1.3 }}>
        {title}
      </Text>
      {title && (
        <Tooltip label={copied ? '已複製！' : '複製標題'} withArrow position="top">
          <ActionIcon
            size="sm"
            variant="subtle"
            color={copied ? 'teal' : 'gray'}
            onClick={handleCopy}
            aria-label="複製標題"
            style={{ flexShrink: 0, marginTop: 3 }}
          >
            {copied ? <IconCheck size="1em" /> : <IconCopy size="1em" />}
          </ActionIcon>
        </Tooltip>
      )}
    </Group>
  )
}
