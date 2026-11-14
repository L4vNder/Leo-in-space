#!/usr/bin/env python3
"""Orbit Care: crew health companion (desktop app, Python + Tkinter).
Run:  python3 orbit_care.py
No installs needed. Optional: pip install pyttsx3  (spoken cabin announcements)
Demo codes: Mira 1111, Jonas 2222, Aiko 3333, Command console 0000.
Prototype only: codes are stored unencrypted and this is not a medical device."""
import json, os, random, threading, time, tkinter as tk

PATH = os.path.join(os.path.expanduser("~"), ".orbit_care.json")
THEMES = {
    "dark": dict(bg="#0b0c12", card="#161826", card2="#1e2132", ink="#f4efe0", mut="#9aa0b8", acc="#f6e7a6",
                 on="#14151f", acc2="#a9c8e8", g="#8fd8a8", y="#f2cf6b", r="#ff7b7b"),
    "light": dict(bg="#f2f8fd", card="#ffffff", card2="#e6f1fb", ink="#1b2a3f", mut="#5f7189", acc="#7fb4e6",
                  on="#0e2238", acc2="#3d77b3", g="#2f9e5f", y="#c9921a", r="#d9453f"),
}
T = dict(THEMES["dark"])
AV = ["🚀", "🌙", "⭐", "🪐", "🛰️", "🌍", "☄️", "🦊", "🐙", "🐼", "🌻", "🍄"]
# key, name, unit, green range, yellow range, demo (mean, spread)
M = [("hr", "Heart rate", "bpm", (60, 100), (50, 120), (72, 6)),
     ("sys", "Blood pressure (systolic)", "mmHg", (90, 120), (80, 139), (112, 6)),
     ("spo2", "Blood oxygen", "%", (95, 100), (92, 100), (97, 1)),
     ("temp", "Core temperature", "°C", (36.1, 37.5), (35.5, 38), (36.8, .3)),
     ("glu", "Blood sugar", "mg/dL", (70, 110), (60, 140), (92, 10)),
     ("co2", "Cabin CO₂ exposure", "ppm", (0, 3000), (0, 5000), (2400, 400)),
     ("rad", "Radiation dose", "mSv/day", (0, .8), (0, 1.5), (.6, .1))]
LV = ["Healthy", "Getting risky", "Dangerous"]
TECH = [("Military sleep method", None, ["Relax your whole face, jaw and tongue.", "Drop your shoulders and let each arm go heavy.",
         "Exhale, relax your chest, then legs from thighs to feet.", "Clear your mind for 10 seconds: picture a calm lake or a hammock in a dark room.",
         "If thoughts creep in, repeat \"don’t think\" for 10 seconds."]),
        ("4-7-8 breathing", (4, 7, 8), ["Breathe in through your nose for 4.", "Hold for 7.", "Breathe out slowly for 8.", "Repeat 4 times."]),
        ("Box breathing", (4, 4, 4), ["In for 4, hold for 4, out for 4. Repeat for two minutes."]),
        ("Muscle release in your sleep restraint", None, ["Tense then release each muscle group from toes to face.",
         "Let the restraint hold you; no need to hold yourself.", "Keep light dim and warm; use earplugs and an eye mask."])]
PLAY = [("Rose, thorn, bud", ["Share one good thing from today (rose).", "Share one thing that was hard (thorn).", "Share something you look forward to (bud).", "What did a crewmate do this week that helped you?"]),
        ("Two truths and a lie", ["Say three things about your life; one is false. Others guess.", "Make yours about Earth, before the mission.", "Make yours about the funniest thing up here."]),
        ("Pass the story", ["Start a story with one sentence. Each person adds one.", "Theme: the crew finds a mysterious plant on the station.", "Theme: the first picnic on Mars."]),
        ("Earth talk", ["Describe a smell you miss from home.", "Describe the first meal you will cook when you land.", "Which place on Earth did you spot from the window today?"])]
FOOD = [("Oatmeal and berries", 380, 12, 24), ("Chicken and rice", 520, 28, 18), ("Beef stew pouch", 480, 30, 14), ("Tortilla and peanut butter", 420, 14, 30),
        ("Dried apple slices", 110, 1, 40), ("Protein bar", 200, 20, 36), ("Vegetable soup", 220, 8, 20), ("Cheese and crackers", 300, 11, 5)]
QS = ["I felt calm and relaxed", "I had energy for my tasks", "I felt connected to my crewmates", "I could focus well", "I felt hopeful about the days ahead"]


def sv(m, v):
    return 0 if m[3][0] <= v <= m[3][1] else 1 if m[4][0] <= v <= m[4][1] else 2


def sl_s(h): return 0 if h >= 7 else 1 if h >= 5.5 else 2
def md_s(s): return 0 if s >= 65 else 1 if s >= 45 else 2
def col(s): return T["gry"[s]] if False else T[("g", "y", "r")[s]]
def today(): return time.strftime("%Y-%m-%d")


