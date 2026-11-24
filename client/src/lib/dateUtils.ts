import dayjs from 'dayjs'

export function formatDateTime(iso: string): string {
  const d = dayjs(iso)
  return d.isValid() ? d.format('YYYY年M月D日 HH:mm') : iso
}

export function formatDate(iso: string): string {
  const d = dayjs(iso)
  return d.isValid() ? d.format('YYYY-MM-DD') : iso
}
