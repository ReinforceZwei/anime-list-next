# Phase 4: Custom Action Buttons — Design & Implementation Plan

## Context

Phases 1–3 of the filter-builder are complete:

- **Phase 1**: `FilterExpression` types, `evaluateFilter()` engine, `<FilterBuilder>` component
- **Phase 2**: Global transient filter on the main list page (`FilterPopover` + `Affix` clear button)
- **Phase 3**: Customizable sections backed by `userPreferences.sections` (SectionEditor, new `useAnimeSections`)

Phase 4 adds **user-defined action buttons** on `InfoCard`. Each button specifies a **condition** (using the existing `FilterExpression`) and an **action** (a field mutation). When an `InfoCard` is open, buttons whose conditions match the current record render as clickable buttons. This unifies the filter engine with record mutations.

---

## Design Decisions

### 1. Three action types: `setField`, `addTag`, `removeTag`

| Action type | Use case | Payload |
|-------------|----------|---------|
| `setField` | Set a scalar field (status, downloadStatus, rating, comment, remark) | `field` + `value` |
| `addTag` | Add a single tag to the record's tags array (no-op if already present) | `tagId` |
| `removeTag` | Remove a single tag from the record's tags array (no-op if absent) | `tagId` |

`setField` covers status, downloadStatus, rating, comment, and remark. Tags get dedicated add/remove actions because replacing the entire tags array (`setField` on `tags`) is error-prone and rarely what the user wants.

### 2. Per-button options: confirmation & display style

| Option | Type | Default | Effect |
|--------|------|---------|--------|
| `askConfirmation` | `boolean` | `false` | Show a Mantine `Modal` before executing. Shows **what will be executed** (e.g. "將狀態設為「觀看中」"). |
| `showAsIcon` | `boolean` | `false` | Render as an `ActionIcon` with a `Tooltip` showing the label, instead of a `Button` with text. |

Both options are orthogonal — you can have an icon-only button that asks confirmation, or a text button that doesn't.

### 3. Pre-defined icon set

`@tabler/icons-react` does not support dynamic imports. We define a fixed set of ~36 icons in a static catalog. The icon selector shows a grid of icon buttons; the selected icon name is stored as a string in `ActionButton.icon`.

### 4. Terminology: "Button" (自訂按鈕) not "Rule" (規則)

- `ActionButton` (not `ActionRule`)
- `actionButtons` (not `actionRules`)
- `ActionButtonEditor` (not `ActionRuleEditor`)
- Similarly in server migration field name: `actionButtons`

### 5. Reuse `fieldRegistry.ts`

The existing `FIELD_REGISTRY` already has field metadata (label, type, select options). The action editor reuses it:

- **Field selector**: filter `FIELD_REGISTRY` to actionable fields only (`status`, `downloadStatus`, `rating`, `comment`, `remark`).
- **Value input**: dispatch on `fieldDef.type` — `Select` for `select` type, `NumberInput` for `number`, `Textarea` for `text`.
- **Action description** (`describeAction`): use `getFieldDef()` + the select option labels for human-readable Chinese text.

### 6. Auto-timestamp: server handles it

The server-side `applyStatusDateLogic` already auto-populates `startedAt` and `completedAt` when status changes (see `server/hooks/anime_records.go`). The client does **not** need to replicate this — remove the existing client-side logic from `AnimeCard.handleStatusChange()`.

### 7. Unified mutation callback in InfoCard

Instead of separate `onStatusChange` / `onDownloadStatusChange` callbacks, `InfoCardQuickActions` receives a single `onMutate(patch: Partial<AnimeRecord>)` callback. The parent (`AnimeCard`) handles the actual mutation and "jump to new section" behavior. Custom button clicks also go through this same callback, so they benefit from jumping too.

---

## Revised Type Definitions

All changes in `client/src/types/filter.ts` — replace the existing `ActionRule` / `ActionDef` stubs:

