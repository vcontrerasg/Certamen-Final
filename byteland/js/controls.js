

window.Controls = (function() {

  
  const ACTIONS = {
    up:       { label: "Mover Arriba",     default: "ArrowUp"    },
    down:     { label: "Mover Abajo",      default: "ArrowDown"  },
    left:     { label: "Mover Izquierda",  default: "ArrowLeft"  },
    right:    { label: "Mover Derecha",    default: "ArrowRight" },
    interact: { label: "Interactuar / OK", default: "z"          },
    cancel:   { label: "Cancelar / Volver",default: "x"          },
    fight:    { label: "Luchar",           default: "1"          },
    act:      { label: "Actuar",           default: "2"          },
    mercy:    { label: "Piedad",           default: "3"          },
    item:     { label: "Ítems",            default: "4"          }
  };

  let bindings = {};
  let pressedKeys = new Set();
  let listeningFor = null;

  
  function load() {
    const saved = localStorage.getItem("byteland_controls");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        
        for (const action in ACTIONS) {
          bindings[action] = parsed[action] || ACTIONS[action].default;
        }
      } catch(e) {
        resetToDefaults();
      }
    } else {
      resetToDefaults();
    }
  }

  function resetToDefaults() {
    for (const action in ACTIONS) {
      bindings[action] = ACTIONS[action].default;
    }
    save();
  }

  function save() {
    localStorage.setItem("byteland_controls", JSON.stringify(bindings));
  }

  
  function formatKey(key) {
    const map = {
      "ArrowUp":    "↑",
      "ArrowDown":  "↓",
      "ArrowLeft":  "←",
      "ArrowRight": "→",
      " ":          "SPACE",
      "Enter":      "ENTER",
      "Escape":     "ESC",
      "Shift":      "SHIFT",
      "Control":    "CTRL",
      "Alt":        "ALT"
    };
    return map[key] || key.toUpperCase();
  }

  
  function onKeyDown(e) {
    pressedKeys.add(e.key.toLowerCase());
    pressedKeys.add(e.key);

    if (listeningFor) {
      
      if (["Shift","Control","Alt","Meta","CapsLock"].includes(e.key)) return;
      e.preventDefault();
      bindings[listeningFor] = e.key;
      save();
      const row = document.querySelector(`.ctrl-row[data-action="${listeningFor}"]`);
      if (row) {
        row.classList.remove("listening");
        row.querySelector(".ctrl-key").textContent = formatKey(e.key);
      }
      listeningFor = null;
      return;
    }
  }

  function onKeyUp(e) {
    pressedKeys.delete(e.key.toLowerCase());
    pressedKeys.delete(e.key);
  }

  
  function isPressed(action) {
    const key = bindings[action];
    return pressedKeys.has(key) || pressedKeys.has(key.toLowerCase());
  }

  function isKeyDown(key) {
    return pressedKeys.has(key) || pressedKeys.has(key.toLowerCase());
  }

  
  function renderControlsUI() {
    const grid = document.getElementById("controls-grid");
    if (!grid) return;
    grid.innerHTML = "";

    for (const action in ACTIONS) {
      const row = document.createElement("div");
      row.className = "ctrl-row";
      row.dataset.action = action;
      row.innerHTML = `
        <span class="ctrl-label">${ACTIONS[action].label}</span>
        <span class="ctrl-key">${formatKey(bindings[action])}</span>
      `;
      row.addEventListener("click", () => {
        
        if (listeningFor) {
          const prev = document.querySelector(`.ctrl-row[data-action="${listeningFor}"]`);
          if (prev) prev.classList.remove("listening");
        }
        listeningFor = action;
        row.classList.add("listening");
        row.querySelector(".ctrl-key").textContent = "...";
      });
      grid.appendChild(row);
    }
  }

  
  function updateHints() {
    const el = document.getElementById("key-interact-hint");
    if (el) el.textContent = formatKey(bindings.interact);
  }

  
  function init() {
    load();
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup",   onKeyUp);

    
    document.addEventListener("mousemove", (e) => {
      document.documentElement.style.setProperty("--cx", e.clientX + "px");
      document.documentElement.style.setProperty("--cy", e.clientY + "px");
    });

    renderControlsUI();
    updateHints();
  }

  return {
    init,
    isPressed,
    isKeyDown,
    formatKey,
    renderControlsUI,
    updateHints,
    getBindings: () => ({ ...bindings })
  };

})();
