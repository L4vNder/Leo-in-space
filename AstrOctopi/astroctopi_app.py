#!/usr/bin/env python3
"""AstrOctopi desktop app: a native window around the AstrOctopi design.
Run from source:  pip install pywebview   then   python3 astroctopi_app.py   (add --fullscreen for kiosk mode)
Build a Windows .exe: double-click build_windows.bat. Data is saved in ~/.astroctopi_data.
Prototype only: codes are stored unencrypted and this is not a medical device."""
import os, sys
import webview

BASE = getattr(sys, "_MEIPASS", os.path.dirname(os.path.abspath(__file__)))
PAGE = os.path.join(BASE, "astroctopi.html")
DATA = os.path.join(os.path.expanduser("~"), ".astroctopi_data")

def main():
    if not os.path.exists(PAGE):
        sys.exit("astroctopi.html not found next to this file.")
    webview.create_window("AstrOctopi", PAGE, width=1100, height=780, min_size=(820, 600),
                          background_color="#0b0c12", fullscreen="--fullscreen" in sys.argv)
    webview.start(private_mode=False, storage_path=DATA)

if __name__ == "__main__":
    main()
