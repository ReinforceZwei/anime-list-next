import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import {
  TextInput,
  Card,
  Image,
  Text,
  Badge,
  Button,
  Group,
  SimpleGrid,
  Stack,
  Loader,
  Center,
  Title,
} from '@mantine/core'
import { useDebouncedValue } from '@mantine/hooks'
import { modals } from '@/lib/modalStack'
import { IconSearch, IconMovie } from '@tabler/icons-react'
import { useTmdbSearch } from '@/hooks/useTmdb'

export const Route = createFileRoute('/_auth/tmdb')({
  component: RouteComponent,
})

function RouteComponent() {
  const [query, setQuery] = useState('')
  const [debounced] = useDebouncedValue(query, 400)
  const { data, isFetching } = useTmdbSearch(debounced)

  function openTmdbModal() {
    modals.openContextModal({
      modal: 'tmdbSearch',
      title: 'Search TMDb',
      size: '56rem',
      innerProps: {},
    })
  }

  return (
    <Stack p="xl" maw={1000} mx="auto">
      <Group justify="space-between" align="center">
        <Title order={2}>TMDB Search</Title>
        <Button leftSection={<IconMovie size={16} />} onClick={openTmdbModal}>
          Open Modal
        </Button>
      </Group>

      <TextInput
        placeholder="Search movies & TV shows…"
        leftSection={<IconSearch size={16} />}
        rightSection={isFetching ? <Loader size="xs" /> : null}
        value={query}
        onChange={(e) => setQuery(e.currentTarget.value)}
        size="md"
      />

      {data && data.length === 0 && (
        <Center py="xl">
          <Text c="dimmed">No results for "{debounced}"</Text>
        </Center>
      )}

      <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="md">
        {data?.map((item) => (
          <Card key={item.id} shadow="sm" padding="xs" radius="md" withBorder>
            <Card.Section>
              <Image
                src={item.posterPath}
                fallbackSrc="https://placehold.co/300x450?text=No+Image"
                height={200}
                fit="cover"
              />
            </Card.Section>

            <Stack gap={4} mt="xs">
              <Text fw={600} size="sm" lineClamp={2}>
                {item.title}
              </Text>
              {item.originalTitle && item.originalTitle !== item.title && (
                <Text size="xs" c="dimmed" lineClamp={1}>
                  {item.originalTitle}
                </Text>
              )}
              <Group gap={4}>
                <Badge size="xs" variant="light" color={item.mediaType === 'tv' ? 'blue' : 'grape'}>
                  {item.mediaType === 'tv' ? 'TV' : 'Movie'}
                </Badge>
                {item.year && (
                  <Text size="xs" c="dimmed">
                    {item.year}
                  </Text>
                )}
              </Group>
              {item.overview && (
                <Text size="xs" c="dimmed" lineClamp={3}>
                  {item.overview}
                </Text>
              )}
            </Stack>
          </Card>
        ))}
      </SimpleGrid>
    </Stack>
  )
}
