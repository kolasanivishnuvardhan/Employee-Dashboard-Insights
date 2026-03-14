# Employee Insights Dashboard

A 4-screen React dashboard focused on auth, virtualization, native camera capture, signature overlays, and SVG analytics.

## Credentials
- Username: `testuser`
- Password: `Test123`

## Screen-by-screen implementation

### 1) Secure Authentication (`/login`)
- Context-based auth provider with persistent session in `localStorage`.
- Route guard redirects unauthenticated users away from protected routes.
- Reload-safe: once logged in, refresh keeps the user session active.

### 2) High-Performance Grid (`/list`)
- Fetches employee data using:
  - `POST https://backend.jotish.in/backend_dev/gettabledata.php`
  - payload `{ "username": "test", "password": "123456" }`
- Handles nested backend response shapes (including `TABLE_DATA.data`) and normalizes row-array records into typed employee objects.
- Parses salary strings such as `$320,800` into numeric values for virtualization and analytics.
- Custom virtualization (no windowing libraries): only viewport rows + buffer are rendered.

### 3) Identity Verification (`/details/:id`)
- Native camera capture using `navigator.mediaDevices.getUserMedia`.
- Signature capture on top of the photo via HTML Canvas (mouse + touch).
- Merge step combines photo + signature into one final DataURL image.

### 4) Analytics + Audit Result (`/analytics`)
- Displays merged audit image.
- Custom salary chart drawn with raw SVG bars.
- Custom geospatial city map via raw SVG using latitude/longitude projection to SVG coordinates.

## Virtualization math (core logic)
- `ROW_HEIGHT = 64`
- `VIEWPORT_HEIGHT = 480`
- `BUFFER_ROWS = 6`

For `N` rows and current `scrollTop`:
1. `startIndex = max(0, floor(scrollTop / ROW_HEIGHT) - BUFFER_ROWS)`
2. `visibleCount = ceil(VIEWPORT_HEIGHT / ROW_HEIGHT) + 2 * BUFFER_ROWS`
3. `endIndex = min(N, startIndex + visibleCount)`
4. Render only `rows[startIndex...endIndex)`
5. Simulate full scroll height with padding:
   - `paddingTop = startIndex * ROW_HEIGHT`
   - `paddingBottom = totalHeight - endIndex * ROW_HEIGHT`

This keeps DOM node count stable while preserving natural scrollbar behavior.

## Intentional Vulnerability (required)

> Exactly one intentional bug is included in this submission.

### Bug type
Performance bug (memory leak).

### Where
`src/pages/DetailsPage.jsx` in the `useEffect` that adds a `window.resize` listener.

### What is wrong
The listener is registered but never removed on unmount.
Repeated navigation to and from `/details/:id` can accumulate listeners and degrade performance over time.

### Why included
The assignment explicitly requires one intentional logic/performance issue to be documented.
I chose a contained memory leak that is easy to explain and verify during review.

## Run locally
```bash
npm install
npm run dev
```

## Suggested recording walkthrough
1. Login flow + auth guard (open `/list` while logged out).
2. Virtualized list behavior while scrolling.
3. Camera capture + signature draw + merge.
4. Analytics page (audit image + SVG chart + SVG map).
5. 60-second explainer: image merge pipeline + virtualization offset math.
