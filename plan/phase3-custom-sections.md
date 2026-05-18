# Phase 3: Custom Sections (#28) — Implementation Plan

## Strategy: Option A — First-Match Wins + "Other" Catch-All

User-defined sections are evaluated **in order**. A record lands in the
**first** section whose filter it matches. An automatic **「未分類」** (Other)
section is always appended at the bottom with no filter — it catches every
record that no section above claimed.

| Property | Guarantee |
|----------|-----------|
| No duplicates | Each record appears at most once (first-match) |
| No orphans | "Other" catch-all catches unclaimed records |
| User control | Reorder sections to change priority |

---

## Breaking Change: Full Replacement of `SectionDef`

The old status-based `SectionDef` (with `statuses[]`) is **deleted entirely**.
No backward compatibility shim. The new filter-based `SectionDef` replaces it.

The legacy `*Label` fields (`watchingLabel`, `completedLabel`, `plannedLabel`,
`droppedLabel`) on `UserPreferencesRecord` are also **removed**. Section labels
now live directly on each `SectionDef.label`.

### User-visible impact: zero (defaults reproduce the same list)

The default sections are defined using `FilterExpression` with
`{ field: 'status', operator: 'in', value: [...] }`, producing the exact same
4-section layout. Existing users see **no change** on upgrade. If a user had
custom labels via the old `*Label` fields, those labels are **lost** — the
defaults revert to the built-in Chinese labels. This is acceptable because the
new section editor provides a direct label override per section.

---

## Step-by-step Tasks

### Step 1: Replace `SectionDef` type — delete old, move new to `types/anime.ts`