```typescript
import type { FilterExpression } from './filter'

// ---- Actionable fields (subset of filterable fields, excludes tags) ----

export type ActionableField =
  | 'status'
  | 'downloadStatus'
  | 'rating'
  | 'comment'
  | 'remark'

// ---- Action types ----

export interface SetFieldAction {
  type: 'setField'
  field: ActionableField
  value: string | number | null
}

export interface AddTagAction {
  type: 'addTag'
  tagId: string
}

export interface RemoveTagAction {
  type: 'removeTag'
  tagId: string
}

export type ActionDef = SetFieldAction | AddTagAction | RemoveTagAction

// ---- Action button (user-defined) ----

export interface ActionButton {
  id: string
  label: string                          // button text (or tooltip text when showAsIcon)
  icon?: string                          // icon name from ICON_OPTIONS; undefined = no icon
  condition: FilterExpression            // when this filter matches the record, show the button
  action: ActionDef
  askConfirmation?: boolean              // show confirm dialog before executing (default false)
  showAsIcon?: boolean                   // render as icon-only with tooltip (default false)
}

// ---- Helper ----

export function createEmptyActionButton(): ActionButton {
  return {
    id: generateId(),
    label: '新按鈕',
    condition: createEmptyFilter(),
    action: { type: 'setField', field: 'status', value: 'watching' },
  }
}
```

---

## Icon Catalog

```typescript
// File: client/src/components/ActionButtonEditor/iconCatalog.ts

import {
  IconPlayerPlay,
  IconPlayerTrackNext,
  IconPlayerTrackPrev,
  IconCheck,
  IconCircleCheck,
  IconCircleX,
  IconBan,
  IconCalendar,
  IconCalendarPlus,
  IconCalendarCheck,
  IconDownload,
  IconCloudDownload,
  IconStar,
  IconStarFilled,
  IconHeart,
  IconHeartFilled,
  IconBookmark,
  IconBookmarkFilled,
  IconTag,
  IconTags,
  IconEye,
  IconEyeOff,
  IconPencil,
  IconEdit,
  IconTrash,
  IconArchive,
  IconArchiveOff,
  IconBell,
  IconBellRinging,
  IconFlag,
  IconFlagFilled,
  IconPin,
  IconPinned,
  IconSend,
  IconRefresh,
  IconClock,
  IconHourglass,
} from '@tabler/icons-react'
import type { ComponentType } from 'react'

export interface IconOption {
  name: string       // stored in ActionButton.icon
  label: string      // shown in tooltip / selector
  component: ComponentType<{ size?: number | string }>
}

export const ICON_OPTIONS: IconOption[] = [
  { name: 'IconPlayerPlay',      label: '播放',     component: IconPlayerPlay },
  { name: 'IconPlayerTrackNext', label: '下一項',   component: IconPlayerTrackNext },
  { name: 'IconPlayerTrackPrev', label: '前一項',   component: IconPlayerTrackPrev },
  { name: 'IconCheck',           label: '勾選',     component: IconCheck },
  { name: 'IconCircleCheck',     label: '圓圈勾',   component: IconCircleCheck },
  { name: 'IconCircleX',         label: '圓圈叉',   component: IconCircleX },
  { name: 'IconBan',             label: '禁止',     component: IconBan },
  { name: 'IconCalendar',        label: '日曆',     component: IconCalendar },
  { name: 'IconCalendarPlus',    label: '加入日曆', component: IconCalendarPlus },
  { name: 'IconCalendarCheck',   label: '日曆勾',   component: IconCalendarCheck },
  { name: 'IconDownload',        label: '下載',     component: IconDownload },
  { name: 'IconCloudDownload',   label: '雲端下載', component: IconCloudDownload },
  { name: 'IconStar',            label: '星星',     component: IconStar },
  { name: 'IconStarFilled',      label: '實心星',   component: IconStarFilled },
  { name: 'IconHeart',           label: '愛心',     component: IconHeart },
  { name: 'IconHeartFilled',     label: '實心愛心', component: IconHeartFilled },
  { name: 'IconBookmark',        label: '書籤',     component: IconBookmark },
  { name: 'IconBookmarkFilled',  label: '實心書籤', component: IconBookmarkFilled },
  { name: 'IconTag',             label: '標籤',     component: IconTag },
  { name: 'IconTags',            label: '多標籤',   component: IconTags },
  { name: 'IconEye',             label: '可見',     component: IconEye },
  { name: 'IconEyeOff',          label: '隱藏',     component: IconEyeOff },
  { name: 'IconPencil',          label: '鉛筆',     component: IconPencil },
  { name: 'IconEdit',            label: '編輯',     component: IconEdit },
  { name: 'IconTrash',           label: '刪除',     component: IconTrash },
  { name: 'IconArchive',         label: '封存',     component: IconArchive },
  { name: 'IconArchiveOff',      label: '取消封存', component: IconArchiveOff },
  { name: 'IconBell',            label: '通知',     component: IconBell },
  { name: 'IconBellRinging',     label: '通知中',   component: IconBellRinging },
  { name: 'IconFlag',            label: '旗標',     component: IconFlag },
  { name: 'IconFlagFilled',      label: '實心旗標', component: IconFlagFilled },
  { name: 'IconPin',             label: '圖釘',     component: IconPin },
  { name: 'IconPinned',          label: '已固定',   component: IconPinned },
  { name: 'IconSend',            label: '傳送',     component: IconSend },
  { name: 'IconRefresh',         label: '重新整理', component: IconRefresh },
  { name: 'IconClock',           label: '時鐘',     component: IconClock },
  { name: 'IconHourglass',       label: '沙漏',     component: IconHourglass },
]

export function getIconComponent(name: string | undefined): ComponentType<{ size?: number | string }> | null {
  if (!name) return null
  return ICON_OPTIONS.find(o => o.name === name)?.component ?? null
}
```

