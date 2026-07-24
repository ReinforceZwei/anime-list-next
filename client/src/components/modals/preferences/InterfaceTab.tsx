import {
  Button,
  ColorInput,
  Divider,
  FileButton,
  Group,
  Image,
  SegmentedControl,
  Select,
  Stack,
  Text,
} from '@mantine/core'
import { IconMinus, IconPlus, IconUpload } from '@tabler/icons-react'
import type { UseFormReturnType } from '@mantine/form'
import type { UIConfig, SectionDef } from '@/types/anime'
import type { ActionButton } from '@/types/filter'
import { useUiScale } from '@/components/modals/preferences/useUiScale'
import type { useWallpaperUpload } from '@/components/modals/preferences/useWallpaperUpload'

interface InterfaceTabProps {
  form: UseFormReturnType<{
    uiConfig: UIConfig
    sections: SectionDef[]
    actionButtons: ActionButton[]
  }>
  wallpaper: ReturnType<typeof useWallpaperUpload>
}

export function InterfaceTab({ form, wallpaper }: InterfaceTabProps) {
  const { scale, decrement, increment, min, max } = useUiScale()

  return (
    <Stack>
      <Divider label="介面縮放" labelPosition="left" />
      <div>
        <Text size="sm" fw={500} mb={4}>
          縮放比例
        </Text>
        <Text size="xs" c="dimmed" mb="xs">
          僅限此裝置
        </Text>
        <Button.Group>
          <Button
            variant="default"
            disabled={scale <= min}
            onClick={decrement}
          >
            <IconMinus size="1em" />
          </Button>
          <Button.GroupSection variant="default" bg="var(--mantine-color-body)" miw={60} ta="center">
            {scale}%
          </Button.GroupSection>
          <Button
            variant="default"
            disabled={scale >= max}
            onClick={increment}
          >
            <IconPlus size="1em" />
          </Button>
        </Button.Group>
      </div>

      <Divider label="背景桌布" labelPosition="left" />

      <SegmentedControl
        data={[
          { label: '預設', value: 'default' },
          { label: '純色', value: 'color' },
          { label: '自訂圖片', value: 'image' },
        ]}
        {...form.getInputProps('uiConfig.wallpaper.type')}
      />

      {form.values.uiConfig.wallpaper?.type === 'color' && (
        <ColorInput
          label="背景顏色"
          placeholder="#1a1b2e"
          {...form.getInputProps('uiConfig.wallpaper.color')}
        />
      )}

      {form.values.uiConfig.wallpaper?.type === 'image' && (
        <>
          <div>
            <Text size="sm" fw={500} mb={4}>
              上傳圖片
            </Text>
            <Text size="xs" c="dimmed" mb="xs">
              支援 PNG、JPEG、WebP、TIFF、BMP（上限 5MB）
            </Text>
            <Group>
              <FileButton
                resetRef={wallpaper.resetRef}
                onChange={wallpaper.handleFileChange}
                accept={wallpaper.accept}
              >
                {(props) => (
                  <Button {...props} leftSection={<IconUpload size="1em" />} variant="default">
                    選擇圖片
                  </Button>
                )}
              </FileButton>
            </Group>
            {wallpaper.previewUrl && (
              <Image
                src={wallpaper.previewUrl}
                alt="桌布預覽"
                mt="sm"
                radius="md"
                fit="cover"
                h={120}
                style={{ border: '1px solid var(--mantine-color-default-border)' }}
              />
            )}
          </div>

          <Select
            label="background-position"
            placeholder="center"
            data={[
              { label: 'center', value: 'center' },
              { label: 'top', value: 'top' },
              { label: 'bottom', value: 'bottom' },
              { label: 'left', value: 'left' },
              { label: 'right', value: 'right' },
              { label: 'top left', value: 'top left' },
              { label: 'top right', value: 'top right' },
              { label: 'bottom left', value: 'bottom left' },
              { label: 'bottom right', value: 'bottom right' },
            ]}
            clearable
            {...form.getInputProps('uiConfig.wallpaper.position')}
          />

          <Select
            label="background-repeat"
            placeholder="no-repeat"
            data={[
              { label: 'no-repeat', value: 'no-repeat' },
              { label: 'repeat', value: 'repeat' },
              { label: 'repeat-x', value: 'repeat-x' },
              { label: 'repeat-y', value: 'repeat-y' },
            ]}
            clearable
            {...form.getInputProps('uiConfig.wallpaper.repeat')}
          />

          <Select
            label="background-size"
            placeholder="cover"
            data={[
              { label: 'cover', value: 'cover' },
              { label: 'contain', value: 'contain' },
              { label: 'auto', value: 'auto' },
              { label: '100% auto', value: '100% auto' },
            ]}
            clearable
            {...form.getInputProps('uiConfig.wallpaper.size')}
          />
        </>
      )}
    </Stack>
  )
}