def mk(i, name, role, av, pin, v, mood):
    return dict(id=i, name=name, role=role, av=av, pin=pin, v=v, ts=time.time() - 3600, rem=0, mood=[mood], rt=[310, 295], dg=[],
                sl=[dict(h=h, q=q) for h, q in [(7.5, 4), (6.8, 3), (7, 4), (6, 3), (7.2, 4)]], water=0, eat=[], ex=[], day=today())


def base(): return dict(hr=72, sys=112, spo2=97, temp=36.8, glu=92, co2=2400, rad=.6)


def seed():
    return dict(crew=[mk(1, "Mira Okafor", "Commander", "🌙", "1111", base(), 72),
                      mk(2, "Jonas Weiss", "Flight engineer", "🪐", "2222", {**base(), "spo2": 91, "hr": 108}, 40),
                      mk(3, "Aiko Tanaka", "Medical officer", "🦊", "3333", {**base(), "sys": 126}, 52)],
                inv=[dict(n=a, kcal=b, p=c, q=d) for a, b, c, d in FOOD], tank=140.0, cmd="0000", share=False, every=4)


def load():
    try:
        with open(PATH) as f: return json.load(f)
    except Exception: return seed()


def alerts(c):
    a = [f"{m[1]}: {c['v'][m[0]]} {m[2]}" for m in M if sv(m, c["v"][m[0]]) == 2]
    if c["sl"] and sl_s(c["sl"][-1]["h"]) == 2: a.append(f"Sleep: {c['sl'][-1]['h']} h")
    if c["mood"] and md_s(c["mood"][-1]) == 2: a.append("Mood check is low")
    return a


def worst(c):
    return max([sv(m, c["v"][m[0]]) for m in M] + [sl_s(c["sl"][-1]["h"]) if c["sl"] else 0, md_s(c["mood"][-1]) if c["mood"] else 0])


def nut(c):
    k = sum(e["kcal"] for e in c["eat"]); p = sum(e["p"] for e in c["eat"])
    return round(min(k / 2800, 1) * 40 + min(p / 90, 1) * 30 + min(c["water"] / 2500, 1) * 30)


# ---------- small widget helpers ----------
def lab(p, t, size=11, bold=False, fg=None, wrap=0, **kw):
    return tk.Label(p, text=t, font=("Helvetica", size, "bold" if bold else "normal"), fg=fg or T["ink"], bg=p["bg"],
                    anchor="w", justify="left", wraplength=wrap, **kw)


def btn(p, t, cmd, ghost=False, **kw):
    b = tk.Label(p, text=t, bg=T["card2"] if ghost else T["acc"], fg=T["ink"] if ghost else T["on"], padx=14, pady=6,
                 font=("Helvetica", 11, "bold"), cursor="hand2", **kw)
    b.bind("<Button-1>", lambda e: cmd())
    return b


def card(p, **kw):
    f = tk.Frame(p, bg=T["card"], padx=14, pady=12, **kw); f.pack(fill="x", pady=6); return f


def entry(p, w=10, **kw):
    return tk.Entry(p, width=w, bg=T["card2"], fg=T["ink"], insertbackground=T["ink"], relief="flat", font=("Helvetica", 11), **kw)


def click(w, fn):
    w.bind("<Button-1>", lambda e: fn()); w.configure(cursor="hand2")
    for ch in w.winfo_children(): click(ch, fn)


class Scroll(tk.Frame):
    def __init__(s, p):
        super().__init__(p, bg=T["bg"])
        c = tk.Canvas(s, bg=T["bg"], highlightthickness=0); sb = tk.Scrollbar(s, command=c.yview)
        c.configure(yscrollcommand=sb.set); sb.pack(side="right", fill="y"); c.pack(side="left", fill="both", expand=True)
        s.inner = tk.Frame(c, bg=T["bg"]); w = c.create_window((0, 0), window=s.inner, anchor="nw")
        s.inner.bind("<Configure>", lambda e: c.configure(scrollregion=c.bbox("all")))
        c.bind("<Configure>", lambda e: c.itemconfig(w, width=e.width))

        def wheel(e):
            try: c.yview_scroll(-1 if (e.delta > 0 or e.num == 4) else 1, "units")
            except tk.TclError: pass
        for seq in ("<MouseWheel>", "<Button-4>", "<Button-5>"): c.bind_all(seq, wheel)


