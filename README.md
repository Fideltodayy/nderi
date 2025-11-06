# nderi

Local packaging (Windows):

1) One-time setup
- Double-click `scripts\windows\install.bat` to install deps and build.

2) Start the app
- Double-click `scripts\windows\start.bat` (optional: pass a port, e.g. `start.bat 5500`).
- It opens your browser at `http://localhost:5000` by default.

3) Stop the app
- Double-click `scripts\windows\stop.bat` to stop the background server.

4) Optional friendly domain
- Run `scripts\windows\create-domain.bat` as Administrator to add a host like `library.local`.
- Set an environment variable so the starter uses it: `setx LIBRARY_HOST library.local` (then re-open your terminal or log out/in).
- You can then open `http://library.local:5000`.

5) Optional desktop shortcut
- Run `scripts\windows\create-desktop-shortcut.bat` to create a “Library System” shortcut on your desktop.
- You can pass a hostname and port: `create-desktop-shortcut.bat library.local 5000`.

Persistence
- All library data persists in the browser using IndexedDB (via Dexie). It survives server stops and PC restarts as long as you use the same browser profile and origin (host/port). If you change the host or port, the browser treats it as a different origin with a separate database.

Distribute to another Windows laptop (USB)
- Preferred: Portable ZIP (no install, no admin)
  1) Run `scripts\windows\package-zip.bat` on your machine.
  2) Copy `release\nderi-portable.zip` to a USB and move it to the target PC.
  3) Extract anywhere (e.g., Desktop). Double-click `start.bat` to run; `stop.bat` to stop.
  - This includes a portable Node runtime and a fully bundled server. No Node/npm required.
- Simple alternative: Zip repo (requires Node on target)
  1) Zip the project folder after running `scripts\windows\install.bat` once.
  2) On the target PC: unzip, double-click `scripts\windows\start.bat`. Requires Node installed.