#!/usr/bin/env python3
"""Orbit Care desktop app: a native window around the Orbit Care design.

Setup:   Missing packages are installed from requirements.txt on first launch.
Run:     python orbit_care_app.py
Kiosk:   python3 orbit_care_app.py --fullscreen     (for the main spacecraft screen)

Keep orbit-care.html in the same folder as this file.
Linux installs the Qt webview backend; operating-system Qt libraries may also be needed.
Crew data is saved on this computer in ~/.orbit_care_data.
Prototype only: codes are stored unencrypted and this is not a medical device.
"""
import importlib
import importlib.util
import os
import subprocess
import sys
import venv

HERE = os.path.dirname(os.path.abspath(__file__))
PAGE = os.path.join(HERE, "orbit-care.html")
DATA = os.path.join(os.path.expanduser("~"), ".orbit_care_data")
REQUIREMENTS = os.path.join(HERE, "requirements.txt")
VENV_DIR = os.path.join(HERE, ".venv")
VENV_PYTHON = os.path.join(
    VENV_DIR,
    "Scripts" if os.name == "nt" else "bin",
    "python.exe" if os.name == "nt" else "python",
)


def install_requirements(python):
    print("Installing Orbit Care dependencies before launch...", flush=True)
    try:
        subprocess.run(
            [python, "-m", "pip", "install", "-r", REQUIREMENTS],
            check=True,
        )
    except subprocess.CalledProcessError as error:
        raise SystemExit(
            "Dependency installation failed. Check the pip output above and try again."
        ) from error


def ensure_dependencies():
    if importlib.util.find_spec("webview") is not None:
        return

    if sys.prefix == sys.base_prefix:
        if not os.path.isfile(VENV_PYTHON):
            venv.create(VENV_DIR, with_pip=True)
        installed = subprocess.run(
            [VENV_PYTHON, "-c", "import webview"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            check=False,
        ).returncode == 0
        if not installed:
            install_requirements(VENV_PYTHON)
        result = subprocess.run([VENV_PYTHON, __file__, *sys.argv[1:]], check=False)
        raise SystemExit(result.returncode)

    install_requirements(sys.executable)


ensure_dependencies()
webview = importlib.import_module("webview")


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
