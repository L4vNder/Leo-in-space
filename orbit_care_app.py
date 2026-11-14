#!/usr/bin/env python3
"""Orbit Care desktop app: a native window around the Orbit Care design.

Setup:   pip install pywebview
Run:     python3 orbit_care_app.py
Kiosk:   python3 orbit_care_app.py --fullscreen     (for the main spacecraft screen)

Keep orbit-care.html in the same folder as this file.
Linux also needs a web engine: pip install "pywebview[qt]"  (or install python3-gi + WebKitGTK).
Crew data is saved on this computer in ~/.orbit_care_data.
Prototype only: codes are stored unencrypted and this is not a medical device.
"""
import os
import sys

import webview

HERE = os.path.dirname(os.path.abspath(__file__))
PAGE = os.path.join(HERE, "orbit-care.html")
DATA = os.path.join(os.path.expanduser("~"), ".orbit_care_data")


def main():
    if not os.path.exists(PAGE):
        sys.exit("Put orbit-care.html in the same folder as this file.")
    webview.create_window(
        "Orbit Care",
        PAGE,
        width=1100,
        height=780,
        min_size=(820, 600),
        background_color="#0b0c12",
        fullscreen="--fullscreen" in sys.argv,
    )
    # private_mode=False + storage_path keeps profiles, logs and settings between launches
    webview.start(private_mode=False, storage_path=DATA)


if __name__ == "__main__":
    main()