---

## Action Executor & Describer

Two pure functions — apply the action to a record, and produce a human-readable description for the confirmation dialog.

```typescript
// File: client/src/lib/actionExecutor.ts

import type { AnimeRecord } from '@/types/anime'
import type { ActionDef } from '@/types/filter'

/**
 * Apply an action to a record, returning a partial patch.
 * Does NOT mutate the record — the caller merges and sends the update.
 */
export function applyAction(record: AnimeRecord, action: ActionDef): Partial<AnimeRecord> {
  switch (action.type) {
    case 'setField':
      return { [action.field]: action.value }

    case 'addTag': {
      const current = record.tags ?? []
      if (current.includes(action.tagId)) return {}  // no-op
      return { tags: [...current, action.tagId] }
    }

    case 'removeTag': {
      const current = record.tags ?? []
      if (!current.includes(action.tagId)) return {}  // no-op
      return { tags: current.filter(id => id !== action.tagId) }
    }

    default:
      return {}
  }
}
```

```typescript
// File: client/src/lib/actionDescribe.ts

import type { ActionDef } from '@/types/filter'
import { getFieldDef } from '@/lib/fieldRegistry'

/**
 * Returns a human-readable Chinese description of what an action will do.
 * Used in the confirmation dialog and the editor summary.
 *
 * @param tagNameMap optional Map<tagId, tagName> for resolving tag IDs to names.
 *                   When omitted, tag IDs are shown as-is.
 */
export function describeAction(action: ActionDef, tagNameMap?: Map<string, string>): string {
  switch (action.type) {
    case 'setField': {
      const def = getFieldDef(action.field)
      const fieldLabel = def?.label ?? action.field
      // For select fields, show the option label, not the raw value
      if (def?.options) {
        const opt = def.options.find(o => o.value === String(action.value))
        return `將${fieldLabel}設為「${opt?.label ?? action.value}」`
      }
      return `將${fieldLabel}設為「${action.value}」`
    }

    case 'addTag': {
      const tagName = tagNameMap?.get(action.tagId) ?? action.tagId
      return `加入標籤「${tagName}」`
    }

    case 'removeTag': {
      const tagName = tagNameMap?.get(action.tagId) ?? action.tagId
      return `移除標籤「${tagName}」`
    }

    default:
      return '未知動作'
  }
}
```

---

## Button Editor UI (`<ActionButtonEditor>`)

### Where

New tab in `PreferencesModal`:

```
一般 | 區塊 | 自訂按鈕 | 介面 | 匯入／匯出
```

Tab icon: `IconClick` or `IconPointer` from `@tabler/icons-react`.

### Component

```typescript
// File: client/src/components/modals/ActionButtonEditor.tsx

interface ActionButtonEditorProps {
  buttons: ActionButton[]
  onChange: (buttons: ActionButton[]) => void
}
```

