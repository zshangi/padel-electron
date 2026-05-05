# 23rd Padel Electron Offline

This folder is a desktop/offline version of the `23rd-padel` web app.

## What changed

- Electron starts the local Django backend automatically.
- Django auth data is stored in SQLite at Electron `userData/auth.sqlite3`.
- Padel business data is stored in SQLite at Electron `userData/business-data.sqlite3`.
- React is built into `frontend/build` and served by Django, so routes and `/api/...` calls work offline.
- On first start, the app creates a local admin account if no superuser exists.

Default offline login:

```text
username: admin
password: admin12345
```

You can override this before first start with `OFFLINE_ADMIN_USERNAME` and `OFFLINE_ADMIN_PASSWORD`.

## Development

Install dependencies once:

```bash
cd 23rd-padel-electron
npm install
cd frontend && npm install
cd ../backend && pip install -r requirements.txt
```

The packaged app starts Django with the system Python (`python3` on macOS/Linux,
`python` on Windows). Install the Python requirements once on the target machine
before taking it fully offline, or set `PYTHON=/path/to/python` before launching.

Run the desktop app:

```bash
cd 23rd-padel-electron
npm run electron
```

Run backend only with SQLite:

```bash
cd 23rd-padel-electron
npm run migrate
npm run bootstrap
npm run start:backend
```

## Build/package

```bash
cd 23rd-padel-electron
npm run package
```

For a Windows installer from Windows, run:

```bash
npm run make
```

For a DMG installer from Mac, run:

```bash
cd 23rd-padel-electron
python3 -m pip install -r backend/requirements-build.txt
npm run make:dmg
```

The DMG build bundles the Django backend and Python dependencies into the app,
so the target Mac does not need Django or the Python packages installed.
During development, if you run without the bundled backend, the app falls back
to system Python. You can set `PYTHON=/path/to/python3` for a custom Python.

## Data location

When launched through Electron, SQLite files are written to Electron's per-user app data folder, not inside the app bundle. This keeps the app usable on an offline PC and preserves data between updates.
