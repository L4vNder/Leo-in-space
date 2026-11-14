"use strict";

(() => {
  const STORAGE_KEY = "orbitwell-state-v1";
  const WATER_GOAL_ML = 2400;
  const GLASS_ML = 250;
  const QUEST_XP = { checkup: 20, water: 10, meal: 15, sleep: 15 };
  const metrics = {
    heart: { label: "Heart rate", value: "68 bpm", detail: "Resting" },
    pressure: { label: "Blood pressure", value: "112/72 mmHg", detail: "Seated" },
    oxygen: { label: "Blood oxygen", value: "98%", detail: "Resting" },
    temperature: { label: "Body temperature", value: "36.6 °C", detail: "At rest" }
  };
  const steps = [
    { key: "heart", icon: "i-heart", label: "Heart rate", caption: "A calm moment, just for you." },
    { key: "pressure", icon: "i-waves", label: "Blood pressure", caption: "Picture sitting quietly before a reading." },
    { key: "oxygen", icon: "i-scan", label: "Blood oxygen", caption: "Breathe in slowly, then out." },
    { key: "temperature", icon: "i-thermometer", label: "Body temperature", caption: "Take a mindful body-temperature check." }
  ];
  const defaults = {
    waterMl: 1600,
    meals: 2,
    sleep: 7.8,
    sleepQuality: "Rested",
    quests: { checkup: false, water: false, meal: false, sleep: false },
    checkedAt: null
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!saved || typeof saved !== "object") return structuredClone(defaults);
      return {
        ...structuredClone(defaults),
        ...saved,
        waterMl: Math.max(0, Math.min(WATER_GOAL_ML, Number(saved.waterMl) || 0)),
        meals: Math.max(0, Math.min(3, Number(saved.meals) || 0)),
        sleep: Math.max(0, Math.min(24, Number(saved.sleep) || defaults.sleep)),
        quests: { ...defaults.quests, ...(saved.quests || {}) }
      };
    } catch (error) {
      console.warn("Orbitwell could not load saved demo data.", error);
      return structuredClone(defaults);
    }
  }

  let state = loadState();

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn("Orbitwell could not save demo data.", error);
      showToast("Your browser couldn't save this update. It will last until you close this tab.");
    }
  }

  function formatLiters(ml) {
    return (ml / 1000).toFixed(2).replace(/0$/, "").replace(/\.$/, "");
  }

  function render() {
    const waterMl = state.waterMl;
    const waterPct = Math.round((waterMl / WATER_GOAL_ML) * 100);
    const glasses = Math.round(waterMl / GLASS_ML);
    const xp = Object.entries(QUEST_XP).reduce(
      (total, [key, points]) => total + (state.quests[key] ? points : 0), 0
    );

    $("#water-reading").innerHTML = `${formatLiters(waterMl)}<small> L</small>`;
    $("#water-progress").style.width = `${waterPct}%`;
    $("#hydration-percent").textContent = `${waterPct}% GOAL`;
    $("#hydration-meter").setAttribute("aria-valuenow", String(waterPct));
    $("#bottle-water").setAttribute("d", `M15 ${105 - waterPct * 0.58}q15-9 30 0t36 0v48H15Z`);
    $("#bottle-number").innerHTML = `${formatLiters(waterMl)} <small>L</small>`;
    $("#hydration-glasses").innerHTML = `${glasses} <small>/ 8 glasses</small>`;
    $("#hydration-bar").style.width = `${waterPct}%`;
    $("#water-encouragement").textContent = waterPct >= 100
      ? "Daily water goal reached ✨" : waterPct >= 50 ? "You’re doing great ✨" : "Every glass is a good start ✨";

    $("#nutrition-count").textContent = String(state.meals);
    $("#meal-progress").textContent = `${state.meals} meal${state.meals === 1 ? "" : "s"} logged`;
    $$(".meal-dot").forEach((dot, index) => dot.classList.toggle("eaten", index < state.meals));
    $(".meal-dots").setAttribute("aria-label", `${state.meals} of 3 meals logged`);

    $("#sleep-value").textContent = state.sleep.toFixed(1);
    $("#sleep-card .metric-trend").textContent = state.sleepQuality.toUpperCase();
    $$(".quest-check").forEach(input => { input.checked = Boolean(state.quests[input.dataset.quest]); });
    $("#xp-earned").textContent = String(xp);
    $("#xp-progress").style.width = `${Math.round((xp / 60) * 100)}%`;
  }

  let toastTimer;
  function showToast(message, action) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#i-check"></use></svg>';
    const text = document.createElement("span");
    text.textContent = message;
    toast.append(text);
    if (action) {
      const undo = document.createElement("button");
      undo.type = "button";
      undo.className = "toast-undo";
      undo.textContent = "Undo";
      undo.addEventListener("click", () => {
        clearTimeout(toastTimer);
        action();
        toast.remove();
      }, { once: true });
      toast.append(undo);
    }
    const region = $("#toast-region");
    region.replaceChildren(toast);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.remove(), 3500);
  }

  function setQuest(key, completed, message) {
    const wasCompleted = Boolean(state.quests[key]);
    state.quests[key] = completed;
    saveState();
    render();
    if (message) {
      showToast(message, wasCompleted && completed === false ? () => {
        state.quests[key] = true;
        saveState();
        render();
      } : null);
    }
  }

  const checkupDialog = $("#checkup-dialog");
  const dialogAction = $("#dialog-action");
  let checkupStage = "ready";
  let currentStep = 0;
  let scanBusy = false;
  let scanTimeout;

  function openCheckup() {
    checkupStage = "ready";
    currentStep = 0;
    scanBusy = false;
    renderCheckup();
    if (!checkupDialog.open) checkupDialog.showModal();
  }

  function renderCheckup() {
    const container = $("#checkup-steps");
    container.replaceChildren();
    steps.forEach((step, index) => {
      const row = document.createElement("div");
      const completed = checkupStage === "complete" || (checkupStage === "scanning" && index < currentStep);
      const active = checkupStage === "scanning" && index === currentStep;
      row.className = `checkup-step${completed ? " completed" : ""}${active ? " scanning" : ""}`;
      const icon = document.createElement("span");
      icon.className = "checkup-step-icon";
      icon.innerHTML = `<svg class="icon" aria-hidden="true"><use href="#${completed ? "i-check" : step.icon}"></use></svg>`;
      const copy = document.createElement("span");
      copy.className = "checkup-step-copy";
      const label = document.createElement("strong");
      label.textContent = step.label;
      const caption = document.createElement("span");
      caption.textContent = completed ? "Check-in complete" : active ? "Taking a mindful moment…" : step.caption;
      copy.append(label, caption);
      row.append(icon, copy);
      if (completed) {
        const value = document.createElement("span");
        value.className = "checkup-step-value";
        value.textContent = metrics[step.key].value;
        row.append(value);
      }
      container.append(row);
    });

    if (checkupStage === "complete") {
      $("#dialog-title").textContent = "Check-in complete!";
      $("#dialog-description").textContent = "You took a moment for yourself. These sample readings are here to help you explore the demo.";
      $("#dialog-note").innerHTML = '<svg class="icon"><use href="#i-sparkle"></use></svg><span>Nice work showing up for yourself. Your wellbeing mission is one step further along.</span>';
      dialogAction.innerHTML = 'Back to dashboard <svg class="icon"><use href="#i-arrow"></use></svg>';
      checkupDialog.dataset.stage = "complete";
    } else {
      $("#dialog-title").textContent = checkupStage === "scanning" ? "One moment, Cadet…" : "How are you feeling?";
      $("#dialog-description").textContent = checkupStage === "scanning"
        ? "Take a slow breath and check in with how you feel."
        : "Take a quiet moment. This demo shows sample readings—it doesn't measure your actual health.";
      $("#dialog-note").innerHTML = '<svg class="icon"><use href="#i-radio"></use></svg><span>No sensors connected. Readings are illustrative, not medical measurements.</span>';
      const actionLabel = checkupStage === "scanning"
        ? `Check your ${steps[currentStep]?.label.toLowerCase() || "health"}`
        : "Start check-in";
      dialogAction.innerHTML = `${checkupStage === "scanning" ? actionLabel : "Start check-in"} <svg class="icon"><use href="#i-arrow"></use></svg>`;
      checkupDialog.dataset.stage = checkupStage;
    }
    dialogAction.disabled = scanBusy;
    $("#dialog-cancel").hidden = checkupStage === "complete";
  }

  function startCheckupStep() {
    if (checkupStage === "complete") {
      checkupDialog.close();
      return;
    }
    if (checkupStage === "ready") {
      checkupStage = "scanning";
      currentStep = 0;
    }
    if (checkupStage !== "scanning" || scanBusy) return;
    scanBusy = true;
    renderCheckup();
    clearTimeout(scanTimeout);
    scanTimeout = setTimeout(() => {
      scanBusy = false;
      currentStep += 1;
      if (currentStep >= steps.length) {
        checkupStage = "complete";
        state.checkedAt = new Date().toISOString();
        setQuest("checkup", true);
        showToast("Morning body scan complete. +20 XP earned!");
      }
      renderCheckup();
    }, 750);
  }

  $("#start-checkup").addEventListener("click", openCheckup);
  $$('[data-action="checkup"]').forEach(link => link.addEventListener("click", event => {
    event.preventDefault();
    openCheckup();
  }));
  dialogAction.addEventListener("click", startCheckupStep);
  $("#dialog-cancel").addEventListener("click", () => checkupDialog.close());
  checkupDialog.addEventListener("close", () => {
    clearTimeout(scanTimeout);
    checkupStage = "ready";
    currentStep = 0;
    scanBusy = false;
  });

  function logWater() {
    if (state.waterMl >= WATER_GOAL_ML) {
      showToast("Your daily hydration goal is complete. Lovely work!");
      return;
    }
    state.waterMl = Math.min(WATER_GOAL_ML, state.waterMl + GLASS_ML);
    saveState();
    render();
    if (!state.quests.water) {
      setQuest("water", true);
      showToast("+250 ml logged. Hydration mission complete! +10 XP");
    } else {
      showToast(`${formatLiters(state.waterMl)} L logged. Keep it up!`);
    }
  }
  $("#add-water").addEventListener("click", logWater);

  function openSleepLog() {
    sleepQuality = state.sleepQuality;
    $("#sleep-hours").value = state.sleep.toFixed(1);
    $("#sleep-validation").textContent = "";
    $$(".quality-button").forEach(button => button.classList.toggle("selected", button.dataset.quality === state.sleepQuality));
    if (!$("#sleep-dialog").open) $("#sleep-dialog").showModal();
  }
  $("#sleep-card").addEventListener("click", openSleepLog);
  let sleepQuality = state.sleepQuality;
  $$(".quality-button").forEach(button => button.addEventListener("click", () => {
    sleepQuality = button.dataset.quality;
    $$(".quality-button").forEach(option => option.classList.toggle("selected", option === button));
  }));
  $("#save-sleep").addEventListener("click", () => {
    const input = $("#sleep-hours");
    const hours = Number(input.value);
    if (!Number.isFinite(hours) || hours < 0 || hours > 24) {
      $("#sleep-validation").textContent = "Enter a number between 0 and 24 hours.";
      input.focus();
      return;
    }
    state.sleep = Math.round(hours * 2) / 2;
    state.sleepQuality = sleepQuality;
    $("#sleep-dialog").close();
    saveState();
    render();
    if (!state.quests.sleep) {
      setQuest("sleep", true);
      showToast("Sleep log saved. Recovery mission complete! +15 XP");
    } else {
      showToast("Sleep log saved. Rest up, Cadet!");
    }
  });

  $$(".quest-check").forEach(input => input.addEventListener("change", () => {
    const key = input.dataset.quest;
    const completed = input.checked;
    setQuest(key, completed, completed ? `Mission complete! +${QUEST_XP[key]} XP earned!` : "Mission unchecked.");
    if (key === "checkup" && completed && checkupStage !== "complete") {
      state.checkedAt = state.checkedAt || new Date().toISOString();
      saveState();
    }
    if (key === "water" && completed && state.waterMl < GLASS_ML) {
      state.waterMl = GLASS_ML;
      saveState();
      render();
    }
    if (key === "meal" && completed && state.meals === 0) {
      state.meals = 1;
      saveState();
      render();
    }
  }));

  $("#nutrition-card").addEventListener("click", () => {
    if (state.meals >= 3) {
      showToast("All three meals are logged. Well fueled, Cadet!");
      return;
    }
    state.meals += 1;
    saveState();
    render();
    if (!state.quests.meal) {
      setQuest("meal", true);
      showToast(`Meal ${state.meals} logged. Fuel mission complete! +15 XP`);
    } else {
      showToast(`Meal ${state.meals} of 3 logged. Keep fueling your mission!`);
    }
  });

  $$('[data-metric="heart"], [data-metric="pressure"], [data-metric="oxygen"], [data-metric="temperature"]')
    .forEach(button => button.addEventListener("click", openCheckup));
  $('[data-metric="hydration"]').addEventListener("click", () => {
    $("#nutrition").scrollIntoView({ behavior: "smooth", block: "center" });
    $("#add-water").focus({ preventScroll: true });
  });

  $("#reset-button").addEventListener("click", () => {
    const hadProgress = JSON.stringify(state) !== JSON.stringify(defaults);
    if (!hadProgress) {
      showToast("Your demo data is already at its starting point.");
      return;
    }
    const previousState = state;
    state = structuredClone(defaults);
    saveState();
    render();
    showToast("Demo data reset.", () => {
      state = previousState;
      saveState();
      render();
    });
  });

  const navSectionMap = {
    dashboard: "#dashboard",
    recovery: "#recovery",
    nutrition: "#nutrition",
    progress: "#recovery"
  };
  $$("[data-section]").forEach(link => link.addEventListener("click", event => {
    const section = link.dataset.section;
    const target = navSectionMap[section];
    if (!target) return;
    event.preventDefault();
    $$(".nav-link").forEach(item => item.classList.toggle("active", item === link));
    $(target).scrollIntoView({ behavior: "smooth", block: section === "dashboard" ? "start" : "center" });
    if (section === "progress") showToast("Your daily progress and flight plan are right below!");
  }));
  $("#view-all-metrics").addEventListener("click", () => {
    openCheckup();
  });

  sleepQuality = state.sleepQuality;
  render();
})();
