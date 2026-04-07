import { ActionIcon, NumberInput, Rating, Stack, type NumberInputHandlers, type NumberInputProps } from '@mantine/core'
import { IconMinus, IconPlus } from '@tabler/icons-react'
import { useRef } from 'react'

type RatingInputProps = Omit<NumberInputProps, 'leftSection' | 'rightSection' | 'hideControls' | 'handlersRef'>

export function RatingInput({
  label = '評分（0-5）',
  placeholder = '0 – 5',
  min = 0,
  max = 5,
  step = 0.1,
  decimalScale = 1,
  clampBehavior = 'strict',
  size,
  ...props
}: RatingInputProps) {
  const handlersRef = useRef<NumberInputHandlers>(null)
  const numValue = typeof props.value === 'number' ? props.value : 0

  return (
    <Stack gap={4}>
      <NumberInput
        label={label}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        decimalScale={decimalScale}
        clampBehavior={clampBehavior}
        size={size}
        hideControls
        handlersRef={handlersRef}
        leftSection={
          <ActionIcon
            variant="subtle"
            size="sm"
            disabled={numValue <= (min as number)}
            onClick={() => handlersRef.current?.decrement()}
          >
            <IconMinus size="1em" />
          </ActionIcon>
        }
        rightSection={
          <ActionIcon
            variant="subtle"
            size="sm"
            disabled={numValue >= (max as number)}
            onClick={() => handlersRef.current?.increment()}
          >
            <IconPlus size="1em" />
          </ActionIcon>
        }
        {...props}
      />
      <Rating
        value={numValue}
        fractions={2}
        size={size ?? 'sm'}
        onChange={(val) => props.onChange?.(val)}
      />
    </Stack>
  )
}