### Layout (per button, collapsed)

```
┌─────────────────────────────────────────────┐
│  [⇧] [⇩]  ▸ 新按鈕  [icon preview]  [🗑]  │
│            篩選條件摘要...                   │
└─────────────────────────────────────────────┘
```

### Layout (per button, expanded)

```
┌─────────────────────────────────────────────┐
│  [⇧] [⇩]  ▾ 新按鈕  [icon preview]  [🗑]  │
├─────────────────────────────────────────────┤
│  按鈕文字: [________________]               │
│                                             │
│  圖示: [🔽 pick from icon grid]  [✕ 清除]  │
│        ┌─────┬─────┬─────┬─────┐           │
│        │ ▶️  │ ✅  │ 📅  │ ⭐  │  ...      │
│        └─────┴─────┴─────┴─────┘           │
│                                             │
│  觸發條件: [🔽 FilterBuilder popover]       │
│        摘要: "狀態 在 [觀看中] 且 評分 ≥ 7" │
│                                             │
│  動作類型: [🔽 setField / addTag / removeTag] │
│                                             │
│  ── setField 模式 ──                        │
│  欄位: [🔽 狀態 ▾]                          │
│  值:   [🔽 觀看中 ▾]  (adapts to field type) │
│                                             │
│  ── addTag / removeTag 模式 ──              │
│  標籤: [🔽 TagMultiSelect (single)]         │
│                                             │
│  ☐ 執行前確認    ☐ 僅顯示圖示              │
└─────────────────────────────────────────────┘
```

### Expand/collapse behavior

- Only one button expanded at a time (accordion pattern, tracked via `expandedId` state).
- The collapsed row shows: up/down arrows, label, icon preview, `describeFilter(button.condition)` summary, and delete button.
- Click the row (excluding buttons) or a chevron to expand/collapse.

### Reordering

Same pattern as `SectionEditor` — up/down `ActionIcon` buttons using a shared `moveItem<T>()` utility:

```typescript
// Extract to client/src/lib/arrayUtils.ts (shared with SectionEditor)
export function moveItem<T>(arr: T[], from: number, to: number): T[] {
  const next = [...arr]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}
```

### Field selector (setField mode)

Filters `FIELD_REGISTRY` to only actionable fields:

```typescript
const ACTIONABLE_FIELDS: FilterableField[] = ['status', 'downloadStatus', 'rating', 'comment', 'remark']

const fieldOptions = FIELD_REGISTRY
  .filter(f => (ACTIONABLE_FIELDS as string[]).includes(f.field))
  .map(f => ({ value: f.field, label: f.label }))
```

### Value input (setField mode)

Dispatches on `fieldDef.type` from `FIELD_REGISTRY`:

| Field | `fieldDef.type` | Value Component | Props |
|-------|-----------------|-----------------|-------|
| `status` | `select` | `Select` | `data={fieldDef.options}` |
| `downloadStatus` | `select` | `Select` | `data={fieldDef.options}` |
| `rating` | `number` | `NumberInput` | `min=0, max=10, step=1` |
| `comment` | `text` | `Textarea` | `autosize, minRows=2` |
| `remark` | `text` | `Textarea` | `autosize, minRows=2` |

Since `FIELD_REGISTRY` already has `options` for select fields and `type` for all fields, the value input is a simple switch on `fieldDef.type` — no hardcoded per-field map needed.

### Tag selector (addTag / removeTag mode)

Uses the existing `TagMultiSelect` component configured for single selection. The selected tag's ID is stored in `action.tagId`.

### Icon Picker

A `Popover` containing a grid of `ActionIcon` buttons. The currently selected icon is highlighted with `variant="filled"`. Clicking one sets `button.icon`. A "清除" button resets to `undefined`.

### Filter Summary

Reuse `describeFilter()` from `filterDescribe.ts` for the collapsed-row summary and inline in the expanded view.

### Action description summary

When expanded, show `describeAction(button.action)` so the user can preview what the button does (without tag name resolution — raw IDs are fine in the editor).

---

## Server Migration

Add an `actionButtons` JSON field to the `userPreferences` collection.

**Note**: new field is already created via admin UI by user.

### Migration file

`server\migrations\1779349765_updated_userPreferences.go`

