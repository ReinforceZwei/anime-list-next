import { Text } from "@mantine/core"

export default function Title({ children }: { children: React.ReactNode }) {
  return (
    <Text size="3rem" style={{ textAlign: 'center' }}>{children}</Text>
  )
}