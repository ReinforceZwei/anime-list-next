import { useState } from 'react'
import { FloatingIndicator, UnstyledButton } from '@mantine/core'
import classes from './BackgroundPositionInput.module.css'

const POSITIONS = [
  ['top left', 'top', 'top right'],
  ['left', 'center', 'right'],
  ['bottom left', 'bottom', 'bottom right'],
] as const

interface BackgroundPositionInputProps {
  value?: string
  onChange?: (value: string) => void
  error?: React.ReactNode
  onFocus?: React.FocusEventHandler<HTMLButtonElement>
  onBlur?: React.FocusEventHandler<HTMLButtonElement>
}

export function BackgroundPositionInput({
  value,
  onChange,
}: BackgroundPositionInputProps) {
  const [rootRef, setRootRef] = useState<HTMLDivElement | null>(null)
  const [controlsRefs, setControlsRefs] = useState<
    Record<string, HTMLButtonElement | null>
  >({})
  const active = value || 'center'

  const setControlRef = (name: string) => (node: HTMLButtonElement | null) => {
    controlsRefs[name] = node
    setControlsRefs(controlsRefs)
  }

  return (
    <div className={classes.root} ref={setRootRef}>
      <FloatingIndicator
        target={controlsRefs[active]}
        parent={rootRef}
        className={classes.indicator}
      />

      {POSITIONS.map((row, i) => (
        <div className={classes.row} key={i}>
          {row.map((pos) => (
            <UnstyledButton
              key={pos}
              className={classes.control}
              ref={setControlRef(pos)}
              onClick={() => onChange?.(pos)}
              mod={{ active: active === pos }}
              title={pos}
            >
              <span className={classes.dot} data-pos={pos} />
            </UnstyledButton>
          ))}
        </div>
      ))}
    </div>
  )
}
