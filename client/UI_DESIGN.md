# Anime list client design

Key Point: Recreate similar feel of old client using modern and easy to maintain technique (React + Mantine UI).

Must have:
- light/dark mode

## Main Page (Index)

`_auth/index.tsx`

A document-like layout (e.g. google docs), with a heading of customizable title, following sections of a sub-heading and ordered list. The document paper is aligned center.

_Tag name just for an example, doesn't mean the actual component name_
```tsx
<DocumentPaper>
  // Customizable Title
  <Title>My Anime List</Title>

  <Section>
    // Customizable subtitle
    <Subtitle>Completed</Subtitle>

    <OrderedList>
      <ListItem>Naruto</ListItem>
      // more items...
    </OrderedList>
  </Section>

  <Section>
    <Subtitle>Planned</Subtitle>

    <OrderedList>
      <ListItem>Oshi no ko</ListItem>
      // more items...
    </OrderedList>
  </Section>
</DocumentPaper>
```

There are more component in the main page that not shown in above example. (button to open search box, open add new record dialog, nav buttons)

_Copying from old client design_
Paper has `padding: 30px;`, box shadow, and max width 700px when `@media only screen and (min-width: 780px)`.

### info card

Clicking `ListItem` will open a floating info card at right side.

Info card will show:
- close info card button
- anime poster at top, or blending with info as background with blur when not enough height (responsive)
- view fullscreen poster
- title
- copy title button
- status
- download status
- rating
- comment
- remarks
- tags
- quick action buttons to update status (e.g. planned -> watching, watching -> completed, downloading -> downloaded)
- edit button to open edit modal

Info card is singleton.

### New record modal (or a generic search tmdb modal)

A popup modal with a textbox. Search tmdb and show result with poster and title.

// How to handle/display multiple season? Need to handle S1 already exist and user try to add S2

Select a result and create record.

### Edit modal

Show an edit form in popup modal.

tmdb id, season number and media type are immutable.

Separate two tab: General and Other
General:
- custom name (only when no tmdb id)
- status
- download status
- rating
- comment
- remarks
- tags

Other:
- started at time override
- completed at time override