import { forwardRef } from 'react'
import { Text } from "@mantine/core"

const Subtitle = forwardRef<HTMLParagraphElement, { children: React.ReactNode }>(
  ({ children }, ref) => (
    <Text ref={ref} size="1.1rem" style={{ textAlign: 'center', padding: '1.3rem' }}>
      {children}
    </Text>
  )
)

export default Subtitle