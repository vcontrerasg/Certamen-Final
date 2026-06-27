window.Dialogue = (function() {

  let lines = [];
  let currentLine = 0;
  let typeTimer = null;
  let charIndex = 0;
  let isTyping = false;
  let onFinished = null;
  let canAdvance = false;

  const TYPING_SPEED = 25;
  const TERMINAL_SPEED = 8;

  // Mapa de speaker → clave de voz de Audio
  const SPEAKER_VOICE_MAP = {
    "víctor":   "victor",
    "victor":   "victor",
    "fabián":   "fabian",
    "fabian":   "fabian",
    "sebastián":"seba",
    "sebastian":"seba",
    "seba":     "seba",
    "sistema":  "sistema",
    "byteos 4.2": "sistema",
    "el profesor": "sistema",
    "reparado": "sistema",
    "derrota enemiga": "sistema",
    "* ":       "default"
  };

  function _getSpeakerKey(speaker) {
    if (!speaker) return "default";
    const low = speaker.toLowerCase().trim();
    return SPEAKER_VOICE_MAP[low] || "default";
  }

  function els() {
    return {
      portrait:    document.getElementById("dialogue-portrait"),
      placeholder: document.getElementById("dialogue-portrait-placeholder"),
      speaker:     document.getElementById("dialogue-speaker"),
      text:        document.getElementById("dialogue-text"),
      arrow:       document.getElementById("dialogue-arrow")
    };
  }

  function show(dialogueLines, callback) {
    lines = dialogueLines;
    currentLine = 0;
    onFinished = callback;

    const screen = document.getElementById("screen-dialogue");
    screen.classList.add("active");

    showLine(0);
    setupInput();
  }

  function showLine(idx) {
    if (idx >= lines.length) {
      hide();
      return;
    }

    currentLine = idx;
    const line = lines[idx];
    const e = els();

    e.speaker.textContent = line.speaker || "";
    e.speaker.style.color = "";

    const isTerminal = line.speaker && (
      line.speaker.startsWith("> TERMINAL") ||
      line.speaker === "SISTEMA" ||
      line.speaker === "ITEM"
    );
    if (isTerminal) {
      e.speaker.style.color = "#00ffff";
    }

    if (line.portrait) {
      e.portrait.src = line.portrait;
      e.portrait.style.display = "block";
      e.placeholder.style.display = "none";
      applyPortraitEmotion(e.portrait, line.emotion);
    } else {
      e.portrait.style.display = "none";
      e.placeholder.style.display = "flex";
      if (isTerminal) {
        e.placeholder.textContent = "💻";
      } else if (line.speaker === "ITEM") {
        e.placeholder.textContent = "🎁";
      } else {
        e.placeholder.textContent = "❤";
      }
    }

    e.text.textContent = "";
    e.arrow.style.opacity = "0";
    isTyping = true;
    canAdvance = false;
    charIndex = 0;

    const fullText = line.text || "";
    const speed = isTerminal ? TERMINAL_SPEED : TYPING_SPEED;
    const voiceKey = _getSpeakerKey(line.speaker);

    clearInterval(typeTimer);
    typeTimer = setInterval(() => {
      if (charIndex < fullText.length) {
        const ch = fullText[charIndex];
        e.text.textContent += ch;
        // Sonido de voz solo en caracteres visibles (no espacios ni saltos)
        if (ch !== " " && ch !== "\n" && ch !== "\t") {
          if (typeof Audio !== "undefined" && Audio.playChar) {
            Audio.playChar(voiceKey);
          }
        }
        charIndex++;
      } else {
        clearInterval(typeTimer);
        isTyping = false;
        e.arrow.style.opacity = "1";
        setTimeout(() => { canAdvance = true; }, 80);
      }
    }, speed);
  }

  function applyPortraitEmotion(img, emotion) {
    img.style.filter = "none";
    if (emotion === "triste") {
      img.style.filter = "grayscale(0.3) brightness(0.85)";
    } else if (emotion === "feliz") {
      img.style.filter = "brightness(1.1) saturate(1.2)";
    }
  }

  function advance() {
    if (isTyping) {
      clearInterval(typeTimer);
      isTyping = false;
      const line = lines[currentLine];
      const e = els();
      e.text.textContent = line.text || "";
      e.arrow.style.opacity = "1";
      setTimeout(() => { canAdvance = true; }, 60);
      return;
    }

    if (!canAdvance) return;

    Audio.playConfirm();
    canAdvance = false;
    currentLine++;
    if (currentLine < lines.length) {
      showLine(currentLine);
    } else {
      hide();
    }
  }

  function hide() {
    clearInterval(typeTimer);
    const screen = document.getElementById("screen-dialogue");
    screen.classList.remove("active");
    removeInput();
    if (onFinished) {
      const cb = onFinished;
      onFinished = null;
      cb();
    }
  }

  let keyHandler = null;
  let clickHandler = null;

  function setupInput() {
    setTimeout(() => {
      keyHandler = (e) => {
        if (
          e.key === "z" || e.key === "Z" ||
          e.key === " " ||
          e.key === "Enter" ||
          e.key === "x" || e.key === "X"
        ) {
          e.preventDefault();
          advance();
        }
        const bindings = Controls.getBindings();
        if (
          e.key === bindings.interact ||
          e.key.toLowerCase() === bindings.interact.toLowerCase()
        ) {
          e.preventDefault();
          advance();
        }
      };
      document.addEventListener("keydown", keyHandler);

      clickHandler = () => advance();
      const screen = document.getElementById("screen-dialogue");
      if (screen) screen.addEventListener("click", clickHandler);
    }, 200);
  }

  function removeInput() {
    if (keyHandler) {
      document.removeEventListener("keydown", keyHandler);
      keyHandler = null;
    }
    if (clickHandler) {
      const screen = document.getElementById("screen-dialogue");
      if (screen) screen.removeEventListener("click", clickHandler);
      clickHandler = null;
    }
  }

  return { show };

})();
