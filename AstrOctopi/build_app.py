"""Builds AstrOctopi.exe (Windows) or an app (macOS/Linux).
Put this file, astroctopi.html, astroctopi_app.py and icon.ico in one folder, then run:
    python build_app.py
The result is in the 'dist' folder."""
import os, subprocess, sys

sep = ";" if os.name == "nt" else ":"
run = lambda *a: subprocess.check_call([sys.executable, "-m", *a])
run("pip", "install", "--upgrade", "pywebview", "pyinstaller")
run("PyInstaller", "--noconsole", "--onefile", "--name", "AstrOctopi", "--icon", "icon.ico",
    "--add-data", f"astroctopi.html{sep}.", "astroctopi_app.py")
print("\nDone. Your app is in the 'dist' folder.")
