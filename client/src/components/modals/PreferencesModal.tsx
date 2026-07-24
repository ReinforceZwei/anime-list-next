import { useMemo, useState } from 'react'
import {
  Button,
  Center,
  Group,
  Loader,
  Modal,
  Scroller,
  Tabs,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import type { ContextModalProps } from '@/lib/modalStack'
import { IconAdjustments, IconClick, IconDownload, IconSettings, IconSection } from '@tabler/icons-react'
import { useUserPreferences } from '@/hooks/useUserPreferences'
import { useUserPreferencesMutation } from '@/hooks/useUserPreferencesMutation'
import { useWallpaperUpload } from '@/components/modals/preferences/useWallpaperUpload'
import { showErrorNotification } from '@/lib/notifications'
import { pb } from '@/lib/pb'
import { SectionEditor } from '@/components/modals/preferences/SectionEditor'
import { ActionButtonEditor } from '@/components/modals/preferences/ActionButtonEditor'
import type { ActionButton } from '@/types/filter'
import { DEFAULT_UI_CONFIG } from '@/types/anime'
import { GeneralTab } from '@/components/modals/preferences/GeneralTab'
import { InterfaceTab } from '@/components/modals/preferences/InterfaceTab'
import { ImportExportTab } from '@/components/modals/preferences/ImportExportTab'

export function PreferencesModal({ context, id, title, modalProps }: ContextModalProps) {
  const { data: prefs, isLoading } = useUserPreferences()
  const { saveMutation } = useUserPreferencesMutation()
  const wallpaper = useWallpaperUpload()

  const pbAdminUrl = useMemo(() => {
    const base = pb.baseURL?.replace(/\/$/, '') || window.location.origin
    return `${base}/_/`
  }, [])

  const [activeTab, setActiveTab] = useState<string | null>('general')

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
    if (wallpaper.file && prefs?.id) {
      const fd = new FormData()
      wallpaper.appendToFormData(fd, values)
      pb.collection('userPreferences').update(prefs.id, fd)
        .then(() => {
          form.resetDirty()
          wallpaper.reset()
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
          wallpaper.reset()
          context.closeModal(id)
        },
      },
    )
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
                <GeneralTab form={form} pbAdminUrl={pbAdminUrl} />
              </Tabs.Panel>

              <Tabs.Panel value="sections">
                <SectionEditor
                  sections={form.values.sections}
                  onChange={(newSections) => form.setFieldValue('sections', newSections)}
                />
              </Tabs.Panel>

              <Tabs.Panel value="actionButtons">
                <ActionButtonEditor
                  buttons={(form.values as { actionButtons: ActionButton[] }).actionButtons}
                  onChange={(newButtons) => form.setFieldValue('actionButtons', newButtons)}
                />
              </Tabs.Panel>

              <Tabs.Panel value="interface">
                <InterfaceTab form={form} wallpaper={wallpaper} />
              </Tabs.Panel>

              <Tabs.Panel value="importexport">
                <ImportExportTab />
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
