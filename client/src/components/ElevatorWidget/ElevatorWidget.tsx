import { ActionIcon, Paper, Stack } from '@mantine/core'
import { IconChevronUp, IconChevronDown } from '@tabler/icons-react'
import classes from './ElevatorWidget.module.css'

interface ElevatorWidgetProps {
  markerRefs: (HTMLParagraphElement | null)[]
}

function isInViewport(rect: DOMRect): boolean {
  return rect.bottom > 0 && rect.top < window.innerHeight
}

function elevatorUp(refs: (HTMLParagraphElement | null)[]) {
  for (let i = refs.length - 1; i >= 0; i--) {
    const el = refs[i]
    if (!el) continue
    const rect = el.getBoundingClientRect()
    if (!isInViewport(rect) && rect.top < 0) {
      el.scrollIntoView({ behavior: 'smooth' })
      break
    }
  }
}

function elevatorDown(refs: (HTMLParagraphElement | null)[]) {
  for (let i = 0; i < refs.length; i++) {
    const el = refs[i]
    if (!el) continue
    const rect = el.getBoundingClientRect()
    if (!isInViewport(rect) && rect.top > window.innerHeight) {
      el.scrollIntoView({ behavior: 'smooth' })
      break
    }
  }
}

export default function ElevatorWidget({ markerRefs }: ElevatorWidgetProps) {
  // if (markerRefs.filter(Boolean).length === 0) return null

  return (
    <Paper shadow="sm" className={classes.container}>
      <Stack gap={2}>
        <ActionIcon
          variant="transparent"
          color="gray"
          size="sm"
          onClick={() => elevatorUp(markerRefs)}
          aria-label="Scroll to previous section"
        >
          <IconChevronUp size={16} />
        </ActionIcon>
        <ActionIcon
          variant="transparent"
          color="gray"
          size="sm"
          onClick={() => elevatorDown(markerRefs)}
          aria-label="Scroll to next section"
        >
          <IconChevronDown size={16} />
        </ActionIcon>
      </Stack>
    </Paper>
  )
}
