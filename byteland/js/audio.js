window.Audio = (function () {
  let ctx = null;
  let masterGain = null;
  let musicGain = null;
  let sfxGain = null;

  let musicVolume = 0.45;
  let sfxVolume = 0.6;

  let currentBGM = null;
  let bgmNodes = [];
  let bgmLoopRef = null;
  let fadingOut = false;


  function init() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = ctx.createGain();
    masterGain.gain.value = 1;
    masterGain.connect(ctx.destination);

    musicGain = ctx.createGain();
    musicGain.gain.value = musicVolume;
    musicGain.connect(masterGain);

    sfxGain = ctx.createGain();
    sfxGain.gain.value = sfxVolume;
    sfxGain.connect(masterGain);

    // Desbloquear contexto en iOS/Chrome
    document.addEventListener("click", _resume, { once: true });
    document.addEventListener("keydown", _resume, { once: true });
  }

  function _resume() {
    if (ctx && ctx.state === "suspended") {
      ctx.resume().then(() => {
        if (currentBGM && !fadingOut) {
          const name = currentBGM;
          _stopBGMNodes();
          currentBGM = name;
          fadingOut = false;
          const fn = bgmMap[name];
          if (fn) fn();
        }
      });
    }
  }

  function _ensure() {
    if (!ctx) init();
    _resume();
  }

  function _osc(type, freq, startTime, duration, vol, dest, detune) {
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, startTime);
    g.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
    g.connect(dest);

    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq, startTime);
    if (detune) o.detune.setValueAtTime(detune, startTime);
    o.connect(g);
    o.start(startTime);
    o.stop(startTime + duration + 0.05);
    return o;
  }

  function _noise(startTime, duration, vol, dest, cutoff) {
    const bufSize = ctx.sampleRate * duration;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) d[i] = Math.random() * 2 - 1;

    const src = ctx.createBufferSource();
    src.buffer = buf;

    const filt = ctx.createBiquadFilter();
    filt.type = "lowpass";
    filt.frequency.value = cutoff || 800;

    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, startTime);
    g.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    src.connect(filt);
    filt.connect(g);
    g.connect(dest);
    src.start(startTime);
    src.stop(startTime + duration + 0.05);
    return src;
  }

  function _arp(freqs, startTime, noteLen, vol, dest, type) {
    freqs.forEach((f, i) => {
      _osc(type || "square", f, startTime + i * noteLen, noteLen * 0.85, vol, dest);
    });
  }

  const charVoices = {
    victor:  { freq: 440, type: "square",   vol: 0.08, dur: 0.04 },
    fabian:  { freq: 340, type: "triangle", vol: 0.09, dur: 0.05 },
    seba:    { freq: 220, type: "sawtooth", vol: 0.07, dur: 0.04 },
    sistema: { freq: 880, type: "square",   vol: 0.06, dur: 0.03 },
    default: { freq: 380, type: "square",   vol: 0.07, dur: 0.04 }
  };

  let lastCharSoundTime = 0;
  function playChar(speaker) {
    _ensure();
    const now = ctx.currentTime;
    if (now - lastCharSoundTime < 0.05) return;
    lastCharSoundTime = now;

    const key = speaker ? speaker.toLowerCase() : "default";
    const v = charVoices[key] || charVoices.default;
    const detune = (Math.random() - 0.5) * 60;
    _osc(v.type, v.freq, now, v.dur, v.vol, sfxGain, detune);
  }

  function playConfirm() {
    _ensure();
    const t = ctx.currentTime;
    _osc("square", 523, t,        0.06, 0.15, sfxGain);
    _osc("square", 784, t + 0.06, 0.10, 0.12, sfxGain);
  }

  function playCancel() {
    _ensure();
    const t = ctx.currentTime;
    _osc("square", 392, t,        0.06, 0.12, sfxGain);
    _osc("square", 294, t + 0.06, 0.10, 0.10, sfxGain);
  }

  function playMenuMove() {
    _ensure();
    _osc("square", 440, ctx.currentTime, 0.04, 0.08, sfxGain, 0);
  }

  function playMenuOpen() {
    _ensure();
    const t = ctx.currentTime;
    _arp([330, 440, 523], t, 0.05, 0.12, sfxGain, "square");
  }

  function playError() {
    _ensure();
    const t = ctx.currentTime;
    _osc("sawtooth", 150, t,        0.12, 0.15, sfxGain);
    _osc("sawtooth", 130, t + 0.10, 0.12, 0.12, sfxGain);
  }

  function playItem() {
    _ensure();
    const t = ctx.currentTime;
    _arp([523, 659, 784, 1047], t, 0.07, 0.15, sfxGain, "square");
  }

  function playHeal() {
    _ensure();
    const t = ctx.currentTime;
    _arp([392, 494, 587, 698, 784], t, 0.07, 0.13, sfxGain, "triangle");
    setTimeout(() => {
      const t2 = ctx.currentTime;
      _osc("sine", 1047, t2, 0.25, 0.10, sfxGain);
    }, 350);
  }

  let stepToggle = false;
  function playStep() {
    _ensure();
    stepToggle = !stepToggle;
    const freq = stepToggle ? 120 : 100;
    _noise(ctx.currentTime, 0.06, 0.08, sfxGain, 300);
    _osc("square", freq, ctx.currentTime, 0.04, 0.04, sfxGain);
  }

  function playTerminal() {
    _ensure();
    const t = ctx.currentTime;
    _osc("square", 880, t,        0.03, 0.12, sfxGain);
    _osc("square", 440, t + 0.03, 0.05, 0.10, sfxGain);
  }

  function playSign() {
    _ensure();
    const t = ctx.currentTime;
    _osc("triangle", 660, t,        0.05, 0.10, sfxGain);
    _osc("triangle", 880, t + 0.05, 0.08, 0.08, sfxGain);
  }

  function playLocked() {
    _ensure();
    const t = ctx.currentTime;
    _osc("sawtooth", 200, t,        0.10, 0.14, sfxGain);
    _osc("sawtooth", 150, t + 0.10, 0.15, 0.12, sfxGain);
    _noise(t + 0.08, 0.15, 0.08, sfxGain, 400);
  }

  function playZoneTransition() {
    _ensure();
    const t = ctx.currentTime;
    _arp([262, 330, 392, 523, 659, 784], t, 0.08, 0.12, sfxGain, "square");
  }

  function playAttack() {
    _ensure();
    const t = ctx.currentTime;
    _noise(t,        0.08, 0.25, sfxGain, 2000);
    _osc("sawtooth", 180, t,        0.05, 0.18, sfxGain);
    _osc("sawtooth", 120, t + 0.05, 0.08, 0.15, sfxGain);
  }

  function playHit() {
    _ensure();
    const t = ctx.currentTime;
    _noise(t, 0.12, 0.30, sfxGain, 1500);
    _osc("square", 150, t,        0.06, 0.20, sfxGain);
    _osc("square", 100, t + 0.06, 0.10, 0.15, sfxGain);
  }

  function playCritical() {
    _ensure();
    const t = ctx.currentTime;
    _noise(t, 0.05, 0.35, sfxGain, 3000);
    _osc("sawtooth", 220, t,        0.04, 0.25, sfxGain);
    _osc("sawtooth", 440, t + 0.04, 0.04, 0.20, sfxGain);
    _osc("square",   880, t + 0.08, 0.12, 0.15, sfxGain);
  }

  function playHurt() {
    _ensure();
    const t = ctx.currentTime;
    _noise(t, 0.18, 0.22, sfxGain, 600);
    _osc("sawtooth", 100, t,        0.05, 0.18, sfxGain);
    _osc("sawtooth",  80, t + 0.05, 0.13, 0.15, sfxGain);
  }

  function playDeath() {
    _ensure();
    const t = ctx.currentTime;
    // Descenso dramático de tonos
    [200, 160, 120, 90, 60].forEach((f, i) => {
      _osc("sawtooth", f, t + i * 0.15, 0.20, 0.18 - i * 0.02, sfxGain);
    });
    _noise(t, 0.8, 0.15, sfxGain, 400);
  }

  // Enemigo derrotado (FIGHT win)
  function playDefeat() {
    _ensure();
    const t = ctx.currentTime;
    _arp([523, 659, 784, 1047], t, 0.06, 0.15, sfxGain, "square");
    _osc("square", 1047, t + 0.28, 0.20, 0.12, sfxGain);
  }

  // Piedad / mercy aceptada
  function playMercy() {
    _ensure();
    const t = ctx.currentTime;
    _arp([392, 523, 659, 784, 1047, 1319], t, 0.07, 0.13, sfxGain, "triangle");
    setTimeout(() => {
      const t2 = ctx.currentTime;
      _osc("sine", 1568, t2,       0.15, 0.09, sfxGain);
      _osc("sine", 2093, t2 + 0.1, 0.15, 0.07, sfxGain);
    }, 450);
  }

  // Acción ACT elegida
  function playAct() {
    _ensure();
    const t = ctx.currentTime;
    _arp([330, 440, 523], t, 0.06, 0.12, sfxGain, "triangle");
  }

  // Bala rozando (near miss)
  function playDodge() {
    _ensure();
    _osc("sine", 2000, ctx.currentTime, 0.05, 0.06, sfxGain, 200);
  }

  // Inicio de batalla (fanfare corto)
  function playBattleStart() {
    _ensure();
    const t = ctx.currentTime;
    // Acorde y arpegio rápido
    _arp([262, 392, 523, 659, 784], t, 0.06, 0.18, sfxGain, "square");
    _osc("square", 784, t + 0.32, 0.30, 0.14, sfxGain);
  }

  // Inicio de batalla BOSS (más épico)
  function playBossStart() {
    _ensure();
    const t = ctx.currentTime;
    // Silencio, luego golpe
    _noise(t + 0.2, 0.15, 0.30, sfxGain, 1200);
    _osc("sawtooth", 65, t + 0.2, 0.30, 0.25, sfxGain);
    _arp([523, 659, 784, 988, 1047], t + 0.5, 0.07, 0.18, sfxGain, "square");
    _osc("square", 131, t + 0.5, 0.60, 0.20, sfxGain);
  }

  // Cambio de fase del boss
  function playPhaseChange() {
    _ensure();
    const t = ctx.currentTime;
    _noise(t, 0.1, 0.25, sfxGain, 2000);
    [131, 165, 196, 247, 262].forEach((f, i) => {
      _osc("sawtooth", f, t + i * 0.08, 0.15, 0.20, sfxGain);
    });
    _arp([523, 659, 784, 1047], t + 0.45, 0.07, 0.16, sfxGain, "square");
  }

  // HP bajo (alerta)
  function playLowHP() {
    _ensure();
    const t = ctx.currentTime;
    _osc("square", 880, t,        0.05, 0.12, sfxGain);
    _osc("square", 440, t + 0.07, 0.05, 0.10, sfxGain);
    _osc("square", 880, t + 0.14, 0.05, 0.12, sfxGain);
  }

  // Victoria final / SAVE
  function playVictory() {
    _ensure();
    const t = ctx.currentTime;
    // Fanfare estilo Undertale Determination
    const melody = [523, 659, 784, 1047, 784, 880, 1047, 1319];
    melody.forEach((f, i) => {
      _osc("square", f, t + i * 0.10, 0.12, 0.15, sfxGain);
    });
    // Acorde final
    setTimeout(() => {
      const t2 = ctx.currentTime;
      _osc("square",   523, t2, 0.60, 0.14, sfxGain);
      _osc("triangle", 659, t2, 0.60, 0.12, sfxGain);
      _osc("square",   784, t2, 0.60, 0.10, sfxGain);
    }, 850);
  }

  // SAVE point
  function playSave() {
    _ensure();
    const t = ctx.currentTime;
    _arp([262, 330, 392, 523, 659, 784, 1047], t, 0.08, 0.13, sfxGain, "triangle");
    setTimeout(() => {
      const t2 = ctx.currentTime;
      _osc("sine", 1047, t2, 0.50, 0.10, sfxGain);
      _osc("sine", 1319, t2 + 0.1, 0.40, 0.08, sfxGain);
    }, 600);
  }

  // ────────────────────────────────────────────────
  // MÚSICA DE FONDO — BGM PROCEDURAL
  // ────────────────────────────────────────────────

  // Genera una nota en la escala pentatónica (estilo Undertale)
  function _playBGMNote(freq, startTime, dur, vol, type) {
    if (!ctx) return;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, startTime);
    g.gain.linearRampToValueAtTime(vol, startTime + 0.01);
    g.gain.setValueAtTime(vol, startTime + dur - 0.02);
    g.gain.linearRampToValueAtTime(0, startTime + dur);
    g.connect(musicGain);

    const o = ctx.createOscillator();
    o.type = type || "square";
    o.frequency.setValueAtTime(freq, startTime);
    o.connect(g);
    o.start(startTime);
    o.stop(startTime + dur + 0.05);
    bgmNodes.push(o);
    return o;
  }

  // Detiene todos los nodos de BGM
  function _stopBGMNodes() {
    bgmNodes.forEach(n => { try { n.stop(); } catch (e) {} });
    bgmNodes = [];
    if (bgmLoopRef) { clearTimeout(bgmLoopRef); bgmLoopRef = null; }
  }

  // ── BGM: TÍTULO — "Boot Screen" ──────────────────
  // Melodía tranquila estilo Fallen Down / Menu
  function _bgmTitle() {
    if (fadingOut || currentBGM !== "title") return;
    const t = ctx.currentTime + 0.05;
    const bpm = 80;
    const beat = 60 / bpm;
    const scale = [131, 147, 165, 175, 196, 220, 247]; // Do menor

    // Melodía simple
    const melody = [
      [196, 2], [175, 1], [165, 1], [147, 2], [165, 1], [131, 2],
      [165, 1], [175, 1], [196, 2], [220, 1], [175, 1], [165, 2],
      [147, 1], [131, 1], [147, 2], [165, 2]
    ];
    // Bajo
    const bass = [
      [65, 4], [55, 4], [55, 4], [65, 4]
    ];

    let offset = 0;
    melody.forEach(([f, beats]) => {
      _playBGMNote(f * 2, t + offset, beat * beats * 0.85, 0.07, "square");
      offset += beat * beats;
    });

    let bassOffset = 0;
    bass.forEach(([f, beats]) => {
      _playBGMNote(f, t + bassOffset, beat * beats * 0.9, 0.05, "triangle");
      bassOffset += beat * beats;
    });

    const totalDur = melody.reduce((s, [, b]) => s + beat * b, 0);
    bgmLoopRef = setTimeout(_bgmTitle, totalDur * 1000 - 50);
  }

  // ── BGM: ZONA 1 — Terminal de Acceso — "Start Up" ──
  function _bgmTerminal() {
    if (fadingOut || currentBGM !== "terminal") return;
    const t = ctx.currentTime + 0.05;
    const bpm = 110;
    const beat = 60 / bpm;

    // Melodía en Re menor (animada pero misteriosa)
    const melody = [
      [294, 1], [330, 1], [349, 2], [294, 1], [262, 1], [294, 2],
      [330, 1], [349, 1], [392, 2], [349, 1], [330, 1], [294, 2],
      [262, 1], [294, 1], [330, 2], [349, 1], [294, 1], [262, 2]
    ];
    // Contrapunto
    const counter = [
      [147, 2], [165, 2], [196, 2], [175, 2], [165, 2], [147, 2], [131, 2], [147, 2]
    ];
    // Bajo
    const bass = [[73, 4], [65, 4], [73, 4], [82, 4]];

    let off = 0;
    melody.forEach(([f, b]) => {
      _playBGMNote(f, t + off, beat * b * 0.80, 0.08, "square");
      off += beat * b;
    });
    let coff = 0;
    counter.forEach(([f, b]) => {
      _playBGMNote(f, t + coff, beat * b * 0.90, 0.05, "triangle");
      coff += beat * b;
    });
    let boff = 0;
    bass.forEach(([f, b]) => {
      _playBGMNote(f, t + boff, beat * b * 0.92, 0.06, "sawtooth");
      boff += beat * b;
    });

    const totalDur = melody.reduce((s, [, b]) => s + beat * b, 0);
    bgmLoopRef = setTimeout(_bgmTerminal, totalDur * 1000 - 50);
  }

  // ── BGM: ZONA 2 — Distrito RAM — "Memory Overflow" ──
  function _bgmRAM() {
    if (fadingOut || currentBGM !== "ram_district") return;
    const t = ctx.currentTime + 0.05;
    const bpm = 125;
    const beat = 60 / bpm;

    // Más rápido y tenso — estilo Waterfall de Undertale
    const melody = [
      [392, 1], [440, 0.5], [494, 0.5], [523, 1.5], [494, 0.5],
      [440, 1], [392, 1], [349, 1], [330, 1], [294, 2],
      [330, 1], [349, 0.5], [392, 0.5], [440, 1.5], [392, 0.5],
      [349, 1], [330, 1], [294, 1], [262, 1], [294, 2]
    ];
    const bass = [[98, 4], [87, 4], [98, 4], [110, 4]];
    const pulse = [[196, 1], [196, 1], [196, 1], [196, 1],
                   [196, 1], [196, 1], [196, 1], [196, 1],
                   [175, 1], [175, 1], [175, 1], [175, 1],
                   [196, 1], [196, 1], [220, 1], [220, 1]];

    let off = 0;
    melody.forEach(([f, b]) => {
      _playBGMNote(f, t + off, beat * b * 0.78, 0.09, "square");
      off += beat * b;
    });
    let poff = 0;
    pulse.forEach(([f, b]) => {
      _playBGMNote(f / 2, t + poff, beat * b * 0.4, 0.04, "square");
      poff += beat * b;
    });
    let boff = 0;
    bass.forEach(([f, b]) => {
      _playBGMNote(f, t + boff, beat * b * 0.88, 0.07, "sawtooth");
      boff += beat * b;
    });

    const totalDur = melody.reduce((s, [, b]) => s + beat * b, 0);
    bgmLoopRef = setTimeout(_bgmRAM, totalDur * 1000 - 50);
  }

  // ── BGM: ZONA 3 — Firewall — "Firewall Breach" ──
  function _bgmFirewall() {
    if (fadingOut || currentBGM !== "firewall") return;
    const t = ctx.currentTime + 0.05;
    const bpm = 135;
    const beat = 60 / bpm;

    // Más oscuro y urgente — sawtooth dominante
    const melody = [
      [494, 1], [523, 0.5], [587, 0.5], [659, 1], [587, 0.5], [523, 0.5],
      [494, 1], [440, 1], [494, 2],
      [523, 1], [587, 0.5], [659, 0.5], [698, 1], [659, 0.5], [587, 0.5],
      [523, 1], [494, 1], [523, 2]
    ];
    const bass = [[110, 4], [98, 4], [110, 4], [123, 4]];
    const drone = [[55, 16]]; // bordón oscuro

    let off = 0;
    melody.forEach(([f, b]) => {
      _playBGMNote(f, t + off, beat * b * 0.80, 0.10, "sawtooth");
      off += beat * b;
    });
    let boff = 0;
    bass.forEach(([f, b]) => {
      _playBGMNote(f, t + boff, beat * b * 0.90, 0.07, "sawtooth");
      boff += beat * b;
    });
    drone.forEach(([f, b]) => {
      _playBGMNote(f, t, beat * b, 0.04, "triangle");
    });

    const totalDur = melody.reduce((s, [, b]) => s + beat * b, 0);
    bgmLoopRef = setTimeout(_bgmFirewall, totalDur * 1000 - 50);
  }

  // ── BGM: ZONA 4 — Servidor Central — "Core Access" ──
  function _bgmServidor() {
    if (fadingOut || currentBGM !== "servidor_central") return;
    const t = ctx.currentTime + 0.05;
    const bpm = 100;
    const beat = 60 / bpm;

    // Oscuro y solemne — La música antes del jefe
    const melody = [
      [220, 2], [247, 1], [262, 1], [220, 2], [196, 2],
      [175, 2], [196, 1], [220, 1], [175, 2], [165, 2],
      [147, 2], [165, 1], [175, 1], [165, 2], [147, 2]
    ];
    const bass = [[55, 4], [49, 4], [55, 4], [52, 4]];
    const pad  = [[110, 8], [98, 8]];

    let off = 0;
    melody.forEach(([f, b]) => {
      _playBGMNote(f, t + off, beat * b * 0.85, 0.09, "square");
      off += beat * b;
    });
    let boff = 0;
    bass.forEach(([f, b]) => {
      _playBGMNote(f, t + boff, beat * b * 0.95, 0.06, "triangle");
      boff += beat * b;
    });
    let poff = 0;
    pad.forEach(([f, b]) => {
      _playBGMNote(f, t + poff, beat * b, 0.03, "sine");
      poff += beat * b;
    });

    const totalDur = melody.reduce((s, [, b]) => s + beat * b, 0);
    bgmLoopRef = setTimeout(_bgmServidor, totalDur * 1000 - 50);
  }

  // ── BGM: BATALLA NORMAL — "Debug Fight" ──
  function _bgmBattleNormal() {
    if (fadingOut || currentBGM !== "battle_normal") return;
    const t = ctx.currentTime + 0.05;
    const bpm = 150;
    const beat = 60 / bpm;

    // Enérgico y chiptune
    const melody = [
      [659, 0.5], [698, 0.5], [659, 0.5], [587, 0.5], [659, 1],
      [523, 0.5], [587, 0.5], [523, 0.5], [494, 0.5], [523, 1],
      [440, 0.5], [494, 0.5], [440, 0.5], [392, 0.5], [440, 1],
      [349, 0.5], [392, 0.5], [440, 0.5], [494, 0.5], [523, 0.5], [587, 0.5]
    ];
    const bass = [[131, 2], [131, 1], [131, 1], [110, 2], [110, 2],
                  [131, 2], [131, 2], [123, 2], [131, 2]];
    const drums = [
      [1, 0], [0, 0.5], [1, 0], [0, 0.5], [1, 0], [0, 0.5], [1, 0], [0, 0.5],
      [1, 0], [0, 0.5], [1, 0], [0, 0.5], [1, 0], [0, 0.5], [1, 0], [0, 0.5]
    ];

    let off = 0;
    melody.forEach(([f, b]) => {
      _playBGMNote(f, t + off, beat * b * 0.75, 0.10, "square");
      off += beat * b;
    });
    let boff = 0;
    bass.forEach(([f, b]) => {
      _playBGMNote(f, t + boff, beat * b * 0.85, 0.07, "sawtooth");
      boff += beat * b;
    });
    // Kick drum sintético
    let doff = 0;
    drums.forEach(([kick]) => {
      if (kick) _noise(t + doff, 0.08, 0.12, sfxGain, 200);
      doff += beat * 0.5;
    });

    const totalDur = melody.reduce((s, [, b]) => s + beat * b, 0);
    bgmLoopRef = setTimeout(_bgmBattleNormal, totalDur * 1000 - 50);
  }

  // ── BGM: BATALLA ZONA 2 (RAM) — "Memory Leak" ──
  function _bgmBattleRAM() {
    if (fadingOut || currentBGM !== "battle_ram") return;
    const t = ctx.currentTime + 0.05;
    const bpm = 140;
    const beat = 60 / bpm;

    // Más tenso y glitchy — uso de tritono y ritmo sincopado
    const melody = [
      [392, 0.5], [370, 0.25], [392, 0.25], [349, 0.5], [330, 0.5],
      [370, 1],   [349, 0.5],  [330, 0.5],  [311, 0.5], [294, 0.5],
      [330, 1],   [311, 0.5],  [294, 0.25], [311, 0.25],[277, 0.5], [262, 0.5],
      [294, 1.5], [262, 0.5]
    ];
    const bass = [
      [98, 2], [87, 1], [98, 1], [93, 2], [98, 2],
      [87, 2], [82, 2], [87, 2], [98, 2]
    ];
    const arp = [196, 247, 311, 370, 311, 247];

    let off = 0;
    melody.forEach(([f, b]) => {
      _playBGMNote(f, t + off, beat * b * 0.70, 0.09, "square");
      off += beat * b;
    });
    let boff = 0;
    bass.forEach(([f, b]) => {
      _playBGMNote(f, t + boff, beat * b * 0.85, 0.07, "sawtooth");
      boff += beat * b;
    });
    // Arpeggio glitchy
    arp.forEach((f, i) => {
      _playBGMNote(f, t + i * beat * 0.25, beat * 0.2, 0.04, "triangle");
    });
    // Kick sincopado
    [0, 0.5, 1.5, 2, 3, 3.5].forEach(step => {
      _noise(t + step * beat, 0.05, 0.10, sfxGain, 220);
    });

    const totalDur = melody.reduce((s, [, b]) => s + beat * b, 0);
    bgmLoopRef = setTimeout(_bgmBattleRAM, totalDur * 1000 - 50);
  }

  // ── BGM: BATALLA ZONA 3 (FIREWALL) — "Packet Storm" ──
  function _bgmBattleFirewall() {
    if (fadingOut || currentBGM !== "battle_firewall") return;
    const t = ctx.currentTime + 0.05;
    const bpm = 165;
    const beat = 60 / bpm;

    // Agresivo y urgente — tono bajo, mucho drive
    const melody = [
      [220, 0.5], [233, 0.5], [247, 0.5], [220, 0.5],
      [196, 0.5], [208, 0.5], [220, 0.5], [196, 0.5],
      [175, 0.5], [196, 0.5], [208, 0.5], [175, 0.5],
      [165, 1],   [175, 0.5], [196, 0.5],
      [220, 0.5], [233, 0.5], [220, 0.5], [208, 0.5], [196, 1]
    ];
    const bass = [
      [55, 1], [55, 0.5], [55, 0.5], [52, 1], [55, 1],
      [49, 1], [52, 1],   [55, 1],   [49, 2]
    ];

    let off = 0;
    melody.forEach(([f, b]) => {
      _playBGMNote(f, t + off, beat * b * 0.65, 0.11, "sawtooth");
      _playBGMNote(f * 2, t + off + beat * 0.1, beat * b * 0.50, 0.04, "square");
      off += beat * b;
    });
    let boff = 0;
    bass.forEach(([f, b]) => {
      _playBGMNote(f, t + boff, beat * b * 0.80, 0.09, "sawtooth");
      boff += beat * b;
    });
    // Bombo rápido + hi-hat
    for (let i = 0; i < 20; i++) {
      _noise(t + i * beat * 0.5, 0.04, 0.08, sfxGain, 250);
      if (i % 2 === 0) _noise(t + i * beat * 0.5 + beat * 0.25, 0.02, 0.05, sfxGain, 800);
    }

    const totalDur = melody.reduce((s, [, b]) => s + beat * b, 0);
    bgmLoopRef = setTimeout(_bgmBattleFirewall, totalDur * 1000 - 50);
  }

  // ── BGM: BATALLA ZONA 4 (SERVIDOR CENTRAL) — "Core Breach" ──
  function _bgmBattleServidor() {
    if (fadingOut || currentBGM !== "battle_servidor") return;
    const t = ctx.currentTime + 0.05;
    const bpm = 155;
    const beat = 60 / bpm;

    // Oscuro y épico — presagio del boss
    const melody = [
      [262, 0.5], [294, 0.5], [311, 0.5], [262, 0.5],
      [247, 0.5], [262, 0.5], [294, 0.5], [247, 0.5],
      [233, 0.5], [247, 0.5], [262, 0.5], [233, 0.5],
      [220, 1],   [233, 0.5], [247, 0.5],
      [262, 0.5], [294, 0.5], [330, 0.5], [349, 0.5], [330, 1]
    ];
    const bass = [
      [65, 1.5], [65, 0.5], [62, 1], [65, 1],
      [58, 1],   [62, 1],   [65, 2], [58, 2]
    ];
    const chords = [[196, 247], [185, 233], [175, 220]];

    let off = 0;
    melody.forEach(([f, b]) => {
      _playBGMNote(f, t + off, beat * b * 0.72, 0.10, "square");
      off += beat * b;
    });
    let boff = 0;
    bass.forEach(([f, b]) => {
      _playBGMNote(f, t + boff, beat * b * 0.88, 0.08, "sawtooth");
      boff += beat * b;
    });
    // Acordes tensos
    chords.forEach(([f1, f2], i) => {
      _playBGMNote(f1, t + i * beat * 2, beat * 1.8, 0.04, "triangle");
      _playBGMNote(f2, t + i * beat * 2, beat * 1.8, 0.04, "triangle");
    });
    // Kick grave + hi-hat siniestro
    for (let i = 0; i < 16; i++) {
      if (i % 4 === 0 || i % 4 === 2) _noise(t + i * beat * 0.5, 0.06, 0.12, sfxGain, 160);
      _noise(t + i * beat * 0.5 + beat * 0.25, 0.015, 0.04, sfxGain, 1200);
    }

    const totalDur = melody.reduce((s, [, b]) => s + beat * b, 0);
    bgmLoopRef = setTimeout(_bgmBattleServidor, totalDur * 1000 - 50);
  }

  // ── BGM: BOSS — "Null Pointer Exception" ──
  function _bgmBoss() {
    if (fadingOut || currentBGM !== "battle_boss") return;
    const t = ctx.currentTime + 0.05;
    const bpm = 160;
    const beat = 60 / bpm;

    // Épico, agresivo — inspirado en Undertale MEGALOVANIA
    const melody = [
      [294, 0.5], [294, 0.5], [588, 0.5], [494, 0.5],
      [466, 0.5], [440, 0.5], [392, 0.5], [294, 0.5],
      [330, 0.5], [330, 0.5], [294, 0.5], [262, 0.5], [294, 1],
      [262, 0.5], [262, 0.5], [523, 0.5], [440, 0.5],
      [415, 0.5], [392, 0.5], [349, 0.5], [262, 0.5],
      [294, 0.5], [294, 0.5], [262, 0.5], [247, 0.5], [262, 1],
    ];
    const bass = [
      [73, 2], [73, 1], [73, 1], [65, 2], [69, 2],
      [73, 2], [73, 1], [73, 1], [62, 2], [65, 2]
    ];

    let off = 0;
    melody.forEach(([f, b]) => {
      _playBGMNote(f, t + off, beat * b * 0.70, 0.12, "sawtooth");
      _playBGMNote(f / 2, t + off, beat * b * 0.70, 0.05, "square");
      off += beat * b;
    });
    let boff = 0;
    bass.forEach(([f, b]) => {
      _playBGMNote(f, t + boff, beat * b * 0.85, 0.09, "sawtooth");
      boff += beat * b;
    });
    // Kick agresivo
    for (let i = 0; i < 16; i++) {
      _noise(t + i * beat * 0.5, 0.06, 0.15, sfxGain, 180);
    }

    const totalDur = melody.reduce((s, [, b]) => s + beat * b, 0);
    bgmLoopRef = setTimeout(_bgmBoss, totalDur * 1000 - 50);
  }

  // ── BGM: GAME OVER — "Null Sequence" ──
  function _bgmGameOver() {
    if (fadingOut || currentBGM !== "gameover") return;
    const t = ctx.currentTime + 0.05;
    const bpm = 60;
    const beat = 60 / bpm;

    const melody = [
      [196, 2], [165, 2], [147, 2], [131, 4]
    ];
    let off = 0;
    melody.forEach(([f, b]) => {
      _playBGMNote(f, t + off, beat * b * 0.80, 0.07, "triangle");
      off += beat * b;
    });

    const totalDur = melody.reduce((s, [, b]) => s + beat * b, 0);
    bgmLoopRef = setTimeout(_bgmGameOver, totalDur * 1000 - 50);
  }

  // ── BGM: VICTORIA ──
  function _bgmVictory() {
    if (fadingOut || currentBGM !== "victory") return;
    const t = ctx.currentTime + 0.05;
    const bpm = 120;
    const beat = 60 / bpm;

    const melody = [
      [523, 1], [659, 1], [784, 1], [1047, 2], [880, 1],
      [784, 1], [659, 1], [523, 1], [659, 1], [784, 2],
      [523, 1], [784, 1], [1047, 3]
    ];
    let off = 0;
    melody.forEach(([f, b]) => {
      _playBGMNote(f, t + off, beat * b * 0.85, 0.11, "square");
      _playBGMNote(f / 2, t + off, beat * b * 0.85, 0.05, "triangle");
      off += beat * b;
    });

    const totalDur = melody.reduce((s, [, b]) => s + beat * b, 0);
    bgmLoopRef = setTimeout(_bgmVictory, totalDur * 1000 - 50);
  }

  // ────────────────────────────────────────────────
  // API PÚBLICA — PLAY BGM
  // ────────────────────────────────────────────────

  const bgmMap = {
    title:            _bgmTitle,
    terminal:         _bgmTerminal,
    ram_district:     _bgmRAM,
    firewall:         _bgmFirewall,
    servidor_central: _bgmServidor,
    battle_normal:    _bgmBattleNormal,
    battle_ram:       _bgmBattleRAM,
    battle_firewall:  _bgmBattleFirewall,
    battle_servidor:  _bgmBattleServidor,
    battle_boss:      _bgmBoss,
    gameover:         _bgmGameOver,
    victory:          _bgmVictory
  };

  function playBGM(name) {
    _ensure();
    // Si ya está sonando la misma BGM y el contexto está corriendo, no hacer nada
    if (currentBGM === name && ctx && ctx.state === "running") return;
    _stopBGMNodes();
    currentBGM = name;
    fadingOut = false;
    if (musicGain) musicGain.gain.setValueAtTime(musicVolume, ctx.currentTime);
    // Solo lanzar si el contexto ya está activo; si no, _resume() lo lanzará
    if (ctx && ctx.state === "running") {
      const fn = bgmMap[name];
      if (fn) fn();
    }
  }

  function stopBGM(fadeTime) {
    if (!ctx) return;
    fadingOut = true;
    const t = ctx.currentTime;
    const fade = fadeTime || 0.3;
    if (musicGain) {
      musicGain.gain.setValueAtTime(musicGain.gain.value, t);
      musicGain.gain.linearRampToValueAtTime(0, t + fade);
    }
    setTimeout(() => {
      _stopBGMNodes();
      currentBGM = null;
      fadingOut = false;
      if (musicGain) {
        musicGain.gain.setValueAtTime(musicVolume, ctx.currentTime);
      }
    }, (fade + 0.1) * 1000);
  }

  function pauseBGM() {
    if (ctx && ctx.state === "running") ctx.suspend();
  }

  function resumeBGM() {
    _resume();
  }

  // ────────────────────────────────────────────────
  // VOLÚMENES
  // ────────────────────────────────────────────────
  function setMusicVolume(v) {
    musicVolume = Math.max(0, Math.min(1, v));
    if (musicGain) musicGain.gain.setValueAtTime(musicVolume, ctx.currentTime);
  }
  function setSFXVolume(v) {
    sfxVolume = Math.max(0, Math.min(1, v));
    if (sfxGain) sfxGain.gain.setValueAtTime(sfxVolume, ctx.currentTime);
  }

  // ────────────────────────────────────────────────
  // EXPORT
  // ────────────────────────────────────────────────
  return {
    init,
    // BGM
    playBGM,
    stopBGM,
    pauseBGM,
    resumeBGM,
    setMusicVolume,
    setSFXVolume,
    // SFX diálogo / UI
    playChar,
    playConfirm,
    playCancel,
    playMenuMove,
    playMenuOpen,
    playError,
    playItem,
    playHeal,
    playStep,
    playTerminal,
    playSign,
    playLocked,
    playZoneTransition,
    // SFX batalla
    playAttack,
    playHit,
    playCritical,
    playHurt,
    playDeath,
    playDefeat,
    playMercy,
    playAct,
    playDodge,
    playBattleStart,
    playBossStart,
    playPhaseChange,
    playLowHP,
    playVictory,
    playSave
  };
})();

