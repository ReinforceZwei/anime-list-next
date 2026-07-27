import { useMemo } from 'react'
import { Anchor, Group, Stack, Switch, TextInput } from '@mantine/core'
import { IconExternalLink } from '@tabler/icons-react'
import type { UseFormReturnType } from '@mantine/form'
import type { UIConfig } from '@/types/anime'
import { pb } from '@/lib/pb'

interface GeneralTabProps {
  form: UseFormReturnType<{ uiConfig: UIConfig }>
}

export function GeneralTab({ form }: GeneralTabProps) {
  const pbAdminUrl = useMemo(() => {
    const base = pb.baseURL?.replace(/\/$/, '') || window.location.origin
    return `${base}/_/`
  }, [])
  return (
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
        {...form.getInputProps('uiConfig.showBuiltInActions', {
          type: 'checkbox',
        })}
      />
      <Anchor
        href={pbAdminUrl}
        size="sm"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Group gap="xs">
          <IconExternalLink size="1em" />
          前往 Pocketbase 控制台
        </Group>
      </Anchor>
    </Stack>
  )
}
