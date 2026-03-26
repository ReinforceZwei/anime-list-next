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
      setImportError(err instanceof Error ? err.message : '匯入失敗')
    } finally {
      setIsImporting(false)
      resetFileRef.current?.()
    }
  }

  return (
    <Tabs defaultValue="general">
      <Tabs.List mb="md">
        <Tabs.Tab value="general" leftSection={<IconSettings size={14} />}>
          一般
        </Tabs.Tab>
        <Tabs.Tab value="importexport" leftSection={<IconDownload size={14} />}>
          匯入／匯出
        </Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="general">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              label="頁面標題"
              placeholder="我的動畫清單"
              description="顯示在清單頂部的主標題"
              {...form.getInputProps('pageTitle')}
            />
            <Divider label="區塊名稱" labelPosition="left" />
            <TextInput
              label="觀看中"
              placeholder="觀看中"
              {...form.getInputProps('watchingLabel')}
            />
            <TextInput
              label="已看完"
              placeholder="已看完"
              {...form.getInputProps('completedLabel')}
            />
            <TextInput
              label="待看"
              placeholder="待看"
              {...form.getInputProps('plannedLabel')}
            />
            <TextInput
              label="棄番"
              placeholder="棄番"
              {...form.getInputProps('droppedLabel')}
            />
            <Button type="submit" loading={saveMutation.isPending}>
              儲存
            </Button>
          </Stack>
        </form>
      </Tabs.Panel>

      <Tabs.Panel value="importexport">
        <Stack>
          <div>
            <Text fw={500} size="sm" mb={4}>
              匯出
            </Text>
            <Text size="xs" c="dimmed" mb="xs">
              將所有動畫紀錄與標籤下載為 JSON 檔。
            </Text>
            <Button
              leftSection={<IconDownload size={16} />}
              variant="default"
              loading={isExporting}
              onClick={handleExport}
            >
              匯出資料
            </Button>
          </div>

          <Divider />

          <div>
            <Text fw={500} size="sm" mb={4}>
              匯入
            </Text>
            <Text size="xs" c="dimmed" mb="xs">
              從先前匯出的 JSON 檔還原。相同 ID 的既有紀錄將被更新。
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
                    選擇檔案
                  </Button>
                )}
              </FileButton>
            </Group>

            {importResult && (
              <Alert mt="sm" icon={<IconInfoCircle size={16} />} color="green" variant="light">
                已匯入 {importResult.importedRecords} 筆動畫紀錄與 {importResult.importedTags} 個標籤。
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
