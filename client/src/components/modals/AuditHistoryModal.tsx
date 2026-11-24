import { useState } from 'react'
import { Group, Modal, ScrollArea, SegmentedControl, Stack } from '@mantine/core'
import type { ContextModalProps } from '@/lib/modalStack'
import { AuditLogTimeline } from '@/components/AuditLogTimeline/AuditLogTimeline'
import type { AuditAction } from '@/types/auditLog'

export interface AuditHistoryModalProps {
  collection?: string
  recordId?: string
}

export function AuditHistoryModal({
  title,
  innerProps,
  modalProps,
}: ContextModalProps<AuditHistoryModalProps & Record<string, unknown>>) {
  const isScoped = Boolean(innerProps.recordId)
  const [collectionFilter, setCollectionFilter] = useState<string>(
    innerProps.collection ?? '',
  )
  const [actionFilter, setActionFilter] = useState<AuditAction | ''>('')
  const [page, setPage] = useState(1)

  function handleCollectionChange(val: string) {
    setCollectionFilter(val)
    setPage(1)
  }

  function handleActionChange(val: string) {
    setActionFilter(val as AuditAction | '')
    setPage(1)
  }

  return (
    <Modal title={title ?? '編輯紀錄'} size="lg" {...modalProps}>
      <Stack gap="md">
        {!isScoped && (
          <Group justify="space-between" wrap="wrap" gap="xs">
            <SegmentedControl
              size="xs"
              value={collectionFilter}
              onChange={handleCollectionChange}
              data={[
                { label: '全部', value: '' },
                { label: '動畫', value: 'animes' },
                { label: '標籤', value: 'tags' },
              ]}
            />
            <SegmentedControl
              size="xs"
              value={actionFilter}
              onChange={handleActionChange}
              data={[
                { label: '全部動作', value: '' },
                { label: '新增', value: 'CREATE' },
                { label: '編輯', value: 'UPDATE' },
                { label: '刪除', value: 'DELETE' },
              ]}
            />
          </Group>
        )}

        <ScrollArea.Autosize mah="65vh" offsetScrollbars>
          <AuditLogTimeline
            collection={isScoped ? innerProps.collection : collectionFilter || undefined}
            recordId={innerProps.recordId}
            action={actionFilter}
            page={page}
            onPageChange={setPage}
            showRecordTitle={!isScoped}
          />
        </ScrollArea.Autosize>
      </Stack>
    </Modal>
  )
}