### TypeScript type update

Extend `UserPreferencesRecord` in `client/src/types/anime.ts`:

```typescript
import type { ActionButton } from './filter'

export interface UserPreferencesRecord extends RecordModel {
  userId: string
  pageTitle?: string
  sections?: SectionDef[] | null
  actionButtons?: ActionButton[] | null    // NEW
}
```

---

## Integration: `AnimeCard` → `InfoCardQuickActions`

### Current state

`AnimeCard` passes `onStatusChange` and `onDownloadStatusChange` to `InfoCard.QuickActions`. It contains `handleStatusChange()` which manually sets `startedAt`/`completedAt` timestamps before calling `updateMutation.mutate()`.

### Target state

**`AnimeCard` changes:**

1. Remove `handleStatusChange()` and `handleDownloadStatusChange()`.
2. Replace with a single `handleMutate(patch: Partial<AnimeRecord>)` function that:
   - Calls `updateMutation.mutate({ ...anime, ...patch })`
   - On success, triggers `onJumpTo?.(record.id)` (same `setTimeout` pattern as before).
3. Pass `handleMutate` to `InfoCard.QuickActions`.
4. Remove auto-timestamp logic (server handles it).

```typescript
function handleMutate(patch: Partial<AnimeRecord>) {
  if (!anime) return
  updateMutation.mutate(
    { ...anime, ...patch },
    { onSuccess: (record) => setTimeout(() => onJumpTo?.(record.id), 1000) },
  )
}
```

**`InfoCardQuickActions` props change:**

```typescript
// Before:
interface InfoCardQuickActionsProps {
  onStatusChange?: (targetStatus: Status) => void
  onDownloadStatusChange?: (targetDownloadStatus: DownloadStatus) => void
}

// After:
interface InfoCardQuickActionsProps {
  onMutate?: (patch: Partial<AnimeRecord>) => void
}
```

**`InfoCardQuickActions` implementation:**

```typescript
export default function InfoCardQuickActions({ onMutate }: InfoCardQuickActionsProps) {
  const { anime, loading } = useInfoCard()
  const { data: prefs } = useUserPreferences()
  const tagMap = useTagMap()
  const [confirmingButton, setConfirmingButton] = useState<ActionButton | null>(null)

  if (loading) {
    return (
      <div className={styles.quickActionsBar}>
        <Skeleton height={32} width={120} />
      </div>
    )
  }

  // --- Built-in default actions (unchanged logic, but routed through onMutate) ---
  const defaultActions = getDefaultActions(anime?.status, anime?.downloadStatus)

  // --- Custom user buttons ---
  const buttons = prefs?.actionButtons ?? []

  const matchedButtons = anime
    ? buttons.filter(b => b.condition.conditions.length > 0 && evaluateFilter(b.condition, anime))
    : []

  function handleButtonClick(button: ActionButton) {
    if (!anime) return
    if (button.askConfirmation) {
      setConfirmingButton(button)
      return
    }
    const patch = applyAction(anime, button.action)
    if (Object.keys(patch).length > 0) onMutate?.(patch)
  }

  function handleConfirm() {
    if (!confirmingButton || !anime) return
    const patch = applyAction(anime, confirmingButton.action)
    if (Object.keys(patch).length > 0) onMutate?.(patch)
    setConfirmingButton(null)
  }

  if (!defaultActions.length && matchedButtons.length === 0) return null

  return (
    <div className={styles.quickActionsBar}>
      <Group gap="xs">
        {/* Built-in defaults (refactored to use onMutate) */}
        {defaultActions.map(action => (
          <Button
            key={action.label}
            size="xs"
            variant="filled"
            color={action.color}
            leftSection={action.icon}
            onClick={() => onMutate?.(action.patch)}
          >
            {action.label}
          </Button>
        ))}

        {/* Custom user buttons */}
        {matchedButtons.map(button => {
          const IconComp = getIconComponent(button.icon)
          if (button.showAsIcon) {
            return (
              <Tooltip key={button.id} label={button.label}>
                <ActionIcon
                  variant="filled"
                  color="gray"
                  size="md"
                  onClick={() => handleButtonClick(button)}
                >
                  {IconComp ? <IconComp size="1em" /> : button.label.slice(0, 1)}
                </ActionIcon>
              </Tooltip>
            )
          }
          return (
            <Button
              key={button.id}
              size="xs"
              variant="filled"
              color="gray"
              leftSection={IconComp ? <IconComp size="1em" /> : undefined}
              onClick={() => handleButtonClick(button)}
            >
              {button.label}
            </Button>
          )
        })}
      </Group>

      {/* Confirmation modal — shows what will be executed */}
      <Modal
        opened={confirmingButton !== null}
        onClose={() => setConfirmingButton(null)}
        title="確認執行"
        size="sm"
      >
        <Stack gap="sm">
          <Text>確定要執行「{confirmingButton?.label}」嗎？</Text>
          {confirmingButton && (
            <Text size="sm" c="dimmed">
              {describeAction(confirmingButton.action, tagMap)}
            </Text>
          )}
        </Stack>
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={() => setConfirmingButton(null)}>取消</Button>
          <Button onClick={handleConfirm}>確認</Button>
        </Group>
      </Modal>
    </div>
  )
}
```

