window.Battle = (function() {

  let state = "idle";
  let enemy     = null;
  let enemyCfg  = null;
  let playerStats = null;
  let onEnd    = null;
  let onDefeat = null;
  let tempAtkBoost = 0;
  let actionsUsed  = new Set();
  let mercyCharge  = 0;
  let currentPhase = 0;
  let invincible   = false;

  let arenaCanvas, arenaCtx;
  const ARENA_W = 240;
  const ARENA_H = 200;
  let arenaRect = null;

  let cursor = { x: ARENA_W / 2, y: ARENA_H / 2, r: 10, color: "#ffffff", trail: [] };

  let bullets = [];
  let attackTimer   = 0;
  let attackDuration = 0;
  let attackPhase   = "waiting";

  let renderAnimId  = null;
  let lastRenderTime = 0;
  let tickRef       = null;
  let mouseMoveHandler = null;

  // Throttle de sonido de esquive
  let lastDodgeSnd = 0;

  function start(enemyObj, callbacks) {
    _cleanup();

    onEnd    = callbacks.onEnd    || null;
    onDefeat = callbacks.onDefeat || null;

    enemyCfg = JSON.parse(JSON.stringify(CONFIG.ENEMIES[enemyObj.id]));
    enemy    = { ...enemyCfg };
    enemy.isBoss = enemyObj.isBoss || false;

    currentPhase = 0;
    mercyCharge  = 0;
    actionsUsed.clear();
    tempAtkBoost = 0;
    invincible   = false;
    bullets      = [];
    attackTimer  = 0;
    attackPhase  = "waiting";

    cursor.x     = ARENA_W / 2;
    cursor.y     = ARENA_H / 2;
    cursor.color = "#ffffff";
    cursor.trail = [];

    playerStats = {
      hp:    CONFIG.PLAYER.hp,
      maxHp: CONFIG.PLAYER.maxHp,
      atk:   CONFIG.PLAYER.atk,
      def:   CONFIG.PLAYER.def
    };

    document.getElementById("screen-battle").classList.add("active");

    // Asegurar que el contexto de audio esté activo
    if (window.Audio) Audio.resumeBGM();

    setButtonsEnabled(true);
    document.getElementById("battle-submenu").classList.add("hidden");

    _setupArena();
    _setupUI();
    _setupMouseInput();

    _renderEnemySprite(enemy.sprite, enemy.spriteType);
    document.getElementById("battle-enemy-name").textContent    = enemy.name;
    document.getElementById("battle-enemy-hpbar").style.width   = "100%";
    document.getElementById("battle-enemy-hpbar").style.background = "#ff0000";
    setFlavor(enemy.flavor);
    _showMessage("⚔ ¡" + enemy.name + " aparece!", 2000);
    _updateBattleStats();

    state = "player_turn";
    lastRenderTime = performance.now();
    _render();
  }

  function _renderEnemySprite(sprite, spriteType) {
    const area = document.getElementById("battle-enemy-sprite");
    if (spriteType === "img") {
      area.innerHTML = "";
      const img = document.createElement("img");
      img.src = sprite;
      img.style.width = "80px";
      img.style.height = "80px";
      img.style.objectFit = "contain";
      img.style.imageRendering = "pixelated";
      area.appendChild(img);
    } else {
      area.textContent = sprite;
    }
  }

  function _cleanup() {
    if (renderAnimId)  { cancelAnimationFrame(renderAnimId); renderAnimId = null; }
    if (tickRef)       { clearInterval(tickRef); tickRef = null; }
    if (mouseMoveHandler) {
      document.removeEventListener("mousemove", mouseMoveHandler);
      mouseMoveHandler = null;
    }
    state = "idle";
  }

  function _setupArena() {
    arenaCanvas = document.getElementById("battle-arena");
    arenaCtx    = arenaCanvas.getContext("2d");
    arenaCanvas.width  = ARENA_W;
    arenaCanvas.height = ARENA_H;
    arenaRect = arenaCanvas.getBoundingClientRect();
    window.addEventListener("resize", () => { arenaRect = arenaCanvas.getBoundingClientRect(); });
  }

  function _setupUI() {
    document.getElementById("b-fight").onclick = () => doFight();
    document.getElementById("b-act").onclick   = () => doAct();
    document.getElementById("b-mercy").onclick = () => doMercy();
    document.getElementById("b-item").onclick  = () => doItem();
    document.getElementById("b-submenu-back").onclick = () => {
      Audio.playCancel();
      _hideSubmenu();
      setButtonsEnabled(true);
    };
  }

  function _setupMouseInput() {
    mouseMoveHandler = (e) => {
      if (state !== "enemy_turn") return;
      arenaRect = arenaCanvas.getBoundingClientRect();
      const mx = (e.clientX - arenaRect.left) * (ARENA_W / arenaRect.width);
      const my = (e.clientY - arenaRect.top)  * (ARENA_H / arenaRect.height);
      cursor.trail.push({ x: cursor.x, y: cursor.y });
      if (cursor.trail.length > 8) cursor.trail.shift();
      cursor.x = Math.max(cursor.r, Math.min(ARENA_W - cursor.r, mx));
      cursor.y = Math.max(cursor.r, Math.min(ARENA_H - cursor.r, my));
    };
    document.addEventListener("mousemove", mouseMoveHandler);
  }

  function setButtonsEnabled(enabled) {
    ["b-fight","b-act","b-mercy","b-item"].forEach(id => {
      document.getElementById(id).disabled = !enabled;
    });
  }

  function _showSubmenu(title, options, onClick) {
    setButtonsEnabled(false);
    Audio.playMenuOpen();
    const sub = document.getElementById("battle-submenu");
    sub.classList.remove("hidden");
    document.getElementById("battle-submenu-title").textContent = title;
    const opts = document.getElementById("battle-submenu-options");
    opts.innerHTML = "";
    options.forEach((opt, i) => {
      const btn = document.createElement("button");
      btn.className = "submenu-opt";
      btn.textContent = opt;
      btn.onclick = () => {
        Audio.playConfirm();
        _hideSubmenu();
        onClick(i);
      };
      btn.onmouseenter = () => Audio.playMenuMove();
      opts.appendChild(btn);
    });
  }

  function _hideSubmenu() {
    document.getElementById("battle-submenu").classList.add("hidden");
    setButtonsEnabled(true);
  }

  function setFlavor(text) {
    document.getElementById("battle-flavor").textContent = text;
  }

  function _updateBattleStats() {
    document.getElementById("b-hp-val").textContent  = playerStats.hp;
    document.getElementById("b-hp-max").textContent  = playerStats.maxHp;
    document.getElementById("b-atk-val").textContent = playerStats.atk + tempAtkBoost;
    document.getElementById("b-def-val").textContent = playerStats.def;

    const pct = playerStats.hp / playerStats.maxHp;
    const bar = document.getElementById("battle-hp-bar");
    bar.style.width      = (pct * 100) + "%";
    bar.style.background = pct > 0.5 ? "#ffff00" : pct > 0.25 ? "#ff8800" : "#ff3333";

    // Alerta de HP bajo
    if (pct <= 0.25 && pct > 0) {
      Audio.playLowHP();
    }

    const ePct = enemy.hp / enemy.maxHp;
    document.getElementById("battle-enemy-hpbar").style.width      = (ePct * 100) + "%";
    document.getElementById("battle-enemy-hpbar").style.background =
      ePct > 0.5 ? "#ff0000" : ePct > 0.25 ? "#ff6600" : "#ff3333";
  }

  function _showMessage(text, duration) {
    const el = document.getElementById("battle-message");
    el.textContent = text;
    el.classList.add("show");
    setTimeout(() => el.classList.remove("show"), duration);
  }

  function doFight() {
    if (state !== "player_turn") return;
    state = "animating";
    setButtonsEnabled(false);

    Audio.playAttack();

    const dmg = Math.max(1,
      (playerStats.atk + tempAtkBoost) - Math.floor(enemy.def * 0.5) + Math.floor(Math.random() * 5)
    );
    enemy.hp = Math.max(0, enemy.hp - dmg);

    const spriteEl = document.getElementById("battle-enemy-sprite");
    const img = spriteEl.querySelector("img");

    setTimeout(() => Audio.playHit(), 120);

    if (img) {
      img.style.filter = "brightness(5) saturate(0)";
      setTimeout(() => { img.style.filter = ""; }, 200);
    } else {
      spriteEl.style.filter = "brightness(5) saturate(0)";
      setTimeout(() => { spriteEl.style.filter = ""; }, 200);
    }

    setFlavor(`¡Ataque! Causas ${dmg} de daño.`);
    _updateBattleStats();
    _checkEnemyPhase();

    setTimeout(() => {
      if (enemy.hp <= 0) {
        _endBattle("victory");
      } else {
        _startEnemyTurn();
      }
    }, 600);
  }

  function doAct() {
    if (state !== "player_turn") return;
    Audio.playAct();
    const opts    = enemyCfg.actOptions || ["Examinar"];
    const results = enemyCfg.actResults || ["Lo examinas. Parece nervioso."];
    _showSubmenu("💬 ACTUAR", opts, (idx) => {
      mercyCharge = Math.min(1, mercyCharge + 0.25);
      actionsUsed.add(idx);
      const txt = results[idx % results.length];
      setFlavor(mercyCharge >= enemyCfg.mercyThreshold ? enemyCfg.flavorMerciful : txt);
      setTimeout(() => _startEnemyTurn(), 600);
    });
  }

  function doMercy() {
    if (state !== "player_turn") return;
    if (enemy.isBoss && (enemy.hp / enemy.maxHp) > 0.3) {
      Audio.playError();
      setFlavor("El Profesor no acepta disculpas todavía. ¡Sigue luchando!");
      return;
    }
    if (mercyCharge < enemyCfg.mercyThreshold && (enemy.hp / enemy.maxHp) > 0.3) {
      Audio.playError();
      setFlavor(`${enemy.name} no acepta piedad todavía. ¡Usa ACTUAR primero!`);
      return;
    }
    Audio.playMercy();
    _endBattle("mercy");
  }

  function doItem() {
    if (state !== "player_turn") return;
    if (playerStats.hp >= playerStats.maxHp) {
      Audio.playError();
      setFlavor("Ya estás al máximo de HP. ¡No necesitas curarte!");
      return;
    }
    const healItems = [
      { id: "patch",     label: "🩹 Parche v1.0 — Restaura 20 HP" },
      { id: "antivirus", label: "🛡 Antivirus — Restaura 50 HP"   }
    ];
    _showSubmenu("🎒 ÍTEMS", healItems.map(i => i.label), (idx) => {
      const cfg  = CONFIG.ITEMS[healItems[idx].id];
      const heal = Math.min(cfg.value, playerStats.maxHp - playerStats.hp);
      playerStats.hp += heal;
      CONFIG.PLAYER.hp = playerStats.hp;
      Audio.playHeal();
      setFlavor(`Usas ${cfg.name}. ¡Recuperas ${heal} HP!`);
      _updateBattleStats();
      setTimeout(() => _startEnemyTurn(), 600);
    });
  }

  function _startEnemyTurn() {
    state = "enemy_turn";
    setButtonsEnabled(false);

    const attacks   = enemy.attacks || enemyCfg.attacks;
    const attackDef = attacks[Math.floor(Math.random() * attacks.length)];

    bullets       = [];
    attackTimer   = 0;
    attackDuration = attackDef.duration;
    attackPhase   = "attacking";
    invincible    = false;

    setFlavor(`${enemy.name} usa ${attackDef.name}!`);
    _showMessage(attackDef.name, 1200);
    _spawnBullets(attackDef);

    tickRef = setInterval(() => {
      attackTimer += 16;
      if (attackTimer >= attackDuration) {
        clearInterval(tickRef);
        tickRef = null;
        attackPhase = "done";
        bullets = [];
        if (state === "enemy_turn") {
          state = "player_turn";
          setButtonsEnabled(true);
          setFlavor(
            enemy.hp / enemy.maxHp < enemyCfg.mercyThreshold
              ? enemyCfg.flavorMerciful
              : enemy.flavor
          );
        }
      }
    }, 16);
  }

  function _spawnBullets(attackDef) {
    setTimeout(() => {
      if (attackPhase !== "attacking") return;
      for (const bDef of attackDef.bullets) _createBullet(bDef);

      const spawnLoop = setInterval(() => {
        if (attackPhase !== "attacking" || attackTimer >= attackDuration) {
          clearInterval(spawnLoop);
          return;
        }
        for (const bDef of attackDef.bullets) _createBullet(bDef);
      }, 750);
    }, 600);
  }

  function _createBullet(bDef) {
    switch (bDef.type) {
      case "hline": {
        const goRight = Math.random() > 0.5;
        bullets.push({
          type: "hline",
          x: goRight ? -40 : ARENA_W + 40,
          y: bDef.y * ARENA_H + (Math.random() - 0.5) * 20,
          w: 40, h: bDef.height,
          vx: goRight ? bDef.speed : -bDef.speed, vy: 0,
          color: bDef.color, life: 3000
        });
        break;
      }
      case "vline": {
        bullets.push({
          type: "vline",
          x: bDef.x * ARENA_W + (Math.random() - 0.5) * 20,
          y: -40,
          w: bDef.width, h: 40,
          vx: 0, vy: bDef.speed * (Math.random() > 0.5 ? 1 : -1),
          color: bDef.color, life: 3000
        });
        break;
      }
      case "circle_burst": {
        const count = bDef.count || 6;
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2 + Math.random() * 0.3;
          bullets.push({
            type: "circle",
            x: ARENA_W / 2 + (Math.random() - 0.5) * 20,
            y: ARENA_H / 2 + (Math.random() - 0.5) * 20,
            r: bDef.radius,
            vx: Math.cos(angle) * bDef.speed,
            vy: Math.sin(angle) * bDef.speed,
            color: bDef.color, life: 4000
          });
        }
        break;
      }
      case "raining": {
        const count = bDef.count || 5;
        for (let i = 0; i < count; i++) {
          bullets.push({
            type: "circle",
            x: Math.random() * ARENA_W, y: -10,
            r: bDef.radius,
            vx: (Math.random() - 0.5) * 30,
            vy: bDef.speed,
            color: bDef.color, life: 5000
          });
        }
        break;
      }
      case "diagonal": {
        const rad = (bDef.angle * Math.PI) / 180;
        bullets.push({
          type: "circle",
          x: Math.random() < 0.5 ? -10 : ARENA_W + 10,
          y: Math.random() * ARENA_H,
          r: bDef.radius,
          vx: Math.cos(rad) * bDef.speed,
          vy: Math.sin(rad) * bDef.speed,
          color: bDef.color, life: 4000
        });
        break;
      }
    }
  }

  function _render() {
    renderAnimId = requestAnimationFrame(_render);
    const now = performance.now();
    const dt  = Math.min(now - lastRenderTime, 50);
    lastRenderTime = now;

    arenaCtx.clearRect(0, 0, ARENA_W, ARENA_H);
    arenaCtx.fillStyle = "#050c0a";
    arenaCtx.fillRect(0, 0, ARENA_W, ARENA_H);

    if (state === "enemy_turn") {
      _updateBullets(dt);
      _drawBullets();
      _checkCollisions();
    }

    cursor.trail.forEach((t, i) => {
      arenaCtx.save();
      arenaCtx.globalAlpha = (i / cursor.trail.length) * 0.4;
      arenaCtx.fillStyle   = cursor.color;
      arenaCtx.beginPath();
      arenaCtx.arc(t.x, t.y, cursor.r * 0.5, 0, Math.PI * 2);
      arenaCtx.fill();
      arenaCtx.restore();
    });

    if (!invincible || Math.floor(now / 80) % 2 === 0) _drawCursor();
  }

  function _drawCursor() {
    const { x, y, r, color } = cursor;
    const s = r * 0.75;
    arenaCtx.save();
    arenaCtx.fillStyle   = color;
    arenaCtx.strokeStyle = "#000";
    arenaCtx.lineWidth   = 1;
    arenaCtx.beginPath();
    arenaCtx.arc(x - s * 0.5, y - s * 0.25, s * 0.5, Math.PI, 0);
    arenaCtx.arc(x + s * 0.5, y - s * 0.25, s * 0.5, Math.PI, 0);
    arenaCtx.lineTo(x + s, y - s * 0.25);
    arenaCtx.lineTo(x, y + s * 0.85);
    arenaCtx.lineTo(x - s, y - s * 0.25);
    arenaCtx.closePath();
    arenaCtx.fill();
    arenaCtx.stroke();
    arenaCtx.restore();
  }

  function _updateBullets(dt) {
    const dtSec = dt / 1000;
    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      b.x += (b.vx || 0) * dtSec;
      b.y += (b.vy || 0) * dtSec;
      b.life -= dt;
      if (b.type === "hline") {
        if ((b.vx > 0 && b.x > ARENA_W + 50) || (b.vx < 0 && b.x + b.w < -10) || b.life <= 0)
          bullets.splice(i, 1);
      } else if (b.type === "vline") {
        if ((b.vy > 0 && b.y > ARENA_H + 50) || (b.vy < 0 && b.y + b.h < -10) || b.life <= 0)
          bullets.splice(i, 1);
      } else {
        if (b.x < -20 || b.x > ARENA_W + 20 || b.y < -20 || b.y > ARENA_H + 20 || b.life <= 0)
          bullets.splice(i, 1);
      }
    }
  }

  function _drawBullets() {
    for (const b of bullets) {
      arenaCtx.save();
      arenaCtx.fillStyle   = b.color;
      arenaCtx.globalAlpha = 0.9;
      if (b.type === "hline" || b.type === "vline") {
        arenaCtx.fillRect(b.x, b.y, b.w, b.h);
      } else {
        arenaCtx.beginPath();
        arenaCtx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        arenaCtx.fill();
        arenaCtx.strokeStyle = "#fff";
        arenaCtx.lineWidth   = 0.5;
        arenaCtx.stroke();
      }
      arenaCtx.restore();
    }
  }

  function _checkCollisions() {
    if (invincible) return;
    const cx = cursor.x, cy = cursor.y, cr = cursor.r * 0.55;
    for (const b of bullets) {
      let hit = false;
      let near = false;
      if (b.type === "hline") {
        const dist = Math.abs(cy - (b.y + b.h / 2));
        hit  = cx > b.x && cx < b.x + b.w && cy + cr > b.y && cy - cr < b.y + b.h;
        near = !hit && dist < 20 && cx > b.x - 10 && cx < b.x + b.w + 10;
      } else if (b.type === "vline") {
        const dist = Math.abs(cx - (b.x + b.w / 2));
        hit  = cx + cr > b.x && cx - cr < b.x + b.w && cy > b.y && cy < b.y + b.h;
        near = !hit && dist < 20;
      } else {
        const dx = cx - b.x, dy = cy - b.y;
        const d = Math.sqrt(dx*dx + dy*dy);
        hit  = d < cr + b.r;
        near = !hit && d < cr + b.r + 15;
      }
      // Sonido de esquive cercano
      if (near) {
        const now = Date.now();
        if (now - lastDodgeSnd > 200) {
          Audio.playDodge();
          lastDodgeSnd = now;
        }
      }
      if (hit) { _takeDamage(); break; }
    }
  }

  function _takeDamage() {
    if (invincible) return;
    const raw = enemy.atk - Math.floor(playerStats.def * 0.4);
    const dmg = Math.max(1, raw + Math.floor(Math.random() * 4) - 2);
    playerStats.hp   = Math.max(0, playerStats.hp - dmg);
    CONFIG.PLAYER.hp = playerStats.hp;

    Audio.playHurt();

    invincible   = true;
    cursor.color = "#ff0000";
    setTimeout(() => {
      invincible   = false;
      cursor.color = "#ffffff";
    }, 700);

    _updateBattleStats();
    if (playerStats.hp <= 0) {
      Audio.playDeath();
      setTimeout(() => _endBattle("defeat"), 500);
    }
  }

  function _checkEnemyPhase() {
    if (!enemy.phases) return;
    const hpPct = enemy.hp / enemy.maxHp;
    for (let i = currentPhase; i < enemy.phases.length; i++) {
      if (hpPct <= enemy.phases[i].hpPercent) {
        currentPhase = i + 1;
        enemy.atk   += enemy.phases[i].atkBoost;
        const newSprite = enemy.phases[i].newSprite || enemy.sprite;
        const newSpriteType = enemy.phases[i].newSpriteType || enemy.spriteType;
        enemy.sprite = newSprite;
        enemy.spriteType = newSpriteType;
        _renderEnemySprite(newSprite, newSpriteType);
        Audio.playPhaseChange();
        _showMessage(enemy.phases[i].message, 3000);
        break;
      }
    }
  }

  function _endBattle(result) {
    _cleanup();
    Audio.stopBGM(0.4);
    document.getElementById("screen-battle").classList.remove("active");
    if (onEnd) onEnd(result);
    if (result === "defeat" && onDefeat) onDefeat();
  }

  return { start };

})();
