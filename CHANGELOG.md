# Changelog

## 0.1.0

The first release of the new Paperless Desktop: a native Mac app for paperless-ngx.

### New

- Runs natively on Apple Silicon (arm64) and on Intel (x64), built with Electron 45.
- Works with the API of paperless-ngx: sign in with an API token, documents, tags and correspondents by id,
  upload, search, bulk edit and the log.
- Document list with thumbnails, search, filters by correspondent and tag, and endless scrolling.
- Document view with the PDF (pdf.js) or image, and a form for title, correspondent, content, tags and date.
- Multiple selection (`⌘`/`⇧`-click, check mark) with bulk actions, and a context menu on documents.
- Upload with the + button, drag & drop (with an overlay) or `⌘O`, a widget with progress, speed and the OCR state.
- Tags and correspondents with in-place editing, reminders with notifications, settings and a log view.
- Native menu bar with shortcuts (items that make no sense are disabled), toolbar in the title bar,
  translucent sidebar, Dark Mode, banners with "Try Again" for failed loads.
- English and German, more languages can be added in `locales/`.
- Automatic releases: a pushed version tag builds the app and publishes a GitHub release.

### Security

- Sandboxed window with context isolation and a preload script, web security on, content security policy,
  checked messages, token only sent to the configured server, unused Electron features switched off.
- A confirmation before the password is sent over an unencrypted connection.

### Changed

- Dependencies are up to date and `npm audit` finds no vulnerabilities: React 16, ESLint 10, Prettier 3, husky 9.
  The in-place editing and the endless scrolling of the lists do not need extra packages anymore.
- The reminders of the old version are stored in the app, paperless-ngx has no reminders. They are shown as a list.
- The build uses esbuild instead of gulp, browserify and Babel 5.

### Removed

- The support for the original paperless (before paperless-ngx).