**Changes in `types/filter.ts`:**
- Delete `SectionDefV2`, `SortableField`, `ActionRule`, `ActionDef`
  (these don't belong in the filter types file — they are domain models)

**Changes in `types/anime.ts`:**
- Delete the old `SectionDef` (with `statuses[]`)
- Define the new `SectionDef` (filter-based) here:

```typescript
import type { FilterExpression } from './filter'

export type SortableField = 'completedAt' | 'startedAt' | 'updated' | 'created' | 'rating'

export interface SectionDef {
  key: string
  label: string
  filter: FilterExpression | null   // null = match all records
  sortBy: SortableField
  sortOrder: 'asc' | 'desc'
}
```

- Remove `watchingLabel`, `completedLabel`, `plannedLabel`, `droppedLabel`
  from `UserPreferencesRecord`:

```typescript
export interface UserPreferencesRecord extends RecordModel {
  userId: string
  pageTitle?: string
  // OLD (removed): watchingLabel, completedLabel, plannedLabel, droppedLabel
  sections?: SectionDef[] | null   // null/empty = use built-in defaults
}
```

- Re-export `ActionRule`/`ActionDef` from `types/filter.ts` or move them too
  (leave in `types/filter.ts` for now — they're used in Phase 4, not Phase 3)

---

### Step 2: Server migration — add `sections`, remove `*Label` fields

**New file:** `server/migrations/1777000000_updated_userPreferences.go`

This migration:
1. Adds a new JSON field `sections` (nullable, default `null`)
2. Deletes the four legacy `*Label` text fields

```go
package migrations

import (
    "github.com/pocketbase/pocketbase/core"
    m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
    m.Register(func(app core.App) error {
        collection, err := app.FindCollectionByNameOrId("userPreferences")
        if err != nil {
            return err
        }

        // Add sections JSON field
        collection.Fields.Add(&core.JSONField{
            Name:     "sections",
            Required: false,
        })

        // Remove legacy label fields
        // (PocketBase removes them by field name)
        fieldsToRemove := []string{"watchingLabel", "completedLabel", "plannedLabel", "droppedLabel"}
        for _, name := range fieldsToRemove {
            f := collection.Fields.GetByName(name)
            if f != nil {
                collection.Fields.RemoveByName(name)
            }
        }

        return app.Save(collection)
    }, func(app core.App) error {
        // Rollback: not needed for forward-only migrations
        return nil
    })
}
```

> **Note:** PocketBase migrations that remove fields will drop the column
> data. Any existing custom labels in those fields will be lost. This is the
> intended trade-off — users will set section labels in the new editor.

---

### Step 3: Define default sections in new filter format

**New file or inline in `types/anime.ts`:**

```typescript
// types/anime.ts
import { generateId, type FilterExpression } from './filter'

function statusFilter(statuses: string[]): FilterExpression {
  return {
    id: generateId(),
    logic: 'and',
    conditions: [{
      id: generateId(),
      field: 'status',
      operator: 'in',
      value: statuses,
    }],
  }
}

export const DEFAULT_SECTIONS: SectionDef[] = [
  { key: 'watching',  label: '觀看中', filter: statusFilter(['watching']),  sortBy: 'updated',     sortOrder: 'desc' },
  { key: 'completed', label: '已看完', filter: statusFilter(['completed']), sortBy: 'completedAt', sortOrder: 'asc'  },
  { key: 'planned',   label: '計畫中', filter: statusFilter(['planned']),   sortBy: 'created',     sortOrder: 'asc'  },
  { key: 'dropped',   label: '已棄番', filter: statusFilter(['dropped']),   sortBy: 'updated',     sortOrder: 'desc' },
]
```

These defaults are used on the main page when `prefs.sections` is null/empty.
They produce the same visible layout as the current hardcoded sections.

---

### Step 4: Update `useAnimeSections` to accept new `SectionDef` & implement first-match

**Changes in `hooks/useAnimeSections.ts`:**

Replace the status-based filtering with filter-based first-match partitioning:

```typescript
import { useMemo } from 'react'
import { useAnimeList } from './useAnimeList'
import type { AnimeRecord, AnimeSection, SectionDef, SortableField } from '@/types/anime'
import { evaluateFilter } from '@/lib/filterEngine'

function sortItems(
  items: AnimeRecord[],
  sortBy: SortableField,
  sortOrder: 'asc' | 'desc',
): AnimeRecord[] {
  return [...items].sort((a, b) => {
    const aVal = a[sortBy] ?? ''
    const bVal = b[sortBy] ?? ''
    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1
    return 0
  })
}

export function useAnimeSections(sectionDefs: SectionDef[]) {
  const { data, ...rest } = useAnimeList()

  const sections = useMemo<AnimeSection[]>(() => {
    if (!data) return []

    const claimed = new Set<string>()
    const result: AnimeSection[] = []

    for (const def of sectionDefs) {
      const items = data.filter((item) => {
        if (claimed.has(item.id)) return false
        if (!def.filter) return true
        return evaluateFilter(def.filter, item)
      })

      items.forEach((item) => claimed.add(item.id))

      result.push({
        key: def.key,
        label: def.label,
        items: sortItems(items, def.sortBy, def.sortOrder ?? 'desc'),
      })
    }

    // "Other" catch-all — only shown when records remain unclaimed
    const unclaimed = data.filter((item) => !claimed.has(item.id))
    if (unclaimed.length > 0) {
      result.push({
        key: '__other__',
        label: '未分類',
        items: sortItems(unclaimed, 'updated', 'desc'),
      })
    }

    return result
  }, [data, sectionDefs])

  return { sections, ...rest }
}
```

---

### Step 5: Update main page to use new `SectionDef` & defaults

**Changes in `routes/_auth/index.tsx`:**

```typescript
import { DEFAULT_SECTIONS } from "@/types/anime"
import type { SectionDef } from "@/types/anime"

function Index() {
  const { data: prefs } = useUserPreferences()

  // Use custom sections from prefs, fall back to built-in defaults
  const sectionDefs = useMemo<SectionDef[]>(() => {
    if (prefs?.sections && prefs.sections.length > 0) {
      return prefs.sections
    }
    return DEFAULT_SECTIONS
  }, [prefs])

  const { sections, isLoading, isError, error } = useAnimeSections(sectionDefs)

  // ... everything else unchanged (global filter, rendering, etc.)
}
```

**What disappears from this file:**
- The inline hardcoded `sectionDefs` array with `statuses[]`
- The `prefs?.watchingLabel || "觀看中"` pattern — labels come from `DEFAULT_SECTIONS`
- The `SortableField` import from `@/types/anime` (still needed by other things)
- The `SectionDef` import still works, now refers to the new filter-based type

---

### Step 6: Update `PreferencesModal` — remove `*Label` fields, add sections tab

**Changes in `components/modals/PreferencesModal.tsx`:**

1. Remove `*Label` fields from the form:

```typescript
const form = useForm({
  initialValues: {
    pageTitle: prefs?.pageTitle ?? '',
    // REMOVED: watchingLabel, completedLabel, plannedLabel, droppedLabel
    sections: prefs?.sections ?? [],
  },
})
```

2. Remove the "區塊名稱" divider + 4 `TextInput` fields from the "一般" tab
   (lines ~127-146 in the current file)

3. Add a new "章節" tab:

```tsx
import { IconSections } from '@tabler/icons-react'

// After the "介面" tab:
<Tabs.Tab value="sections" leftSection={<IconSections size="1em" />}>
  章節
</Tabs.Tab>

// New panel:
<Tabs.Panel value="sections">
  <SectionEditor
    sections={form.values.sections}
    onChange={(newSections) => form.setFieldValue('sections', newSections)}
  />
</Tabs.Panel>
```

> `handleSubmit` already sends the entire form values to
> `useUserPreferencesMutation`. No changes needed there — `sections` will be
> included automatically.

---

### Step 7: Build the Section Editor UI

**New file:** `client/src/components/modals/SectionEditor.tsx`

Props:
```typescript
import type { SectionDef } from '@/types/anime'

interface SectionEditorProps {
  sections: SectionDef[]
  onChange: (sections: SectionDef[]) => void
}
```

Layout:
```
┌─────────────────────────────────────────────────────┐
│  Section Editor                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─ Section 1 ───────────────────────── ▲ ▼ ─────┐ │
│  │  Label:  [觀看中                 ]            │ │
│  │  Filter: status is "watching"       [Edit]     │ │
│  │  Sort:   [updated  ▾]  [遞減 ▾]              │ │
│  │                              [✕ Delete]        │ │
│  └────────────────────────────────────────────────┘ │
│                                                     │
│  ┌─ Section 2 ───────────────────────── ▲ ▼ ─────┐ │
│  │  Label:  [高分推薦               ]            │ │
│  │  Filter: status is "completed"       [Edit]    │ │
│  │          AND rating >= 8                        │ │
│  │  Sort:   [rating   ▾]  [遞減 ▾]              │ │
│  │                              [✕ Delete]        │ │
│  └────────────────────────────────────────────────┘ │
│                                                     │
│  + Add Section                                      │
│                                                     │
│  ⓘ Records appear in the first matching section.   │
│    Unmatched records go to 「未分類」.              │
│                                                     │
│  [Reset to Defaults]                               │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                 [Save]              │
└─────────────────────────────────────────────────────┘
```

**Features:**
- **Move up/down buttons** (▲ ▼) for reordering (drag-and-drop later)
- **Label** — `TextInput`, inline editable
- **Filter summary** — shows a human-readable string via `describeFilter()`.
  Clicking `[Edit]` opens `FilterBuilder` in a `Popover`.
- **Sort selector** — `Select` for field + `SegmentedControl` for asc/desc
- **Delete section** — `ActionIcon` (red ✕) with confirmation modal
- **Add section** — `Button` → creates section with label "新章節" and
  a null filter (match all), appended at the bottom
- **Reset to Defaults** — replaces all sections with `DEFAULT_SECTIONS`
- **Info tooltip** — explains first-match semantics

**Mantine components:**

| Element | Component |
|---------|-----------|
| Section card | `Paper` with `Stack` |
| Move up/down | `ActionIcon` with `IconChevronUp` / `IconChevronDown` |
| Label input | `TextInput` |
| Filter summary + edit | `Button` variant="outline" + `Popover` → `FilterBuilder` |
| Sort field | `Select` |
| Sort order | `SegmentedControl` (遞增/遞減) |
| Delete button | `ActionIcon` color="red" |
| Add section | `Button` variant="light" |
| Reset | `Button` variant="subtle" color="gray" |
| Info | `Tooltip` or `Alert` |

**Key UX rule:** Section with `filter: null` (match all) at position 0 would
claim every record. Show a warning when a null-filter section is not at the
bottom:

> ⚠️ This section has no filter — it will match **all** remaining records.
> Consider moving it to the bottom if you intend it as a catch-all.

---

### Step 8: Filter summary helper — `describeFilter()`

**New file:** `client/src/lib/filterDescribe.ts`

Produces human-readable summaries for display in the Section Editor and
elsewhere (e.g. global filter badge).

```typescript
import type { FilterExpression, FilterCondition, FilterGroup } from '@/types/filter'
import { FIELD_REGISTRY } from '@/lib/fieldRegistry'

export function describeFilter(filter: FilterExpression | null): string {
  if (!filter || filter.conditions.length === 0) return '(無篩選)'
  return describeGroup(filter, true)
}

function describeGroup(group: FilterGroup, isRoot: boolean): string {
  // Skip empty groups
  const active = group.conditions.filter(c =>
    'field' in c || (c as FilterGroup).conditions.length > 0
  )
  if (active.length === 0) return '(無篩選)'

  const parts = active.map(c =>
    'field' in c
      ? describeCondition(c as FilterCondition)
      : describeGroup(c as FilterGroup, false)
  )

  const joiner = group.logic === 'and' ? ' 且 ' : ' 或 '
  const joined = parts.join(joiner)

  // Wrap non-root groups in parentheses
  return isRoot ? joined : `(${joined})`
}

function describeCondition(cond: FilterCondition): string {
  const def = FIELD_REGISTRY.find(d => d.field === cond.field)
  const label = def?.label ?? cond.field
  const { operator, value } = cond

  switch (operator) {
    case 'eq':       return `${label} 是 "${value}"`
    case 'neq':      return `${label} 不是 "${value}"`
    case 'contains': return `${label} 包含 "${value}"`
    case 'notContains': return `${label} 不含 "${value}"`
    case 'gt':       return `${label} > ${value}`
    case 'gte':      return `${label} ≥ ${value}`
    case 'lt':       return `${label} < ${value}`
    case 'lte':      return `${label} ≤ ${value}`
    case 'in':       return `${label} 在 [${(value as string[]).join(', ')}]`
    case 'notIn':    return `${label} 不在 [${(value as string[]).join(', ')}]`
    case 'between':  return `${label} 在 ${(value as [string,string]).join(' 到 ')} 之間`
    case 'before':   return `${label} 在 ${value} 之前`
    case 'after':    return `${label} 在 ${value} 之後`
    case 'isEmpty':  return `${label} 為空`
    case 'isNotEmpty': return `${label} 不為空`
    case 'containsAll': return `${label} 包含全部`
    case 'containsAny': return `${label} 包含任一`
    default:         return `${label} ${operator} ${value}`
  }
}
```

> For select fields, the raw value is an enum string (e.g. `"watching"`).
> The display could resolve human-readable labels via `FIELD_REGISTRY.options`,
> but keeping it simple with raw values is fine for MVP.

---

### Step 9: Verify `useUserPreferencesMutation` serialization

**Changes in `hooks/useUserPreferencesMutation.ts`:**

Check that the mutation sends `sections` correctly. PocketBase's JS SDK
should handle JSON serialization automatically, but verify. The mutation
likely looks like:

```typescript
pb.collection<UserPreferencesRecord>(Collections.UserPreferences)
  .update(id, { pageTitle, sections })
```

No special handling needed — `sections` is a plain JS array, PocketBase
stores it as JSON.

---

### Step 10: ElevatorWidget compatibility

**Changes in `components/ElevatorWidget/ElevatorWidget.tsx`:**

The widget currently hardcodes 4 section anchors. Refactor to render
dynamically from the `sections` array passed as a prop.

- Accept `{ sections: AnimeSection[] }` as prop
- Map over `sections` to render anchor links
- Skip `__other__` if it shouldn't have an anchor (or include it — TBD)

---

## File Change Summary

```
NEW:
  plan/phase3-custom-sections.md                         ← This plan
  client/src/components/modals/SectionEditor.tsx          ← Section editor UI
  client/src/lib/filterDescribe.ts                        ← Filter → human-readable summary
  server/migrations/1777000000_updated_userPreferences.go ← Add sections, remove *Label fields

MODIFY:
  client/src/types/filter.ts                ← Delete SectionDefV2, SortableField, ActionRule, ActionDef
  client/src/types/anime.ts                 ← Replace SectionDef (filter-based), remove *Label fields, add DEFAULT_SECTIONS
  client/src/hooks/useAnimeSections.ts      ← Accept new SectionDef, first-match + "Other" catch-all
  client/src/hooks/useUserPreferencesMutation.ts ← Verify sections serialization
  client/src/routes/_auth/index.tsx         ← Use prefs.sections ?? DEFAULT_SECTIONS, remove *Label fallbacks
  client/src/components/modals/PreferencesModal.tsx ← Remove *Label inputs, add "章節" tab
  client/src/components/ElevatorWidget/ElevatorWidget.tsx ← Accept dynamic section count
```

---

## Verification Checklist

- [ ] Server migration adds `sections` JSON field, removes 4 `*Label` fields
- [ ] Old `SectionDef` (statuses[]) deleted from `types/anime.ts`
- [ ] New `SectionDef` (filter-based) is the only definition
- [ ] `DEFAULT_SECTIONS` produces identical 4-section layout
- [ ] `useAnimeSections` partitions with first-match — no duplicates
- [ ] "Other" section only appears when records are unclaimed
- [ ] Every record appears in exactly one section (including "Other")
- [ ] Main page shows defaults when `prefs.sections` is null/empty
- [ ] Main page shows custom sections when `prefs.sections` is populated
- [ ] `PreferencesModal` no longer shows `*Label` inputs
- [ ] `PreferencesModal` "章節" tab renders `SectionEditor`
- [ ] Section editor: add, edit label, edit filter, change sort, delete, reorder
- [ ] Section editor: "Reset to Defaults" works
- [ ] Filter summary displays correct Chinese text
- [ ] FilterBuilder opens for section filter editing
- [ ] Saving sections persists to server
- [ ] Global filter (#11) still works on top of custom sections
- [ ] ElevatorWidget works with dynamic section count
- [ ] `npm run build` passes (TypeScript)
