import { Text } from "@mantine/core"

export default function Subtitle({ children }: { children: React.ReactNode }) {
  return (
    <Text size="1.1rem" style={{ textAlign: 'center', padding: '1.3rem' }}>{children}</Text>
  )
}