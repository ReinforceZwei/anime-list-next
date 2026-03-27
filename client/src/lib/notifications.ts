import { notifications } from '@mantine/notifications'
import { ClientResponseError } from 'pocketbase'

export function showErrorNotification(err: unknown) {
  const message = err instanceof Error ? err.message : '發生未知錯誤'
  console.error('[showErrorNotification]', err)
  if (err instanceof ClientResponseError) {
    console.debug('[showErrorNotification] ClientResponseError', err.toJSON())
  }
    
  notifications.show({
    color: 'red',
    title: '操作失敗',
    message,
  })
}
