import { useMemo, useRef, useState } from 'react'
import {
  Alert,
  Anchor,
  Button,
  Center,
  ColorInput,
  Divider,
  FileButton,
  Group,
  Image,
  Loader,
  Modal,
  Scroller,
  SegmentedControl,
  Select,
  Stack,
  Switch,
  Tabs,
  Text,
  TextInput,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import type { ContextModalProps } from '@/lib/modalStack'
import { IconAdjustments, IconClick, IconDownload, IconExternalLink, IconInfoCircle, IconMinus, IconPlus, IconSettings, IconUpload, IconSection } from '@tabler/icons-react'
import { exportData, importData, type ImportResult } from '@/api/importexport'
import { useUserPreferences } from '@/hooks/useUserPreferences'
import { useUserPreferencesMutation } from '@/hooks/useUserPreferencesMutation'
import { showErrorNotification } from '@/lib/notifications'
import { pb } from '@/lib/pb'
import { SectionEditor } from '@/components/modals/SectionEditor'
import { ActionButtonEditor } from '@/components/ActionButtonEditor/ActionButtonEditor'
import type { ActionButton } from '@/types/filter'
import { DEFAULT_UI_CONFIG } from '@/types/anime'

export function PreferencesModal({ context, id, title, modalProps }: ContextModalProps) {
  const { data: prefs, isLoading } = useUserPreferences()
  const { saveMutation } = useUserPreferencesMutation()

  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const resetFileRef = useRef<() => void>(null)
  const pbAdminUrl = useMemo(() => {
    const base = pb.baseURL?.replace(/\/$/, '') || window.location.origin
    return `${base}/_/`
  }, [])

  const [activeTab, setActiveTab] = useState<string | null>('general')
  const [wallpaperFile, setWallpaperFile] = useState<File | null>(null)
  const [wallpaperPreviewUrl, setWallpaperPreviewUrl] = useState<string | null>(null)
  const wallpaperFileResetRef = useRef<() => void>(null)
  const [uiScale, setUiScale] = useState<number>(() => {
    const stored = localStorage.getItem('ui-scale')
    return stored ? parseInt(stored, 10) : 100
  })

  function handleUiScaleChange(value: number) {
    setUiScale(value)
    document.documentElement.style.fontSize = `${value}%`
    localStorage.setItem('ui-scale', String(value))
  }

  const form = useForm({
    initialValues: {
      uiConfig: { ...DEFAULT_UI_CONFIG, ...prefs?.uiConfig },
      sections: prefs?.sections ?? [],
      actionButtons: prefs?.actionButtons ?? [],
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
    if (wallpaperFile && prefs?.id) {
      // Use FormData so PocketBase receives the file
      const fd = new FormData()
      fd.append('wallpaper', wallpaperFile)
      fd.append('uiConfig', JSON.stringify(values.uiConfig))
      fd.append('sections', JSON.stringify(values.sections ?? []))
      fd.append('actionButtons', JSON.stringify(values.actionButtons ?? []))
      pb.collection('userPreferences').update(prefs.id, fd)
        .then(() => {
          form.resetDirty()
          setWallpaperFile(null)
          setWallpaperPreviewUrl(null)
          context.closeModal(id)
        })
        .catch(showErrorNotification)
      return
    }
    saveMutation.mutate(
      { id: prefs?.id, ...values },
      {
        onSuccess: () => {
          form.resetDirty()
          setWallpaperFile(null)
          setWallpaperPreviewUrl(null)
          context.closeModal(id)
        },
      },
    )
  }

  async function handleExport() {
    setIsExporting(true)
    try {
      await exportData()
    } catch (err) {
      showErrorNotification(err)
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
    <Modal.Root size="lg" {...modalProps}>
      <Modal.Overlay />
      <Modal.Content
        styles={{
          content: {
            overflowY: 'unset',
            display: 'flex',
            flexDirection: 'column',
          }
        }}
      >
        <Modal.Header>
          <Modal.Title>{title}</Modal.Title>
          <Modal.CloseButton />
        </Modal.Header>
        <Modal.Body styles={{ body: { overflowY: 'auto' }}}>
          <form id="preferences-form" onSubmit={form.onSubmit(handleSubmit)}>
            <Tabs value={activeTab} onChange={setActiveTab}>
              <Tabs.List mb="md">
                <Scroller>
                  <Tabs.Tab value="general" leftSection={<IconSettings size="1em" />}>
                    一般
                  </Tabs.Tab>
                  <Tabs.Tab value="sections" leftSection={<IconSection size="1em" />}>
                    區塊
                  </Tabs.Tab>
                  <Tabs.Tab value="actionButtons" leftSection={<IconClick size="1em" />}>
                    自訂按鈕
                  </Tabs.Tab>
                  <Tabs.Tab value="interface" leftSection={<IconAdjustments size="1em" />}>
                    介面
                  </Tabs.Tab>
                  <Tabs.Tab value="importexport" leftSection={<IconDownload size="1em" />}>
                    匯入／匯出
                  </Tabs.Tab>
                </Scroller>
              </Tabs.List>

              <Tabs.Panel value="general">
                <Stack>
                  <TextInput
                    label="頁面標題"
                    placeholder="我的動畫清單"
                    description="顯示在清單頂部的主標題"
                    {...form.getInputProps('uiConfig.pageTitle')}
                  />
                  <Switch
                    label="顯示內建快捷按鈕"
                    description="在動畫資訊卡中顯示內建的狀態轉換按鈕（如「開始觀看」、「標記為已看完」等）"
                    labelPosition="left"
                    {...form.getInputProps('uiConfig.showBuiltInActions', { type: 'checkbox' })}
                  />
                  {/* <Divider /> */}
                  <Anchor
                    href={pbAdminUrl}
                    size="sm"
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    <Group gap="xs">
                      <IconExternalLink size="1em" />
                      前往 Pocketbase 控制台
                    </Group>
                  </Anchor>
                </Stack>
              </Tabs.Panel>

              <Tabs.Panel value="actionButtons">
                <ActionButtonEditor
                  buttons={(form.values as { actionButtons: ActionButton[] }).actionButtons}
                  onChange={(newButtons) => form.setFieldValue('actionButtons', newButtons)}
                />
              </Tabs.Panel>

              <Tabs.Panel value="interface">
                <Stack>
                  <Divider label="介面縮放" labelPosition="left" />
                  <div>
                    <Text size="sm" fw={500} mb={4}>
                      縮放比例
                    </Text>
                    <Text size="xs" c="dimmed" mb="xs">
                      僅限此裝置
                    </Text>
                    <Button.Group>
                      <Button
                        variant="default"
                        disabled={uiScale <= 70}
                        onClick={() => handleUiScaleChange(uiScale - 10)}
                      >
                        <IconMinus size="1em" />
                      </Button>
                      <Button.GroupSection variant="default" bg="var(--mantine-color-body)" miw={60} ta="center">
                        {uiScale}%
                      </Button.GroupSection>
                      <Button
                        variant="default"
                        disabled={uiScale >= 150}
                        onClick={() => handleUiScaleChange(uiScale + 10)}
                      >
                        <IconPlus size="1em" />
                      </Button>
                    </Button.Group>
                  </div>

                  <Divider label="背景桌布" labelPosition="left" />

                  <SegmentedControl
                    data={[
                      { label: '預設', value: 'default' },
                      { label: '純色', value: 'color' },
                      { label: '自訂圖片', value: 'image' },
                    ]}
                    {...form.getInputProps('uiConfig.wallpaper.type')}
                  />

                  {form.values.uiConfig.wallpaper?.type === 'color' && (
                    <ColorInput
                      label="背景顏色"
                      placeholder="#1a1b2e"
                      {...form.getInputProps('uiConfig.wallpaper.color')}
                    />
                  )}

                  {form.values.uiConfig.wallpaper?.type === 'image' && (
                    <>
                      <div>
                        <Text size="sm" fw={500} mb={4}>
                          上傳圖片
                        </Text>
                        <Text size="xs" c="dimmed" mb="xs">
                          支援 PNG、JPEG、WebP、TIFF、BMP（上限 5MB）
                        </Text>
                        <Group>
                          <FileButton
                            resetRef={wallpaperFileResetRef}
                            onChange={(file) => {
                              setWallpaperFile(file)
                              if (file) {
                                setWallpaperPreviewUrl(URL.createObjectURL(file))
                              } else {
                                setWallpaperPreviewUrl(null)
                              }
                            }}
                            accept="image/png,image/jpeg,image/webp,image/tiff,image/bmp"
                          >
                            {(props) => (
                              <Button {...props} leftSection={<IconUpload size="1em" />} variant="default">
                                選擇圖片
                              </Button>
                            )}
                          </FileButton>
                        </Group>
                        {wallpaperPreviewUrl && (
                          <Image
                            src={wallpaperPreviewUrl}
                            alt="桌布預覽"
                            mt="sm"
                            radius="md"
                            fit="cover"
                            h={120}
                            style={{ border: '1px solid var(--mantine-color-default-border)' }}
                          />
                        )}
                      </div>

                      <Select
                        label="background-position"
                        placeholder="center"
                        data={[
                          { label: 'center', value: 'center' },
                          { label: 'top', value: 'top' },
                          { label: 'bottom', value: 'bottom' },
                          { label: 'left', value: 'left' },
                          { label: 'right', value: 'right' },
                          { label: 'top left', value: 'top left' },
                          { label: 'top right', value: 'top right' },
                          { label: 'bottom left', value: 'bottom left' },
                          { label: 'bottom right', value: 'bottom right' },
                        ]}
                        clearable
                        {...form.getInputProps('uiConfig.wallpaper.position')}
                      />

                      <Select
                        label="background-repeat"
                        placeholder="no-repeat"
                        data={[
                          { label: 'no-repeat', value: 'no-repeat' },
                          { label: 'repeat', value: 'repeat' },
                          { label: 'repeat-x', value: 'repeat-x' },
                          { label: 'repeat-y', value: 'repeat-y' },
                        ]}
                        clearable
                        {...form.getInputProps('uiConfig.wallpaper.repeat')}
                      />

                      <Select
                        label="background-size"
                        placeholder="cover"
                        data={[
                          { label: 'cover', value: 'cover' },
                          { label: 'contain', value: 'contain' },
                          { label: 'auto', value: 'auto' },
                          { label: '100% auto', value: '100% auto' },
                        ]}
                        clearable
                        {...form.getInputProps('uiConfig.wallpaper.size')}
                      />
                    </>
                  )}
                </Stack>
              </Tabs.Panel>

              <Tabs.Panel value="sections">
                <SectionEditor
                  sections={form.values.sections}
                  onChange={(newSections) => form.setFieldValue('sections', newSections)}
                />
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
              </Tabs.Panel>
            </Tabs>

          </form>
        </Modal.Body>
        <Group
          justify="flex-end"
          p="md"
          wrap="nowrap"
          style={{
            borderTop: form.isDirty() ? '1px solid var(--mantine-color-default-border)' : '1px solid transparent',
            transition: 'border-color 200ms ease',
          }}
        >
          <Button type="submit" form="preferences-form" loading={saveMutation.isPending} disabled={!form.isDirty()}>
            儲存
          </Button>
        </Group>
      </Modal.Content>
    </Modal.Root>
  )
}