class App(tk.Tk):
    def __init__(s):
        super().__init__(); s.title("Orbit Care"); s.geometry("1040x740"); s.minsize(820, 600)
        s.S = load(); s.cur = None; s.tab = "Today"; s.cmd = False; s.theme = "dark"; s.ans = [None] * 5
        s.banner = None; s.bj = None; s.rt_state = "idle"
        for c in s.S["crew"]:
            if c.get("day") != today(): c.update(day=today(), water=0, eat=[], ex=[])
        s.render(); s.after(30000, s.tick)

    # ---------- infra ----------
    def save(s):
        try:
            with open(PATH, "w") as f: json.dump(s.S, f)
        except OSError: pass

    def P(s): return next((c for c in s.S["crew"] if c["id"] == s.cur), None)

    def tick(s):
        for c in s.S["crew"]:
            if time.time() - c["ts"] > s.S["every"] * 3600 and not c["rem"]:
                c["rem"] = 1; s.remind(c, "vit")
        s.after(30000, s.tick)

    def remind(s, c, k):
        say, buzz = {"vit": ("it’s time for your vitals check", "two short pulses"), "water": ("please drink some water", "one long pulse"),
                     "sleep": ("time to wind down for sleep", "three soft pulses")}[k]
        if s.banner: s.banner.destroy()
        s.banner = tk.Label(s, text=f"🔊 Cabin announcement for {c['name']}: {say}.\n⌚ {c['name']}’s wrist band: {buzz}", bg=T["acc"], fg=T["on"],
                            font=("Helvetica", 12, "bold"), padx=18, pady=10)
        s.banner.place(relx=.5, y=8, anchor="n"); s.bell()
        s.after(7000, lambda b=s.banner: b.destroy() if b.winfo_exists() else None)
        def speak():
            try:
                import pyttsx3; e = pyttsx3.init(); e.say(f"{c['name']}, {say}"); e.runAndWait()
            except Exception: pass
        threading.Thread(target=speak, daemon=True).start()

    def toast(s, msg):
        t = tk.Label(s, text=msg, bg=T["acc"], fg=T["on"], font=("Helvetica", 12, "bold"), padx=16, pady=8); t.place(relx=.5, y=8, anchor="n")
        s.after(4000, t.destroy)

    def dialog(s, title):
        d = tk.Toplevel(s); d.title(title); d.configure(bg=T["card"], padx=22, pady=18); d.transient(s); d.resizable(False, False)
        d.update_idletasks(); d.geometry(f"+{s.winfo_x() + 300}+{s.winfo_y() + 100}"); d.after(50, d.grab_set); return d

    def pin(s, title, sub, check, done):
        d = s.dialog(title); v = []
        lab(d, title, 15, True).pack(); msg = lab(d, sub, 10, fg=T["mut"]); msg.pack(pady=4); dots = lab(d, "", 22, fg=T["acc"]); dots.pack()
        def draw(): dots.config(text=" ".join("●" if i < len(v) else "○" for i in range(4)))
        def press(k):
            if k == "✕": return d.destroy()
            if k == "⌫": v[:] = v[:-1]
            elif len(v) < 4: v.append(k)
            draw()
            if len(v) == 4:
                if check("".join(v)): d.destroy(); done()
                else: v.clear(); msg.config(text="Wrong code. Try again.", fg=T["r"]); draw()
        g = tk.Frame(d, bg=T["card"]); g.pack(pady=8)
        for i, k in enumerate([*"123456789", "✕", "0", "⌫"]):
            b = btn(g, k, lambda k=k: press(k), ghost=True, width=4); b.grid(row=i // 3, column=i % 3, padx=4, pady=4)
        draw()

    def open_profile(s, c):
        s.pin(f"{c['av']} {c['name']}", "Enter your 4-digit code", lambda v: v == c["pin"], lambda: s.go(cur=c["id"], tab="Today"))

    def go(s, **kw):
        for k, v in kw.items(): setattr(s, k, v)
        s.render()

    # ---------- main render ----------
    def render(s):
        if s.bj: s.after_cancel(s.bj); s.bj = None
        T.update(THEMES[s.theme]); s.configure(bg=T["bg"])
        for w in s.winfo_children():
            if w is not s.banner: w.destroy()
        top = tk.Frame(s, bg=T["bg"], padx=18, pady=12); top.pack(fill="x")
        body = Scroll(s); body.pack(fill="both", expand=True, padx=18); s.f = body.inner
        if s.cmd: return s.v_console(top)
        c = s.P()
        if not c: return s.v_home(top)
        left = tk.Frame(top, bg=T["bg"]); left.pack(side="left")
        a = lab(left, c["av"], 34); a.pack(side="left", padx=(0, 10)); click(a, s.change_av)
        info = tk.Frame(left, bg=T["bg"]); info.pack(side="left")
        lab(info, f"Hello, {c['name'].split()[0]}" if s.tab == "Today" else s.tab, 20, True).pack(anchor="w")
        w = worst(c); lab(info, f"{c['role']}. Lyra says: " + ("let’s look after you first." if w == 2 else "a few things to watch today." if w == 1 else "you’re doing great."), 10, fg=T["mut"]).pack(anchor="w")
        btn(top, "Lock profile", lambda: s.go(cur=None), True).pack(side="right")
        nav = tk.Frame(s, bg=T["bg"], padx=18); nav.pack(fill="x", before=body)
        for t in ("Today", "Vitals", "Sleep", "Fuel", "Move", "Mind"):
            btn(nav, t, lambda t=t: s.go(tab=t), ghost=t != s.tab).pack(side="left", padx=(0, 8), pady=(0, 8))
        getattr(s, "t_" + s.tab.lower())(c)

    # ---------- home ----------
    def tension(s):
        m = [c["mood"][-1] for c in s.S["crew"] if c["mood"]]; return bool(m) and sum(m) / len(m) < 60

    def v_home(s, top):
        h = tk.Frame(top, bg=T["bg"]); h.pack(side="left")
        lab(h, "Orbit Care ✨", 26, True).pack(); lab(h, "Who is checking in?", 11, fg=T["mut"]).pack()
        btn(top, "Command console", lambda: s.pin("Command console", "Authorized personnel only", lambda v: v == s.S["cmd"], lambda: s.go(cmd=True))).pack(side="right")
        btn(top, "Light / dark", lambda: s.go(theme="light" if s.theme == "dark" else "dark"), True).pack(side="right", padx=8)
        n = tk.Frame(s.f, bg=T["card2"], padx=14, pady=10); n.pack(fill="x", pady=8)
        t = s.tension()
        tk.Label(n, text="The crew mood has been dipping. A short activity together can help everyone relax." if t else "Crew mood looks steady.",
                 bg=T["card2"], fg=T["ink"], font=("Helvetica", 11, "bold")).pack(side="left")
        btn(n, "Start team time" if t else "Team time anyway", s.team, ghost=not t).pack(side="right")
        g = tk.Frame(s.f, bg=T["bg"]); g.pack(fill="x", pady=8)
        items = [(c["av"], c["name"], c["role"], lambda c=c: s.open_profile(c)) for c in s.S["crew"]] + [("＋", "Add crew", "Before launch", s.add_crew)]
        for i, (a, n_, r, fn) in enumerate(items):
            f = tk.Frame(g, bg=T["card"], padx=16, pady=18); f.grid(row=i // 4, column=i % 4, padx=8, pady=8, sticky="nsew"); g.columnconfigure(i % 4, weight=1)
            lab(f, a, 40).pack(); lab(f, n_, 12, True).pack(); lab(f, r, 10, fg=T["mut"]).pack(); click(f, fn)
        lab(s.f, "Demo codes: Mira 1111, Jonas 2222, Aiko 3333, Command 0000. Profiles are private by default.", 9, fg=T["mut"]).pack(anchor="w")

    def add_crew(s):
        d = s.dialog("Add crew"); av = [AV[0]]
        lab(d, "Add a crew member", 15, True).pack(); lab(d, "Pick a profile picture before launch.", 10, fg=T["mut"]).pack()
        g = tk.Frame(d, bg=T["card"]); g.pack(pady=8); labs = []
        def pick(a):
            av[0] = a
            for l in labs: l.config(bg=T["acc"] if l["text"] == a else T["card2"])
        for i, a in enumerate(AV):
            l = tk.Label(g, text=a, font=("Helvetica", 22), bg=T["acc"] if a == av[0] else T["card2"], padx=6, pady=2, cursor="hand2")
            l.grid(row=i // 6, column=i % 6, padx=3, pady=3); l.bind("<Button-1>", lambda e, a=a: pick(a)); labs.append(l)
        e = {}
        for k, ph in (("n", "Name"), ("r", "Role"), ("p", "4-digit code")):
            lab(d, ph, 10, fg=T["mut"]).pack(anchor="w"); e[k] = entry(d, 28); e[k].pack(pady=(0, 6), ipady=4)
        def save():
            n, p = e["n"].get().strip(), e["p"].get()
            if not n or not (p.isdigit() and len(p) == 4): return s.toast("Add a name and a 4-digit code.")
            s.S["crew"].append(mk(int(time.time()), n, e["r"].get() or "Crew", av[0], p, base(), 75)); s.save(); d.destroy(); s.render()
        btn(d, "Save", save).pack(pady=6)

    def change_av(s):
        d = s.dialog("Profile picture"); lab(d, "Choose your picture", 14, True).pack()
        g = tk.Frame(d, bg=T["card"]); g.pack(pady=8)
        for i, a in enumerate(AV):
            l = tk.Label(g, text=a, font=("Helvetica", 22), bg=T["card2"], padx=6, cursor="hand2"); l.grid(row=i // 6, column=i % 6, padx=3, pady=3)
            l.bind("<Button-1>", lambda e, a=a: (s.P().update(av=a), s.save(), d.destroy(), s.render()))

    def team(s):
        name, qs = random.choice(PLAY); d = s.dialog("Team time"); i = [0]
        lab(d, f"Team time: {name}", 15, True).pack(); lab(d, "Gather in the common area. About 10 minutes.", 10, fg=T["mut"]).pack(pady=4)
        q = tk.Label(d, text=qs[0], bg=T["card2"], fg=T["ink"], wraplength=360, font=("Helvetica", 12), padx=14, pady=14, justify="left"); q.pack(fill="x", pady=8)
        r = tk.Frame(d, bg=T["card"]); r.pack()
        btn(r, "Next prompt", lambda: (i.__setitem__(0, (i[0] + 1) % len(qs)), q.config(text=qs[i[0]]))).pack(side="left", padx=4)
        btn(r, "Another", lambda: (d.destroy(), s.team()), True).pack(side="left", padx=4); btn(r, "Done", d.destroy, True).pack(side="left", padx=4)

    # ---------- profile tabs ----------
    def tile(s, p, n, v, u, st, bang, r, c_):
        f = tk.Frame(p, bg=T["card2"], padx=12, pady=10, highlightthickness=2, highlightbackground=col(st) if st else T["card2"])
        f.grid(row=r, column=c_, padx=6, pady=6, sticky="nsew"); p.columnconfigure(c_, weight=1)
        h = tk.Frame(f, bg=T["card2"]); h.pack(fill="x"); tk.Label(h, text="●", fg=col(st), bg=T["card2"]).pack(side="left")
        lab(h, " " + n, 9, fg=T["mut"], bg=T["card2"]).pack(side="left")
        if bang and st == 2: tk.Label(h, text="!", bg=T["r"], fg="white", font=("Helvetica", 11, "bold"), width=2).pack(side="right")
        lab(f, f"{v} {u}", 16, True, bg=T["card2"]).pack(anchor="w"); lab(f, LV[st], 9, fg=T["mut"], bg=T["card2"]).pack(anchor="w")

    def t_today(s, c):
        al = alerts(c)
        if al:
            f = tk.Frame(s.f, bg=T["card"], padx=14, pady=10, highlightthickness=2, highlightbackground=T["r"]); f.pack(fill="x", pady=6)
            lab(f, "! Attention needed", 13, True, fg=T["r"]).pack(anchor="w"); lab(f, "\n".join(al) + "\nNotify the medical officer or flight surgeon.", 11).pack(anchor="w")
        if time.time() - c["ts"] > s.S["every"] * 3600: lab(s.f, "Your vitals check is due.", 12, True, fg=T["acc"]).pack(anchor="w", pady=4)
        g = tk.Frame(s.f, bg=T["bg"]); g.pack(fill="x"); L = c["sl"][-1] if c["sl"] else None; d = c["mood"][-1] if c["mood"] else None
        tiles = [(m[1], c["v"][m[0]], m[2], sv(m, c["v"][m[0]]), 1) for m in M if m[0] in ("hr", "spo2", "sys", "temp")]
        tiles += [("Last sleep", L["h"] if L else "–", "h", sl_s(L["h"]) if L else 0, 1), ("Mood", d if d is not None else "–", "/100", md_s(d) if d is not None else 0, 1),
                  ("Water today", c["water"], "ml", 0 if c["water"] >= 1500 else 1, 0), ("Nutrition", nut(c), "/100", 0 if nut(c) >= 60 else 1, 0)]
        for i, t in enumerate(tiles): s.tile(g, *t, i // 4, i % 4)
        if s.S["share"]:
            f = card(s.f); lab(f, "Crew status (sharing on)", 13, True).pack(anchor="w")
            for x in s.S["crew"]: lab(f, f"{x['av']} {x['name']}   ●  {LV[worst(x)]}", 11, fg=col(worst(x))).pack(anchor="w")

    def t_vitals(s, c):
        f = card(s.f); h = tk.Frame(f, bg=T["card"]); h.pack(fill="x")
        lab(h, f"Last logged {time.strftime('%H:%M', time.localtime(c['ts']))}. Checks every {s.S['every']} h.", 10, fg=T["mut"]).pack(side="left")
        btn(h, "Sync wrist monitor", s.sync).pack(side="right")
        for m in M:
            st = sv(m, c["v"][m[0]]); r = tk.Frame(f, bg=T["card"], pady=6); r.pack(fill="x")
            l = tk.Frame(r, bg=T["card"]); l.pack(side="left")
            lab(l, f"●  {m[1]}", 11, True, fg=col(st)).pack(anchor="w"); lab(l, f"Green {m[3][0]}–{m[3][1]} {m[2]}. {LV[st]}", 9, fg=T["mut"]).pack(anchor="w")
            e = entry(r, 8); btn(r, "Log", lambda m=m, e=e: s.log_v(m[0], e), True).pack(side="right"); e.pack(side="right", padx=8, ipady=3)
            lab(r, f"{c['v'][m[0]]} {m[2]}", 14, True).pack(side="right", padx=8)

    def log_v(s, k, e):
        try: x = float(e.get())
        except ValueError: return
        c = s.P(); c["v"][k] = x; c["ts"] = time.time(); c["rem"] = 0; s.save(); s.render()

    def sync(s):
        c = s.P()
        for m in M: c["v"][m[0]] = round(random.gauss(m[5][0], m[5][1] / 2), 2 if m[0] == "rad" else 1 if m[0] == "temp" else 0)
        c["ts"] = time.time(); c["rem"] = 0; s.save(); s.render(); s.toast("⌚ Wrist monitor synced.")

    def t_sleep(s, c):
        l = c["sl"][-7:]; avg = sum(x["h"] for x in l) / len(l); rec = min(100, round(avg / 8 * 60 + sum(x["q"] for x in l) / len(l) / 5 * 40))
        f = card(s.f); lab(f, "Rest and recovery", 14, True).pack(anchor="w")
        lab(f, f"Recovery score {rec}/100. Average {avg:.1f} h a night. Aim for 7 or more.", 11).pack(anchor="w")
        cv = tk.Canvas(f, height=110, bg=T["card"], highlightthickness=0); cv.pack(fill="x", pady=6)
        for i, x in enumerate(l):
            x0 = 20 + i * 70; cv.create_rectangle(x0, 105 - x["h"] * 10, x0 + 50, 105, fill=T["acc2"], outline=""); cv.create_text(x0 + 25, 98 - x["h"] * 10, text=str(x["h"]), fill=T["ink"])
        r = tk.Frame(f, bg=T["card"]); r.pack(fill="x"); lab(r, "Log last night: hours", 10).pack(side="left"); h = entry(r, 5); h.pack(side="left", padx=6)
        lab(r, "quality 1-5", 10).pack(side="left"); q = entry(r, 4); q.pack(side="left", padx=6); btn(r, "Save", lambda: s.log_s(h, q)).pack(side="left")
        f = card(s.f); lab(f, "Techniques to fall asleep", 14, True).pack(anchor="w")
        for t, p, steps in TECH:
            lab(f, t, 12, True, fg=T["acc"]).pack(anchor="w", pady=(8, 0))
            for i, x in enumerate(steps): lab(f, f"{i + 1}. {x}", 10, wrap=800).pack(anchor="w")
            if p: btn(f, "Start guided breathing", lambda p=p: s.breathe(p), True).pack(anchor="w", pady=4)
        s.cv = tk.Canvas(f, width=260, height=230, bg=T["card"], highlightthickness=0); s.cv.pack()

    def log_s(s, h, q):
        try: hh, qq = float(h.get()), int(q.get()); assert 1 <= qq <= 5
        except Exception: return s.toast("Enter hours and a quality from 1 to 5.")
        s.P()["sl"].append(dict(h=hh, q=qq)); s.save(); s.render()

    def breathe(s, p):
        if s.bj: s.after_cancel(s.bj)
        cv, names = s.cv, ("Breathe in", "Hold", "Breathe out")
        def run(n=0, i=0, rounds=0):
            if not cv.winfo_exists(): return
            steps = p[n] * 25; f = i / steps; r = 40 + 60 * (f if n == 0 else 1 if n == 1 else 1 - f)
            cv.delete("all"); cv.create_oval(130 - r, 110 - r, 130 + r, 110 + r, fill=T["acc2"], outline="")
            cv.create_text(130, 110, text=names[n], fill=T["on"], font=("Helvetica", 12, "bold"))
            if i < steps: s.bj = s.after(40, run, n, i + 1, rounds)
            else:
                n2 = (n + 1) % 3
                if n2 == 0 and rounds + 1 >= 4: return cv.create_text(130, 215, text="Well done", fill=T["ink"], font=("Helvetica", 12, "bold"))
                s.bj = s.after(40, run, n2, 0, rounds + (n2 == 0))
        run()

    def t_fuel(s, c):
        k = sum(e["kcal"] for e in c["eat"]); p = sum(e["p"] for e in c["eat"]); S = s.S
        f = card(s.f); lab(f, f"Nutrition score {nut(c)}/100", 14, True).pack(anchor="w")
        b = tk.Canvas(f, height=12, bg=T["card2"], highlightthickness=0); b.pack(fill="x", pady=4); b.update_idletasks()
        b.create_rectangle(0, 0, max(b.winfo_width(), 600) * nut(c) / 100, 12, fill=T["acc2"], outline="")
        lab(f, f"{k} of 2800 kcal. {p} of 90 g protein. {c['water']} of 2500 ml water.", 10, fg=T["mut"]).pack(anchor="w")
        cand = sorted([i for i in S["inv"] if i["q"] > 0 and sum(e["n"] == i["n"] for e in c["eat"]) < 2], key=lambda i: -(i["q"] + (i["p"] * 2 if p < 60 else 0)))
        if cand: lab(f, f"Suggested next meal: {cand[0]['n']} ({cand[0]['kcal']} kcal, {cand[0]['p']} g protein)", 11, True, fg=T["acc"]).pack(anchor="w", pady=6)
        r = tk.Frame(f, bg=T["card"]); r.pack(fill="x"); lab(r, f"Water reserve: {S['tank']:.1f} L" + (" (low)" if S["tank"] < 40 else ""), 11).pack(side="left")
        btn(r, "Test reminder", lambda: s.remind(c, "water"), True).pack(side="right", padx=4); btn(r, "+250 ml", s.drink).pack(side="right")
        f = card(s.f); lab(f, "Food on board", 14, True).pack(anchor="w")
        for i, it in enumerate(S["inv"]):
            r = tk.Frame(f, bg=T["card"], pady=4); r.pack(fill="x")
            lab(r, f"{it['n']}\n{it['kcal']} kcal. {it['p']} g protein. {it['q']} left" + (" (running low)" if it["q"] < 8 else ""), 10).pack(side="left")
            if it["q"]: btn(r, "I ate this", lambda i=i: s.eat(i), True).pack(side="right")
        f = card(s.f); lab(f, "Today’s log", 13, True).pack(anchor="w"); lab(f, ", ".join(e["n"] for e in c["eat"]) or "Nothing logged yet.", 10, fg=T["mut"], wrap=800).pack(anchor="w")

    def drink(s): c = s.P(); c["water"] += 250; s.S["tank"] = max(0, s.S["tank"] - .25); s.save(); s.render()

    def eat(s, i):
        it = s.S["inv"][i]
        if it["q"] > 0: it["q"] -= 1; s.P()["eat"].append(dict(n=it["n"], kcal=it["kcal"], p=it["p"])); s.save(); s.render()

    def t_move(s, c):
        light = worst(c) > 0 or (c["sl"] and c["sl"][-1]["h"] < 5.5); fa = .5 if light else 1
        pl = [("Treadmill run (harnessed)", 30), ("Resistance device (squats, deadlift, press)", 45), ("Cycle ergometer", 30), ("Mobility and stretching", 15)]
        f = card(s.f); lab(f, f"{'Light' if light else 'Full'} day: about {round(sum(x[1] for x in pl) * fa)} min", 14, True).pack(anchor="w")
        lab(f, "Your metrics or sleep say go easy. Halve each block, keep intensity low, and check with the medical officer if you feel unwell." if light else
            "Daily exercise protects muscle and bone in microgravity.", 10, fg=T["mut"], wrap=800).pack(anchor="w", pady=4)
        for i, (n, m) in enumerate(pl):
            v = tk.BooleanVar(value=i in c["ex"])
            tk.Checkbutton(f, text=f"{n}   {round(m * fa)} min", variable=v, command=lambda i=i: s.exer(i), bg=T["card"], fg=T["ink"], selectcolor=T["card2"],
                           activebackground=T["card"], activeforeground=T["ink"], font=("Helvetica", 11)).pack(anchor="w")
        lab(f, f"{len(c['ex'])} of 4 done", 10, fg=T["mut"]).pack(anchor="w", pady=4)

    def exer(s, i): c = s.P(); c["ex"] = [x for x in c["ex"] if x != i] if i in c["ex"] else c["ex"] + [i]; s.save()

    def t_mind(s, c):
        d = c["mood"][-1] if c["mood"] else None
        f = card(s.f); lab(f, "Mood check", 14, True).pack(anchor="w"); lab(f, "Rate each statement: 0 not at all, 3 very much.", 10, fg=T["mut"]).pack(anchor="w")
        for i, q in enumerate(QS):
            r = tk.Frame(f, bg=T["card"], pady=3); r.pack(fill="x"); lab(r, q, 11).pack(side="left")
            for n in (3, 2, 1, 0): btn(r, str(n), lambda i=i, n=n: (s.ans.__setitem__(i, n), s.render()), ghost=s.ans[i] != n).pack(side="right", padx=2)
        r = tk.Frame(f, bg=T["card"], pady=6); r.pack(fill="x"); btn(r, "Save mood check", s.save_mood).pack(side="left")
        lab(r, f"   Latest score: {d if d is not None else 'none'}", 10, fg=T["mut"]).pack(side="left")
        if d is not None and d < 45: lab(f, "You’ve had a hard stretch. Consider talking with the medical officer or a ground psychologist. Reaching out is part of the mission.", 11, True, fg=T["acc"], wrap=800).pack(anchor="w")
        f = card(s.f); lab(f, "Reaction test", 14, True).pack(anchor="w")
        s.rt = tk.Label(f, text="Tap to start. Tap again when the box turns yellow.", bg=T["card2"], fg=T["ink"], font=("Helvetica", 12, "bold"), pady=28, cursor="hand2")
        s.rt.pack(fill="x", pady=6); s.rt.bind("<Button-1>", lambda e: s.rt_click()); s.rt_state = "idle"
        lab(f, "Recent: " + (", ".join(map(str, c["rt"][-5:])) or "none") + " ms", 10, fg=T["mut"]).pack(anchor="w")
        f = card(s.f); lab(f, "Memory test", 14, True).pack(anchor="w"); s.dg = tk.Frame(f, bg=T["card"]); s.dg.pack(anchor="w", pady=6)
        btn(s.dg, "Show 5 digits", s.dg_go).pack(); lab(f, "Recent results: " + (" ".join("✓" if x else "✗" for x in c["dg"][-5:]) or "none"), 10, fg=T["mut"]).pack(anchor="w")

    def save_mood(s):
        if None in s.ans: return s.toast("Answer all five statements first.")
        s.P()["mood"].append(round(sum(s.ans) / 15 * 100)); s.ans = [None] * 5; s.save(); s.render()

    def rt_click(s):
        if s.rt_state == "idle":
            s.rt_state = "wait"; s.rt.config(text="Wait for yellow…")
            s.rj = s.after(int(1200 + random.random() * 2500), lambda: (setattr(s, "rt_state", "go"), setattr(s, "t0", time.perf_counter()), s.rt.config(bg=T["y"], fg="#222", text="Tap now!")))
        elif s.rt_state == "wait": s.after_cancel(s.rj); s.rt_state = "idle"; s.rt.config(text="Too soon. Tap to try again.")
        else: s.P()["rt"].append(round((time.perf_counter() - s.t0) * 1000)); s.save(); s.render()

    def dg_go(s):
        n = "".join(random.choice("0123456789") for _ in range(5))
        for w in s.dg.winfo_children(): w.destroy()
        lab(s.dg, n, 28, True).pack()
        def ask():
            if not s.dg.winfo_exists(): return
            for w in s.dg.winfo_children(): w.destroy()
            e = entry(s.dg, 8); e.pack(side="left", ipady=3); e.focus_set(); btn(s.dg, "Check", lambda: s.dg_chk(n, e.get())).pack(side="left", padx=8)
        s.after(2200, ask)

    def dg_chk(s, n, v): s.P()["dg"].append(1 if v == n else 0); s.save(); s.render(); s.toast("Correct. Nicely done." if v == n else f"Not quite. It was {n}")

    # ---------- command console ----------
    def v_console(s, top):
        S = s.S; lab(top, "Command console", 22, True).pack(side="left"); btn(top, "Lock and exit", lambda: s.go(cmd=False), True).pack(side="right")
        f = card(s.f); heads = ["Crew", "Overall", "HR", "SpO₂", "BP", "Temp", "Sleep", "Mood", "Alerts"]
        for j, h in enumerate(heads): lab(f, h, 10, True, fg=T["mut"]).grid(row=0, column=j, padx=8, sticky="w")
        for i, c in enumerate(S["crew"], 1):
            L = c["sl"][-1]["h"] if c["sl"] else "–"; d = c["mood"][-1] if c["mood"] else "–"; a = alerts(c); w = worst(c)
            vals = [f"{c['av']} {c['name']}", f"● {LV[w]}", c["v"]["hr"], c["v"]["spo2"], c["v"]["sys"], c["v"]["temp"], f"{L} h", d, f"! {len(a)}" if a else "–"]
            for j, v in enumerate(vals): lab(f, str(v), 11, fg=col(w) if j == 1 else T["r"] if j == 8 and a else None).grid(row=i, column=j, padx=8, pady=4, sticky="w")
        f = card(s.f); lab(f, "Settings", 14, True).pack(anchor="w")
        r = tk.Frame(f, bg=T["card"], pady=4); r.pack(fill="x"); lab(r, "Let crew see each other’s status", 11).pack(side="left")
        btn(r, "On" if S["share"] else "Off", lambda: (S.__setitem__("share", not S["share"]), s.save(), s.render()), True).pack(side="right")
        r = tk.Frame(f, bg=T["card"], pady=4); r.pack(fill="x"); lab(r, "Vitals reminder every (hours)", 11).pack(side="left")
        e = entry(r, 5); e.insert(0, S["every"]); btn(r, "Set", lambda: (S.__setitem__("every", max(1, int(e.get() or 4))), s.save(), s.toast("Saved."))).pack(side="right"); e.pack(side="right", padx=8)
        r = tk.Frame(f, bg=T["card"], pady=4); r.pack(fill="x"); lab(r, "Test reminders", 11).pack(side="left")
        for c in S["crew"]: btn(r, c["av"], lambda c=c: s.remind(c, "vit"), True).pack(side="right", padx=3)
        r = tk.Frame(f, bg=T["card"], pady=4); r.pack(fill="x"); lab(r, "Reset demo data", 11).pack(side="left")
        btn(r, "Reset", lambda: (setattr(s, "S", seed()), s.save(), s.render()), True).pack(side="right")
        lab(s.f, "Demo only: codes are stored unencrypted in " + PATH + ". Not a medical device.", 9, fg=T["mut"]).pack(anchor="w")


if __name__ == "__main__":
    App().mainloop()
