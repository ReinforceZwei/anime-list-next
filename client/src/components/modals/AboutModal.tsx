import { Anchor, Center, Image, Stack, Text } from '@mantine/core'
import type { ContextModalProps } from '@/lib/modalStack'

export function AboutModal(_props: ContextModalProps) {
  return (
    <Stack align="center" gap="sm" py="md">
      <Center>
        <Image src="/Anime.png" alt="App Logo" w={80} h={80} />
      </Center>
      <Text fw={700} size="xl">
        動漫清單
      </Text>
      <Text size="sm" c="dimmed">
        版本：{__APP_VERSION__}
      </Text>
      <Text size="sm" c="dimmed">
        作者：{' '}
        <Anchor href="https://github.com/ReinforceZwei" target="_blank" rel="noopener noreferrer">
          ReinforceZwei
        </Anchor>
      </Text>
      <Anchor
        href="https://github.com/ReinforceZwei/anime-list-next"
        target="_blank"
        rel="noopener noreferrer"
        size="sm"
      >
        GitHub
      </Anchor>
    </Stack>
  )
}
