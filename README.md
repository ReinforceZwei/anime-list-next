# Anime list next

Rewrite old [anime list](https://github.com/ReinforceZwei/anime-list) using Pocketbase + React.

---

New client deeply integrate with TMDb for managing records, instead of relying on manual name input.

Old client doesnt support real time update. Need to refresh browser to see changes from other device. New client implement real time event (backed by Pocketbase) to reflect latest change, no more browser refresh and reduce network usage.

## Technical Stack

### Backend: 

Go, Pocketbase as framework

[golang-tmdb](https://github.com/cyruzin/golang-tmdb) for TMDb integration

(optional, future plan) LLM integration for better search result (same logic from [qb-auto](https://github.com/ReinforceZwei/qb-auto), Brave Search + Wikipedia)

### Client:

Vite + React, MUI, React Router, Pocketbase SDK, Indexed DB wrapper (TBC)

## Backend design

For record CRUD, use Pocketbase collection.

Custom API route for TMDb integration (multi-search, get details, get poster url)

Since need to support delta change, delete will be soft delete. All collection will have `deleted` datetime field.

Schema field name use `lowerCamelCase` (align with Javascript)

Need public RESTful API access (anime record operation)

## Series season relationship design

Initial idea: tmdbId + seasonId

Same tmdbId = same series

## Client design

### Pages

- Login page: just a login page
- Main page: anime list (watch list)
- Setting page: setting page
- Logout page: no UI, only perform logout logic then redirect to login

#### Main page (UI)

A paper-like container at center, document-like list with multiple sections (watched, wish list).

List item display anime title with different color representing status.

Clickable item, display a floating info card on right side

### Workflow

How user will use the app

#### Create record

1. Click "add" button and pop a dialog with title textbox
2. User type/paste anime title into the textbox
3. Perform search, return search result with TMDb ID
4. User choose from the result, confirming series and season number
5. Record is created

#### View record

1. User scroll/search the list
2. User click on the item
3. Show a info card with details
4. User perform various action on the info card (view poster, edit info, copy title, update status)

Common action
- Update download status to complete
- View full screen poster
- Mark anime as watched
- Write comment and rating
- Copy anime title

### Fast initial load

I want to speed up initial render, as fast as server-side render, avoid long blank screen. Need to consider performance optimization when implementing client.