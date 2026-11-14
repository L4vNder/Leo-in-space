# Leo-in-space

This is an extensive documentative report of team <b>LEO's</b> progress in the NASA Space Apps Challenge of the year 2026

<b> Disclaimer: This project's code, planning, and production is heavily dependent on AI. Code generation and writing is almost exclusively produced by GenAI. </b>

## Steps of Production

## Running the Orbit Care desktop app

Start `orbit_care_app.py` with Python. Before importing the desktop app, it checks for `pywebview` and installs the dependencies listed in `requirements.txt` if needed. If you start it from system Python, missing dependencies are installed into a project-local `.venv`; the app then relaunches in that environment. Linux installs the Qt webview backend as well. A working internet connection is needed on the first launch.

You can also install the dependencies yourself with `python -m pip install -r requirements.txt` and run `python orbit_care_app.py`. On Linux, the webview backend may additionally require operating-system Qt libraries.

The optional voice-announcement feature in `orbit_care.py` uses `pyttsx3` and is not required by the desktop webview app.

## Considered Hazards
<ol>
<li> Space Radiation
<li> Isolation and Confinement
<li> Distance from Earth
<li> Gravity Fields
<li> Hostile/Closed Environments
</ol>

## 1. Space Radiation
### I. Effects
- Astronauts affected by 10 times higher radiation than on Earth.

### II. Risks

<ol>
<li> Increased cancer risk
<li> Nervous system damage
<li> Nausea
<li> Vomiting
<li> Anorexia
<li> Fatigue
<li> Cataracts
<li> Cardiac Disease
<li> Circulatory Disease
</ol>

### III. Possible Solutions
- 