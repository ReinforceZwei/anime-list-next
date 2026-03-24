import { useRef, useState } from 'react'
import {
  Alert,
  Button,
  Center,
  Divider,
  FileButton,
  Group,
  Loader,
  Stack,
  Tabs,
  Text,
  TextInput,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import type { ContextModalProps } from '@mantine/modals'
import { IconDownload, IconInfoCircle, IconSettings, IconUpload } from '@tabler/icons-react'
import { exportData, importData, type ImportResult } from '@/api/importexport'
import { useUserPreferences } from '@/hooks/useUserPreferences'
import { useUserPreferencesMutation } from '@/hooks/useUserPreferencesMutation'

export function PreferencesModal({ context, id }: ContextModalProps) {
  const { data: prefs, isLoading } = useUserPreferences()
  const { saveMutation } = useUserPreferencesMutation()

  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const resetFileRef = useRef<() => void>(null)

  const form = useForm({
    initialValues: {
      pageTitle: prefs?.pageTitle ?? '',
      watchingLabel: prefs?.watchingLabel ?? '',
      completedLabel: prefs?.completedLabel ?? '',
      plannedLabel: prefs?.plannedLabel ?? '',
      droppedLabel: prefs?.droppedLabel ?? '',
    },
  })

  if (isLoading) {
    return (
      <Center py="xl">
        <Loader size="sm" />
      </Center>
    )
  }

  function handleSubmit(values: typeof form.values) {
    saveMutation.mutate(
      { id: prefs?.id, ...values },
      { onSuccess: () => context.closeModal(id) },
    )
  }

  async function handleExport() {
    setIsExporting(true)
    try {
      await exportData()
    } finally {
      setIsExporting(false)
    }
  }

  async function handleImport(file: File | null) {
    if (!file) return
    setIsImporting(true)
    setImportResult(null)
    setImportError(null)
    try {
      const result = await importData(file)
      setImportResult(result)
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Import failed')
    } finally {
      setIsImporting(false)
      resetFileRef.current?.()
    }
  }

  return (
    <Tabs defaultValue="general">
      <Tabs.List mb="md">
        <Tabs.Tab value="general" leftSection={<IconSettings size={14} />}>
          General
        </Tabs.Tab>
        <Tabs.Tab value="importexport" leftSection={<IconDownload size={14} />}>
          Import / Export
        </Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="general">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              label="Page Title"
              placeholder="My Anime List"
              description="The main heading shown at the top of your list"
              {...form.getInputProps('pageTitle')}
            />
            <Divider label="Section Names" labelPosition="left" />
            <TextInput
              label="Watching"
              placeholder="Watching"
              {...form.getInputProps('watchingLabel')}
            />
            <TextInput
              label="Completed"
              placeholder="Completed"
              {...form.getInputProps('completedLabel')}
            />
            <TextInput
              label="Planned"
              placeholder="Planned"
              {...form.getInputProps('plannedLabel')}
            />
            <TextInput
              label="Dropped"
              placeholder="Dropped"
              {...form.getInputProps('droppedLabel')}
            />
            <Button type="submit" loading={saveMutation.isPending}>
              Save
            </Button>
          </Stack>
        </form>
      </Tabs.Panel>

      <Tabs.Panel value="importexport">
        <Stack>
          <div>
            <Text fw={500} size="sm" mb={4}>
              Export
            </Text>
            <Text size="xs" c="dimmed" mb="xs">
              Download all your anime records and tags as a JSON file.
            </Text>
            <Button
              leftSection={<IconDownload size={16} />}
              variant="default"
              loading={isExporting}
              onClick={handleExport}
            >
              Export data
            </Button>
          </div>

          <Divider />

          <div>
            <Text fw={500} size="sm" mb={4}>
              Import
            </Text>
            <Text size="xs" c="dimmed" mb="xs">
              Restore from a previously exported JSON file. Existing records with the same ID will be
              updated.
            </Text>
            <Group>
              <FileButton resetRef={resetFileRef} onChange={handleImport} accept="application/json">
                {(props) => (
                  <Button
                    {...props}
                    leftSection={<IconUpload size={16} />}
                    variant="default"
                    loading={isImporting}
                  >
                    Choose file
                  </Button>
                )}
              </FileButton>
            </Group>

            {importResult && (
              <Alert mt="sm" icon={<IconInfoCircle size={16} />} color="green" variant="light">
                Imported {importResult.importedRecords} anime record
                {importResult.importedRecords !== 1 ? 's' : ''} and {importResult.importedTags} tag
                {importResult.importedTags !== 1 ? 's' : ''}.
              </Alert>
            )}

            {importError && (
              <Alert mt="sm" icon={<IconInfoCircle size={16} />} color="red" variant="light">
                {importError}
              </Alert>
            )}
          </div>
        </Stack>
      </Tabs.Panel>
    </Tabs>
  )
}