### Refactored `getDefaultActions`

Since default actions now go through `onMutate`, change `QuickAction` to carry a `patch` instead of `targetStatus` / `targetDownloadStatus`:

```typescript
interface QuickAction {
  label: string
  icon: React.ReactNode
  color: string
  patch: Partial<AnimeRecord>
}

function getDefaultActions(
  status: Status | undefined | '',
  downloadStatus: DownloadStatus | undefined | '',
): QuickAction[] {
  const actions: QuickAction[] = []

  if (status === 'planned') {
    actions.push({ label: '開始觀看', icon: <IconPlayerPlay size="1em" />, color: 'blue', patch: { status: 'watching' } })
  }
  if (status === 'watching') {
    actions.push({ label: '標記為已看完', icon: <IconCheck size="1em" />, color: 'teal', patch: { status: 'completed' } })
  }
  if (!status) {
    actions.push({ label: '列入待看', icon: <IconCalendar size="1em" />, color: 'gray', patch: { status: 'planned' } })
  }

  if (downloadStatus === 'pending') {
    actions.push({ label: '開始下載', icon: <IconDownload size="1em" />, color: 'orange', patch: { downloadStatus: 'downloading' } })
  }
  if (downloadStatus === 'downloading') {
    actions.push({ label: '標記為已下載', icon: <IconCheck size="1em" />, color: 'green', patch: { downloadStatus: 'downloaded' } })
  }

  return actions
}
```

---

## Implementation Order

### Step 1: Update types

- Replace `ActionRule` / `ActionDef` stubs in `client/src/types/filter.ts` with `ActionButton`, `ActionDef` (union), `SetFieldAction`, `AddTagAction`, `RemoveTagAction`, `ActionableField`.
- Export `createEmptyActionButton()` helper.

### Step 2: Build icon catalog

- Create `client/src/components/ActionButtonEditor/iconCatalog.ts` with `ICON_OPTIONS` and `getIconComponent()`.

### Step 3: Implement `applyAction()` and `describeAction()`

- Create `client/src/lib/actionExecutor.ts` (applyAction + describeAction).

### Step 4: Refactor `AnimeCard` + `InfoCardQuickActions`

- Replace `handleStatusChange`/`handleDownloadStatusChange` with `handleMutate(patch)` in `AnimeCard.tsx`.
- Remove auto-timestamp logic from `AnimeCard` (server handles it).
- Replace `onStatusChange`/`onDownloadStatusChange` props with `onMutate` in `InfoCardQuickActions`.
- Refactor `getDefaultActions` to use `patch` instead of `targetStatus`/`targetDownloadStatus`.
- Wire custom buttons: evaluate `actionButtons` via `evaluateFilter()`, render matches, handle confirmation dialog.

### Step 5: Build `<ActionButtonEditor>`

- Create `client/src/components/modals/ActionButtonEditor.tsx`.
- Expandable accordion list with up/down reorder (extract `moveItem` to `client/src/lib/arrayUtils.ts`, also update `SectionEditor` to import from there).
- Each button: label input, icon picker (Popover grid), FilterBuilder (in Popover), action type selector, field/value inputs (reusing `FIELD_REGISTRY`), confirmation/icon-only toggles, delete button.
- Uses `describeAction()` and `describeFilter()` for summaries.

