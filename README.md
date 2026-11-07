<p align="center">
	<img src="icon.png" width="150" />
</p>

# Paperless Desktop [![Build Status](https://travis-ci.org/thomasbrueggemann/paperless-desktop.svg?branch=master)](https://travis-ci.org/thomasbrueggemann/paperless-desktop)

Desktop app that uses the [paperless-ngx](https://docs.paperless-ngx.com/) API to manage your document scans.
It runs natively on Apple Silicon (M1, M2, M3, ...) as well as on Intel Macs.

<p align="center">
	<img src="http://i.imgur.com/FrgAptE.png" />
</p>

## Installation

Needs a running [paperless-ngx](https://github.com/paperless-ngx/paperless-ngx) instance. The app signs in with
your username and password, exchanges them for an API token (`POST /api/token/`) and only stores the token.

### Pre-built executables

Please keep in mind, that these are pre-releases. There is still some work to do.

Every release contains one build for Apple Silicon (`Paperless-darwin-arm64`) and one for Intel (`Paperless-darwin-x64`).

<center>
	<p>
		<a href="https://github.com/thomasbrueggemann/paperless-desktop/releases" style="background-color:#48D560; color:white; border: 0px; padding:20px 30px; font-size: 1.4em; border-radius:15px">
			 Download now
		</a>
	</p>
</center>

## What changed with paperless-ngx

-   Sign in via API token instead of HTTP Basic auth on every request.
-   Documents, tags and correspondents reference each other by id, tag colors are hex colors.
-   Thumbnails, preview and download use `/api/documents/<id>/thumb|preview|download/`.
-   Uploads (drag & drop) go to `/api/documents/post_document/`.
-   Search uses the full text search (`?query=`), the sidebar filters use `correspondent__id` / `tags__id__all`.
-   The log view shows the `paperless` log (`/api/logs/`), you need to be a superuser to see it.
-   paperless-ngx has no reminders. They are now stored locally in the app (per server) and only show up on this Mac.

## Development

Needs Node.js 22.12 or newer.

_(Disclaimer: I only ever test this on macOS, any other operation system might behave unexpectedly running this)_

```bash
$ npm install
$ npm start
```

## Deployment

Whenever a new macOS executable should be packaged, just call:

```bash
$ npm run package              # Apple Silicon (arm64) and Intel (x64)
$ npm run package:mac:arm64    # only Apple Silicon
$ npm run package:mac:universal # one universal app
```

## Credits

-   &copy; icon design by [@pdiegmann](https://github.com/pdiegmann)
-   [photon](https://github.com/connors/photon)
-   [react](https://facebook.github.io/react/)
-   [electron](http://electron.atom.io/)
