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
import { BackgroundPositionInput } from '@/components/BackgroundPositionInput/BackgroundPositionInput'
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

          <div>
            <Text size="sm" fw={500} mb={4}>
              圖片位置
            </Text>
            <BackgroundPositionInput
              {...form.getInputProps('uiConfig.wallpaper.position')}
            />
          </div>

          <Select
            label="圖片重複"
            placeholder="選擇圖片重複"
            data={[
              { label: '不重複', value: 'no-repeat' },
              { label: '重複', value: 'repeat' },
              { label: '橫向重複', value: 'repeat-x' },
              { label: '垂直重複', value: 'repeat-y' },
            ]}
            clearable
            {...form.getInputProps('uiConfig.wallpaper.repeat')}
          />

          <Select
            label="圖片大小"
            placeholder="選擇圖片大小"
            data={[
              { label: '填滿 (Cover)', value: 'cover' },
              { label: '完整顯示 (Contain)', value: 'contain' },
              { label: '原始大小 (Auto)', value: 'auto' },
              { label: '符合寬度 (100% Auto)', value: '100% auto' },
            ]}
            clearable
            {...form.getInputProps('uiConfig.wallpaper.size')}
          />
        </>
      )}
    </Stack>
  )
}