### Step 6: Server migration

- Update `UserPreferencesRecord` type in `client/src/types/anime.ts`.

### Step 7: Wire into PreferencesModal

- Add tab `自訂按鈕` with `IconClick` (or similar).
- Add `actionButtons` to form state (initialValues + `form.getInputProps` pattern like `sections`).
- Render `<ActionButtonEditor>` in the tab panel.
- Ensure `form.isDirty()` detects changes to `actionButtons` (the editor calls `onChange` → `form.setFieldValue`).

### Step 8: Manual verification

- Create a button: "when status is watching AND rating ≥ 7, set comment to '神作'".
- Create a button: "add tag '最愛'" (addTag).
- Create a button: "remove tag '待整理'" (removeTag).
- Verify they appear only on matching records.
- Verify confirmation dialog shows action description (e.g. "將心得設為「神作」").
- Verify icon-only mode with tooltip.
- Verify built-in defaults still work (now via `onMutate`).
- Verify jumping after custom button mutation.
- Verify addTag/removeTag correctly mutate the tags array (add once, remove once).
- Verify no regressions in section filtering or global filter.

---

## File Map (New & Changed)

```
client/src/
  types/
    filter.ts                           ← MODIFY: replace ActionRule/ActionDef stubs with ActionButton/ActionDef
    anime.ts                            ← MODIFY: add actionButtons to UserPreferencesRecord
  lib/
    actionExecutor.ts                   ← NEW: applyAction() + describeAction()
    arrayUtils.ts                       ← NEW: moveItem() (extracted from SectionEditor)
  components/
    ActionButtonEditor/
      ActionButtonEditor.tsx            ← NEW: button list editor (expandable accordion, reorderable)
      iconCatalog.ts                    ← NEW: ICON_OPTIONS + getIconComponent()
    InfoCard/
      InfoCardQuickActions.tsx          ← MODIFY: onMutate prop, evaluate custom buttons, confirmation dialog
      AnimeCard.tsx                     ← MODIFY: single handleMutate(), remove auto-timestamp logic
    modals/
      PreferencesModal.tsx              ← MODIFY: add "自訂按鈕" tab
      SectionEditor.tsx                 ← MODIFY: import moveItem from arrayUtils.ts
server/
  migrations/
    NNN_updated_userPreferences.go      ← NEW: add actionButtons JSON field
```

No changes to:
- `FilterBuilder` (reused as-is)
- `filterEngine.ts` (reused as-is)
- `filterDescribe.ts` (reused as-is)
- `fieldRegistry.ts` (reused as-is for field metadata)
- `useAnimeMutation.ts` (reused as-is)
- `useAnimeSections.ts` / `sectionBuilder.ts`
- Routes / main page

---

## Open Decisions

1. **Default action migration**: Keep built-in status-transition buttons as hardcoded fallbacks. They always make sense contextually and don't need to compete with user-defined buttons for space.

2. **Extract `moveItem` utility**: Both `SectionEditor` and `ActionButtonEditor` need drag-to-reorder. Extract to `client/src/lib/arrayUtils.ts` so it's shared rather than duplicated.

3. **Tag name resolution for `describeAction`**: In the confirmation dialog inside `InfoCardQuickActions`, we have `useTagMap()` so we can resolve tag IDs to names. In `ActionButtonEditor`, we show raw tag IDs (acceptable for the editor summary). The `describeAction()` function accepts an optional `tagNameMap` parameter.

4. **`actionButtons` field on new users**: When a user has no preferences record, `prefs?.actionButtons` is `undefined`. The editor treats `undefined` and `[]` identically (empty list). The `PreferencesModal` form defaults `actionButtons` to `[]`.

5. **addTag/removeTag with deleted tags**: If a tag is deleted from the user's tag collection, an action referencing that tag ID becomes a no-op (the tag doesn't exist on any record). This is acceptable — no cleanup needed.

6. **Multiple buttons with same condition**: If two buttons match the same record and both are set to `showAsIcon`, they render as adjacent `ActionIcon`s. No dedup or grouping needed for MVP.

