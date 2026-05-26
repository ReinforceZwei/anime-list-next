# Filter Builder — Design & Implementation Plan

## Issue Synthesis

Three GitHub issues converge on a single concept: a **composable filter/condition builder**.

| Issue | Title | Core Need |
|-------|-------|-----------|
| [#11](https://github.com/ReinforceZwei/anime-list-next/issues/11) | Filter records with advanced filter query | Global transient filter applied to the current view |
| [#28](https://github.com/ReinforceZwei/anime-list-next/issues/28) | Customizable section filter and sorting | Named, persisted sections each with their own filter + sort |
| [#29](https://github.com/ReinforceZwei/anime-list-next/issues/29) | Custom action button on info card | Conditionally visible buttons based on per-record field matching |

All three share the same foundation: a **filter expression model** that can be built by the user, evaluated against `AnimeRecord` objects, and persisted as part of user preferences. Building this once as a shared primitive avoids duplication and gives users a consistent experience.

---

## Core Model: Filter Expression

A filter is a tree of **groups** (AND/OR combinators) containing **conditions** (leaf predicates against a single field).

```typescript
// ---- Leaf: one field predicate ----

interface FilterCondition {
  id: string;            // unique key (nanoid)
  field: FilterableField;
  operator: FilterOperator;
  value: FilterValue;    // typed based on field + operator
}

// ---- Branch: AND/OR group ----

interface FilterGroup {
  id: string;
  logic: 'and' | 'or';
  conditions: (FilterCondition | FilterGroup)[];
}

// A root filter is just a FilterGroup
type FilterExpression = FilterGroup;
```

### Filterable Fields & Operators

Each field type has a fixed set of applicable operators.

| Field | Type | Operators |
|-------|------|-----------|
| `status` | select | `eq`, `neq`, `in`, `notIn` |
| `downloadStatus` | select | `eq`, `neq`, `in`, `notIn` |
| `tmdbMediaType` | select | `eq`, `neq` |
| `tags` | multi-select (relation) | `containsAll`, `containsAny`, `isEmpty`, `isNotEmpty` |
| `rating` | number (0–10) | `eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `between`, `isEmpty`, `isNotEmpty` |
| `startedAt` | date | `before`, `after`, `between`, `isEmpty`, `isNotEmpty` |
| `completedAt` | date | `before`, `after`, `between`, `isEmpty`, `isNotEmpty` |
| `cachedTitle` | text | `contains`, `notContains`, `eq`, `neq`, `isEmpty`, `isNotEmpty` |
| `cachedSeasonName` | text | `contains`, `notContains`, `eq`, `neq`, `isEmpty`, `isNotEmpty` |
| `customName` | text | `contains`, `notContains`, `eq`, `neq`, `isEmpty`, `isNotEmpty` |
| `comment` | text | `contains`, `notContains`, `isEmpty`, `isNotEmpty` |
| `remark` | text | `contains`, `notContains`, `isEmpty`, `isNotEmpty` |
| `created` | date | `before`, `after`, `between` |
| `updated` | date | `before`, `after`, `between` |

```typescript
type FilterableField =
  | 'status' | 'downloadStatus' | 'tmdbMediaType'
  | 'rating' | 'startedAt' | 'completedAt'
  | 'cachedTitle' | 'cachedSeasonName' | 'customName'
  | 'comment' | 'remark' | 'created' | 'updated'
  | 'tags';

type FilterOperator =
  // Universal
  | 'eq' | 'neq' | 'isEmpty' | 'isNotEmpty'
  // Text
  | 'contains' | 'notContains'
  // Number / Date
  | 'gt' | 'gte' | 'lt' | 'lte' | 'between'
  // Date only
  | 'before' | 'after'
  // Select
  | 'in' | 'notIn'
  // Tags (multi-select relation)
  | 'containsAll' | 'containsAny';

type FilterValue = string | number | string[] | [string, string] | null;
```

### Evaluation Engine

A pure function evaluates a `FilterExpression` against a single `AnimeRecord`:

```typescript
function evaluateFilter(filter: FilterExpression, record: AnimeRecord): boolean
```

- Groups: `and` → `conditions.every()`, `or` → `conditions.some()`
- Leaf: dispatch on `field + operator`, read the record property, compare with `value`
- Tags: resolve `record.tags[]` (tag IDs) against the selected tag IDs in value
- `isEmpty`/`isNotEmpty`: treat `null`, `undefined`, `""`, `[]` as empty
- Text `contains`: case-insensitive substring match
- Date comparison: parse ISO strings, compare timestamps

This engine runs **client-side** on the already-fetched `AnimeRecord[]` array. Filtering happens in memory because `useAnimeList()` fetches the full user list once (staleTime: Infinity). No server-side query changes are needed.

---

## Reusable Component: `<FilterBuilder>`

### Props

```typescript
interface FilterBuilderProps {
  value: FilterExpression;
  onChange: (filter: FilterExpression) => void;
  availableFields?: FilterableField[];  // limit which fields are shown
  readonly?: boolean;                    // display-only mode
}
```

### UI Layout

```
┌─────────────────────────────────────────┐
│  Filter Builder                      ✕  │
├─────────────────────────────────────────┤
│                                         │
│  ┌─ AND ▾ ──────────────────────────┐  │
│  │  status  ▾  is  ▾  watching   🗑 │  │
│  │  + Add condition                  │  │
│  └──────────────────────────────────┘  │
│                                         │
│  ┌─ OR  ▾ ───────────────────────────┐  │
│  │  startedAt ▾  after  ▾  [date] 🗑│  │
│  │  rating    ▾  >=     ▾  7      🗑│  │
│  │  + Add condition │ + Add group     │  │
│  └──────────────────────────────────┘  │
│                                         │
│  + Add group                            │
│                                         │
├─────────────────────────────────────────┤
│  [Clear]                    [Apply]     │
└─────────────────────────────────────────┘
```

### Interaction Design

- **Add condition**: Select field → operator → value. The value input adapts to the field type (dropdown for selects, number input for rating, date picker for dates, text input for text, tag multi-select for tags).
- **Add group**: Creates a nested `FilterGroup` (default AND). The root group can toggle AND/OR.
- **Delete**: 🗑 icon on each condition row and group header.
- **Drag (future)**: Reorder conditions within a group.
- **Toggle AND/OR**: Dropdown on the group header.

### Mantine Components Used

| UI Element | Mantine Component |
|------------|-------------------|
| Floating panel | `Popover` or `Drawer` (like LocalSearch) |
| Group header + logic toggle | `SegmentedControl` (AND/OR) in a `Group` |
| Field selector | `Select` |
| Operator selector | `Select` (filtered by field type) |
| Value input (text) | `TextInput` |
| Value input (number) | `NumberInput` |
| Value input (date) | `DatePickerInput` |
| Value input (select) | `MultiSelect` or `Select` |
| Value input (tags) | `TagMultiSelect` (existing component) |
| Add / Remove buttons | `ActionIcon` with icons |
| Apply / Clear | `Button` (primary / default) |

### State Management

The `FilterBuilder` is a **controlled component** — it receives `value`/`onChange` and does not own the filter state itself. This allows the parent to persist, reset, or nest filters freely.

---

## Use Case 1: Global List Filter (#11)

### Where

`client/src/routes/_auth/index.tsx` — the main list page.

### Behavior

1. A **filter icon button** sits next to the existing `LocalSearch` button in the page header (or floating toolbar).
2. Clicking it opens the `FilterBuilder` in a floating panel (same `Popover` pattern as `LocalSearch`).
3. The user builds a filter and clicks **Apply** → the panel closes, the list filters.
4. While a filter is active, a **"Clear Filter" button** appears at the bottom of the page via Mantine `Affix`.

### Integration

```typescript
// In the main page component:
const [globalFilter, setGlobalFilter] = useState<FilterExpression | null>(null);

const { sections } = useAnimeSections(sectionDefs); // unchanged

// Wrap sections through the filter
const filteredSections = useMemo(() => {
  if (!globalFilter) return sections;
  return sections.map(section => ({
    ...section,
    items: section.items.filter(item => evaluateFilter(globalFilter, item)),
  }));
}, [sections, globalFilter]);
```

### UX Details

- The filter icon shows a **badge/dot** when a filter is active.
- "Clear Filter" resets `globalFilter` to `null`.
- Filter is **not persisted** across page reloads (transient). Could optionally save to `sessionStorage`.

---

## Use Case 2: Customizable Sections (#28)

### Where

A new **Settings panel** or an edit mode on the main page.

### Data Model (Persisted in `userPreferences`)

Extend `UserPreferencesRecord` with a `sections` JSON field:

```typescript
interface SectionDef {
  key: string;           // unique, e.g. "s0", "s1"
  label: string;         // user-visible title
  filter: FilterExpression | null;  // null = match all
  sortBy: SortableField;
  sortOrder: 'asc' | 'desc';
}
```

Alternatively, add a new collection `userSections` if the JSON grows too large. For MVP, storing in `userPreferences.sections` is simpler.

### Backend Changes

1. Add a new migration adding a `sections` JSON field to `userPreferences`.
2. Update `config.go` to allow the new field if needed.
3. Update `UserPreferencesRecord` TypeScript type.

### Behavior

1. User enters **"Edit Sections"** mode from a menu or settings page.
2. Each section row shows: label (editable), filter summary, sort dropdown, drag handle.
3. Clicking the filter summary opens the `FilterBuilder` pre-populated with that section's filter.
4. Saving persists to `userPreferences`.
5. The main page reads `sectionDefs` from user preferences instead of hardcoded defaults.

### Fallback

If `userPreferences.sections` is empty/null, use the current hardcoded defaults:
```typescript
const DEFAULT_SECTIONS: SectionDef[] = [
  { key: 'watching', label: '觀看中', statuses: ['watching'], sortBy: 'updated', sortOrder: 'desc' },
  { key: 'completed', label: '已看完', statuses: ['completed'], sortBy: 'completedAt', sortOrder: 'desc' },
  { key: 'planned', label: '待看', statuses: ['planned'], sortBy: 'created', sortOrder: 'desc' },
  { key: 'dropped', label: '已棄', statuses: ['dropped'], sortBy: 'updated', sortOrder: 'desc' },
];
```

### Updated `useAnimeSections`

```typescript
export function useAnimeSections(sectionDefs: SectionDef[]) {
  const { data, ...rest } = useAnimeList();
  const sections = useMemo<AnimeSection[]>(() => {
    if (!data) return [];
    return sectionDefs.map(def => ({
      key: def.key,
      label: def.label,
      items: sortItems(
        def.filter
          ? data.filter(item => evaluateFilter(def.filter!, item))
          : data,
        def.sortBy,
        def.sortOrder ?? 'desc',
      ),
    }));
  }, [data, sectionDefs]);
  return { sections, ...rest };
}
```

Note: The old `SectionDef.statuses` is replaced by `SectionDef.filter`. The migration path: if a section has no filter, default to `{ field: 'status', operator: 'in', value: ['watching'] }` etc. based on the legacy `statuses` array (or just replace it entirely).

---

## Use Case 3: Conditional Action Buttons (#29)

### Where

`client/src/components/InfoCard/InfoCardQuickActions.tsx`

### Data Model

A new concept: **User-defined action rules**. Each rule specifies:

```typescript
interface ActionRule {
  id: string;
  label: string;                          // button text
  icon?: string;                          // optional icon
  condition: FilterExpression;            // when to show this button
  actions: ActionDef[];                   // what happens on click
}

type ActionDef =
  | { type: 'setStatus'; status: AnimeRecord['status'] }
  | { type: 'setDownloadStatus'; downloadStatus: AnimeRecord['downloadStatus'] }
  | { type: 'setRating'; rating: number }
  | { type: 'addTag'; tagId: string }
  | { type: 'removeTag'; tagId: string };
```

Persisted in `userPreferences.actionRules: ActionRule[]`.

### Behavior

1. User configures action rules in a settings panel.
2. For each rule, they define a condition using `FilterBuilder` and an action.
3. On `InfoCard`, the component evaluates each rule's `condition` against the current record. Matching rules render as buttons.
4. The built-in default actions (status transitions, download transitions) remain as fallback defaults. User rules are **appended after** them.

### Integration

```typescript
function InfoCardQuickActions({ record }: { record: AnimeRecord }) {
  const { data: prefs } = useUserPreferences();
  const rules = prefs?.actionRules ?? [];

  const matchingRules = rules.filter(r => evaluateFilter(r.condition, record));

  return (
    <Group>
      {/* Default actions (existing logic, or also migrated to rules) */}
      {getDefaultActions(record).map(action => ...)}
      {/* Custom user rules */}
      {matchingRules.map(rule => (
        <Button key={rule.id} onClick={() => executeAction(rule.action, record)}>
          {rule.label}
        </Button>
      ))}
    </Group>
  );
}
```

---

## Implementation Order

### Phase 1: Core Filter Engine (foundation for all three)

1. **Define types** — `FilterCondition`, `FilterGroup`, `FilterExpression`, `FilterableField`, `FilterOperator`, operators-by-field map. File: `client/src/types/filter.ts`
2. **Implement `evaluateFilter()`** — pure function, fully unit-testable. File: `client/src/lib/filterEngine.ts`
3. **Build `<FilterBuilder>` component** — controlled, reusable. Files:
   - `client/src/components/FilterBuilder/FilterBuilder.tsx`
   - `client/src/components/FilterBuilder/FilterGroupRow.tsx`
   - `client/src/components/FilterBuilder/FilterConditionRow.tsx`
   - `client/src/components/FilterBuilder/FilterValueInput.tsx` (dispatches to typed inputs)
4. **Wire up the field/operator metadata** — a registry mapping each field to its type, label, operators, and value input component. File: `client/src/components/FilterBuilder/fieldRegistry.ts`

### Phase 2: Global Filter (#11)

5. Add `globalFilter` state to the main page (`_auth/index.tsx`)
6. Add filter toggle button next to LocalSearch
7. Render `FilterBuilder` in a floating panel
8. Apply filter to sections via `useMemo`
9. Add "Clear Filter" `Affix` button

### Phase 3: Custom Sections (#28)

10. Add `sections` JSON field migration to `userPreferences`
11. Update `UserPreferencesRecord` type
12. Build section editor UI (list of sections, each with label/filter/sort)
13. Update `useAnimeSections` to use `FilterExpression` instead of `statuses[]`
14. Migrate default sections to use the new filter model

### Phase 4: Custom Actions (#29)

15. Define `ActionRule` types
16. Add `actionRules` field to `userPreferences` (or new collection)
17. Build action rule editor UI in settings
18. Update `InfoCardQuickActions` to evaluate and render custom rules
19. Implement `executeAction()` to apply mutations via existing hooks

---

## Open Decisions

1. **Persistence scope**: Should `globalFilter` (#11) persist across sessions? Answer: no for MVP — it's transient. Can add `sessionStorage` later.
2. **Section storage**: Store in `userPreferences` JSON field vs. a dedicated `userSections` collection? JSON field is simpler for MVP; dedicated collection is better if sections grow complex.
3. **Action rules storage**: Same question — JSON field for MVP.
4. **Backward compatibility**: The old `SectionDef.statuses` is replaced by `FilterExpression`. Should we auto-migrate, or maintain both? Auto-migrate on first read — convert legacy sections to equivalent filters.
5. **Tag display in filter**: When filtering by tag IDs, should the builder show tag names (from the tag list) or raw IDs? Show names via `TagMultiSelect`, store IDs in the filter value.

---

## File Map (New & Changed)

```
client/src/
  types/
    filter.ts                    ← NEW: FilterExpression, FilterCondition, etc.
  lib/
    filterEngine.ts              ← NEW: evaluateFilter()
  components/
    FilterBuilder/
      FilterBuilder.tsx          ← NEW: root component
      FilterGroupRow.tsx         ← NEW: AND/OR group display
      FilterConditionRow.tsx     ← NEW: single condition row
      FilterValueInput.tsx       ← NEW: dispatches to typed inputs
      fieldRegistry.ts           ← NEW: field metadata & operator map
      FilterBuilder.module.css   ← NEW: styles
    InfoCard/
      InfoCardQuickActions.tsx   ← MODIFY: evaluate action rules
  hooks/
    useAnimeSections.ts          ← MODIFY: accept FilterExpression
    useUserPreferences.ts        ← MODIFY: return sections & actionRules
  routes/
    _auth/
      index.tsx                  ← MODIFY: add global filter + section editor entry
      settings.tsx               ← NEW (or modify): section & action rule editor
  types/
    anime.ts                     ← MODIFY: update SectionDef, add ActionRule
server/
  migrations/
    NNN_updated_userPreferences.go ← NEW: add sections & actionRules JSON fields
```
