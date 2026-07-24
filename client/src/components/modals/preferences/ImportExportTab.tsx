import { Alert, Button, Divider, FileButton, Group, Stack, Text } from '@mantine/core'
import { IconDownload, IconInfoCircle, IconUpload } from '@tabler/icons-react'
import { useImportExport } from '@/components/modals/preferences/useImportExport'

export function ImportExportTab() {
  const {
    isExporting,
    isImporting,
    importResult,
    importError,
    resetFileRef,
    handleExport,
    handleImport,
  } = useImportExport()

  return (
    <Stack>
      <div>
        <Text fw={500} size="sm" mb={4}>
          匯出
        </Text>
        <Text size="xs" c="dimmed" mb="xs">
          將所有動畫紀錄與標籤下載為 JSON 檔。
        </Text>
        <Button
          leftSection={<IconDownload size="1em" />}
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
                leftSection={<IconUpload size="1em" />}
                variant="default"
                loading={isImporting}
              >
                選擇檔案
              </Button>
            )}
          </FileButton>
        </Group>

        {importResult && (
          <Alert mt="sm" icon={<IconInfoCircle size="1em" />} color="green" variant="light">
            已匯入 {importResult.importedRecords} 筆動畫紀錄與 {importResult.importedTags} 個標籤。
          </Alert>
        )}

        {importError && (
          <Alert mt="sm" icon={<IconInfoCircle size="1em" />} color="red" variant="light">
            {importError}
          </Alert>
        )}
      </div>
    </Stack>
  )
}
