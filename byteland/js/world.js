

window.World = (function() {

  const TS = 32;
  let canvas, ctx, minimapCanvas, minimapCtx;
  let zone, zoneData;
  let player = {
    x: 5 * TS, y: 5 * TS,
    w: 20, h: 24,
    speed: 2.8,
    dir: "down",
    frame: 0,
    frameTimer: 0
  };
  let camera = { x: 0, y: 0 };
  let scale = 1;
  let viewW, viewH;
  let animId = null;
  let lastTime = 0;

  
  let interactPressed = false;
  let interactCooldown = 0;
  let transitioningZone = false;

  
  let collectedItems   = new Set();
  let defeatedEnemies  = new Set();
  let bossTriggered    = false;

  
  let onDialogue   = null;
  let onBattle     = null;
  let onZoneChange = null;
  let onSign       = null;

  
  function init(zoneId, callbacks) {
    canvas        = document.getElementById("world-canvas");
    ctx           = canvas.getContext("2d");
    minimapCanvas = document.getElementById("minimap");
    minimapCtx    = minimapCanvas.getContext("2d");

    onDialogue   = callbacks.onDialogue;
    onBattle     = callbacks.onBattle;
    onZoneChange = callbacks.onZoneChange;
    onSign       = callbacks.onSign;

    bossTriggered = false;

    
    document.addEventListener("keydown", onInteractKey);

    loadZone(zoneId);
    resize();
    window.addEventListener("resize", resize);
    loop(0);
  }

  
  function onInteractKey(e) {
    const bindings = Controls.getBindings();
    if (
      e.key === bindings.interact ||
      e.key.toLowerCase() === bindings.interact.toLowerCase() ||
      e.key === "z" || e.key === "Z" ||
      e.key === " " || e.key === "Enter"
    ) {
      interactPressed = true;
    }
  }

  function resize() {
    const container = document.getElementById("world-container");
    viewW = container.clientWidth  || window.innerWidth;
    viewH = container.clientHeight || window.innerHeight;
    canvas.width  = viewW;
    canvas.height = viewH;
    scale = Math.min(viewW / (16 * TS), viewH / (11 * TS));
    if (scale < 1) scale = 1;
  }

  
  function loadZone(zoneId, spawn) {
    zone     = zoneId;
    zoneData = CONFIG.ZONES.find(z => z.id === zoneId);
    if (!zoneData) return;

    const start = spawn || zoneData.playerStart;
    player.x = start.x * TS + TS / 2 - player.w / 2;
    player.y = start.y * TS + TS / 2 - player.h / 2;
    player.dir = "down";

    document.getElementById("hud-area").textContent = "* " + zoneData.name;
    transitioningZone = false;
  }

  
  function loop(ts) {
    const dt = Math.min(ts - lastTime, 50);
    lastTime = ts;
    update(dt);
    draw();
    animId = requestAnimationFrame(loop);
  }

  function stop() {
    if (animId) { cancelAnimationFrame(animId); animId = null; }
  }
  function resume() {
    if (!animId) { lastTime = performance.now(); loop(lastTime); }
  }

  
  function update(dt) {
    if (transitioningZone) { interactPressed = false; return; }
    if (interactCooldown > 0) {
      interactCooldown -= dt;
      if (interactCooldown <= 0) interactCooldown = 0;
    }

    const moved = movePlayer(dt);
    if (moved) {
      player.frameTimer += dt;
      if (player.frameTimer > 180) { player.frame ^= 1; player.frameTimer = 0; if (typeof Audio !== "undefined" && Audio.playStep) Audio.playStep(); }
    } else {
      player.frame = 0;
    }

    checkInteraction();
    updateCamera();

    
    interactPressed = false;
  }

  function movePlayer(dt) {
    let dx = 0, dy = 0;
    if (Controls.isPressed("up"))    dy = -1;
    if (Controls.isPressed("down"))  dy =  1;
    if (Controls.isPressed("left"))  dx = -1;
    if (Controls.isPressed("right")) dx =  1;

    if (dx !== 0 || dy !== 0) {
      if      (dy < 0) player.dir = "up";
      else if (dy > 0) player.dir = "down";
      else if (dx < 0) player.dir = "left";
      else              player.dir = "right";

      const spd = player.speed * (dt / 16.67);
      const nx  = player.x + dx * spd;
      const ny  = player.y + dy * spd;

      if (!isBlocked(nx, player.y)) player.x = nx;
      if (!isBlocked(player.x, ny)) player.y = ny;
      return true;
    }
    return false;
  }

  function isBlocked(px, py) {
    if (!zoneData) return true;
    const map    = zoneData.map;
    const margin = 4;
    const corners = [
      { x: px + margin,            y: py + margin },
      { x: px + player.w - margin, y: py + margin },
      { x: px + margin,            y: py + player.h - margin },
      { x: px + player.w - margin, y: py + player.h - margin }
    ];
    for (const c of corners) {
      const tx  = Math.floor(c.x / TS);
      const ty  = Math.floor(c.y / TS);
      const row = map[ty];
      if (!row) return true;
      const tile = row[tx];
      
      
      if (tile === 1 || tile === 7) return true;
    }
    return false;
  }

  
  
  
  
  function checkInteraction() {
    if (!zoneData) return;
    const map = zoneData.map;

    
    const cx  = player.x + player.w / 2;
    const cy  = player.y + player.h / 2;
    const tx  = Math.floor(cx / TS);
    const ty  = Math.floor(cy / TS);

    
    if (zoneData.exitTile) {
      const ex = zoneData.exitTile.x;
      const ey = zoneData.exitTile.y;
      if (!transitioningZone && Math.abs(tx - ex) <= 1 && Math.abs(ty - ey) <= 1) {
        const locked = checkZoneLock();
        if (locked) {
          if (ty >= ey - 1 && Controls.isPressed("down") && interactPressed && interactCooldown <= 0) {
            interactCooldown = 1500;
            stop();
            const msg = buildLockMessage();
            if (onDialogue) onDialogue([{
              speaker: "SISTEMA",
              portrait: null,
              emotion: "triste",
              text: msg
            }]);
          }
          if (!interactPressed) return;
          
        } else {
          transitioningZone = true;
          stop();
          if (onZoneChange) onZoneChange(zoneData.nextZone);
          return;
        }
      }
    }

    
    if (zone === "servidor_central" && !bossTriggered && zoneData.bossEnemy) {
      // Trigger at row 17+ (near guardians at row 18), not row 11 (wall gap far from boss)
      if (ty >= 17 && !transitioningZone) {
        if (countEnemiesRemaining(zoneData) > 0) {
          // Guardianes aún vivos: bloquear el avance con mensaje
          if (onSign) onSign("¡Los Guardianes del NULLPOINTER\nbloqueaban el acceso al Profesor!\n\nDerrota a todos los guardianes\nantes de enfrentarte al jefe.");
          return;
        }
        bossTriggered = true;
        triggerBossSequence();
        return;
      }
    }

    
    if (!interactPressed || interactCooldown > 0) return;

    
    const candidates = [];

    
    let ftx = tx, fty = ty;
    if      (player.dir === "up")    fty--;
    else if (player.dir === "down")  fty++;
    else if (player.dir === "left")  ftx--;
    else if (player.dir === "right") ftx++;
    candidates.push({ tx: ftx, ty: fty, isFront: true });

    
    candidates.push({ tx: tx, ty: ty, isFront: false });

    
    let ftx2 = ftx, fty2 = fty;
    if      (player.dir === "up")    fty2--;
    else if (player.dir === "down")  fty2++;
    else if (player.dir === "left")  ftx2--;
    else if (player.dir === "right") ftx2++;
    candidates.push({ tx: ftx2, ty: fty2, isFront: true });

    for (const cand of candidates) {
      const { tx: cx2, ty: cy2 } = cand;
      if (!map[cy2] || map[cy2][cx2] === undefined) continue;
      const ftile = map[cy2][cx2];

      
      if (ftile === 2) {
        const term = (zoneData.terminals || []).find(t => t.tileX === cx2 && t.tileY === cy2);
        if (term && onDialogue) {
          interactCooldown = 600;
          stop();
          if (typeof Audio !== "undefined" && Audio.playTerminal) Audio.playTerminal();
          onDialogue([{ speaker: "> TERMINAL", portrait: null, emotion: "normal", text: term.message }]);
          return;
        }
      }

      
      if (ftile === 9) {
        const sign = (zoneData.signs || []).find(s => s.tileX === cx2 && s.tileY === cy2);
        if (sign && onDialogue) {
          interactCooldown = 600;
          stop();
          if (typeof Audio !== "undefined" && Audio.playSign) Audio.playSign();
          onDialogue([{ speaker: "* ", portrait: null, emotion: "normal", text: sign.text }]);
          return;
        }
      }

      
      if (ftile === 4) {
        const npc = (zoneData.npcs || []).find(n => n.tileX === cx2 && n.tileY === cy2);
        if (npc && onDialogue) {
          interactCooldown = 600;
          const char  = CONFIG.CHARACTERS[npc.character];
          const alreadySpoke = window.PROGRESS[npc.progressFlag];

          let dialogueData = npc.dialogue;
          if (alreadySpoke && npc.dialogueVisited) {
            dialogueData = npc.dialogueVisited;
          }

          const lines = dialogueData.map(d => ({
            speaker:  char.name,
            portrait: char.portraits[d.emotion],
            emotion:  d.emotion,
            text:     d.text
          }));

          stop();
          window.PROGRESS[npc.progressFlag] = true;
          updateProgressDisplay();
          onDialogue(lines);
          return;
        }
      }

      
      if (ftile === 6) {
        const item = (zoneData.items || []).find(i => i.tileX === cx2 && i.tileY === cy2);
        const key  = `${zone}:item:${cx2},${cy2}`;
        if (item && !collectedItems.has(key)) {
          interactCooldown = 600;
          collectedItems.add(key);
          applyItem(item);
          zoneData.map[cy2][cx2] = 0;
          return;
        }
      }

      
      if (ftile === 5) {
        triggerEnemyAt(cx2, cy2);
        return;
      }

      
      if (ftile === 7) {
        const locked = checkZoneLock();
        if (locked && onDialogue) {
          interactCooldown = 1000;
          stop();
          if (typeof Audio !== "undefined" && Audio.playLocked) Audio.playLocked();
          const msg = buildLockMessage();
          onDialogue([{ speaker: "SISTEMA", portrait: null, emotion: "triste", text: msg }]);
          return;
        }
      }
    }

    
    const onTile = map[ty] && map[ty][tx];
    if (onTile === 9) {
      const sign = (zoneData.signs || []).find(s => s.tileX === tx && s.tileY === ty);
      if (sign && onDialogue) {
        interactCooldown = 600;
        stop();
        onDialogue([{ speaker: "* ", portrait: null, emotion: "normal", text: sign.text }]);
        return;
      }
    }

    
    if (onTile === 5 && interactCooldown <= 0) {
      triggerEnemyAt(tx, ty);
    }
  }

  function triggerEnemyAt(ex, ey) {
    if (!zoneData) return;
    const enemy = (zoneData.enemies || []).find(e => e.tileX === ex && e.tileY === ey);
    const key   = `${zone}:enemy:${ex},${ey}`;
    if (enemy && !defeatedEnemies.has(key) && onBattle) {
      interactCooldown = 800;
      stop();
      onBattle(CONFIG.ENEMIES[enemy.id], enemy, key, () => {
        defeatedEnemies.add(key);
        zoneData.map[ey][ex] = 0;
        const flagKey = `zone${getZoneIndex() + 1}EnemiesDefeated`;
        window.PROGRESS[flagKey] = (window.PROGRESS[flagKey] || 0) + 1;
        updateProgressDisplay();
      });
    }
  }

  function triggerBossSequence() {
    const bossEnemy = zoneData.bossEnemy;
    if (!bossEnemy || !onBattle) return;
    stop();
    onBattle(CONFIG.ENEMIES[bossEnemy.id], bossEnemy, "boss_nullpointer", () => {
      window.PROGRESS.bossDefeated = true;
    });
  }

  function getZoneIndex() {
    return CONFIG.ZONES.findIndex(z => z.id === zone);
  }

  
  function checkZoneLock() {
    if (!zoneData || !zoneData.lockCondition) return false;
    const zIdx = getZoneIndex() + 1;
    if (zIdx === 1) {
      return countNPCsPending(zoneData) > 0 || countEnemiesRemaining(zoneData) > 0;
    }
    if (zIdx === 2) {
      return countNPCsPending(zoneData) > 0 || countEnemiesRemaining(zoneData) > 0;
    }
    if (zIdx === 3) {
      return countEnemiesRemaining(zoneData) > 0;
    }
    return false;
  }

  function countNPCsPending(zd) {
    if (!zd.npcs) return 0;
    return zd.npcs.filter(n => !window.PROGRESS[n.progressFlag]).length;
  }

  function countEnemiesRemaining(zd) {
    if (!zd.enemies) return 0;
    return zd.enemies.filter(e => {
      const key = `${zone}:enemy:${e.tileX},${e.tileY}`;
      return !defeatedEnemies.has(key);
    }).length;
  }

  function buildLockMessage() {
    if (!zoneData) return "Acceso denegado.";
    const zIdx        = getZoneIndex() + 1;
    const enemiesLeft = countEnemiesRemaining(zoneData);
    const npcsLeft    = zIdx <= 2 ? countNPCsPending(zoneData) : 0;
    let msg = zoneData.lockMessage || "La puerta esta bloqueada.";
    msg = msg.replace("{enemiesLeft}", enemiesLeft);
    msg = msg.replace("{npcsLeft}",    npcsLeft);
    return msg;
  }

  function updateProgressDisplay() {
    const scoreEl = document.getElementById("hud-score-val");
    if (scoreEl) scoreEl.textContent = CONFIG.PLAYER.score;
  }

  
  function applyItem(item) {
    const cfg = CONFIG.ITEMS[item.id];
    if (!cfg) return;
    if (cfg.effect === "heal") {
      CONFIG.PLAYER.hp = Math.min(CONFIG.PLAYER.maxHp, CONFIG.PLAYER.hp + cfg.value);
      if (typeof Audio !== "undefined" && Audio.playHeal) Audio.playHeal();
    } else if (cfg.effect === "atk") {
      CONFIG.PLAYER.atk += cfg.value;
      if (typeof Audio !== "undefined" && Audio.playItem) Audio.playItem();
    }
    updateHUD();
    if (onDialogue) {
      stop();
      onDialogue([{
        speaker: "ITEM",
        portrait: null,
        emotion: "feliz",
        text: `* ¡Obtuviste ${cfg.name}!\n  ${cfg.desc}`
      }]);
    }
  }

  function updateCamera() {
    if (!zoneData) return;
    const mapW   = zoneData.map[0].length * TS * scale;
    const mapH   = zoneData.map.length    * TS * scale;
    const target = {
      x: (player.x + player.w / 2) * scale - viewW / 2,
      y: (player.y + player.h / 2) * scale - viewH / 2
    };
    camera.x = Math.max(0, Math.min(target.x, Math.max(0, mapW - viewW)));
    camera.y = Math.max(0, Math.min(target.y, Math.max(0, mapH - viewH)));
  }

  
  
  
  function draw() {
    if (!zoneData) return;
    ctx.clearRect(0, 0, viewW, viewH);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, viewW, viewH);

    ctx.save();
    ctx.translate(-camera.x, -camera.y);
    ctx.scale(scale, scale);

    drawTiles();
    drawEntities();
    drawPlayer();

    ctx.restore();
    drawMinimap();
    updateHUD();
  }

  
  function drawTiles() {
    const map  = zoneData.map;
    const rows = map.length;
    const cols = map[0].length;
    const now  = performance.now();

    
    const floor   = zoneData.floorColor   || "#1a1a2e";
    const wall    = zoneData.wallColor    || "#2a2a40";
    const accent  = zoneData.accentColor  || "#ffffff";

    
    const wallTop  = lerpColor(wall, "#ffffff", 0.35);
    const wallSide = lerpColor(wall, "#000000", 0.2);

    
    const checkerDark  = lerpColor(floor, "#000000", 0.12);
    const checkerLight = floor;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const tile = map[row][col];
        const x = col * TS;
        const y = row * TS;

        switch (tile) {
          case 0: { 
            const isChecker = (row + col) % 2 === 0;
            ctx.fillStyle = isChecker ? checkerDark : checkerLight;
            ctx.fillRect(x, y, TS, TS);
            
            ctx.strokeStyle = "rgba(0,0,0,0.18)";
            ctx.lineWidth = 0.5;
            ctx.strokeRect(x, y, TS, TS);
            break;
          }

          case 1: { 
            
            ctx.fillStyle = wall;
            ctx.fillRect(x, y, TS, TS);
            
            ctx.fillStyle = wallTop;
            ctx.fillRect(x, y, TS, 6);
            
            ctx.fillStyle = lerpColor(wall, "#ffffff", 0.18);
            ctx.fillRect(x, y, 3, TS);
            
            ctx.fillStyle = wallSide;
            ctx.fillRect(x, y + TS - 4, TS, 4);
            
            ctx.fillStyle = "rgba(0,0,0,0.25)";
            ctx.fillRect(x, y + TS / 2, TS, 2);        
            
            if (row % 2 === 0) {
              ctx.fillRect(x + TS / 2, y, 2, TS / 2);  
            } else {
              ctx.fillRect(x + TS / 4, y + TS/2, 2, TS / 2); 
            }
            
            ctx.strokeStyle = "#000";
            ctx.lineWidth = 1;
            ctx.strokeRect(x + 0.5, y + 0.5, TS - 1, TS - 1);
            break;
          }

          case 2: { 
            
            const isChk = (row + col) % 2 === 0;
            ctx.fillStyle = isChk ? checkerDark : checkerLight;
            ctx.fillRect(x, y, TS, TS);
            
            ctx.fillStyle = "#333";
            ctx.fillRect(x + 4, y + 6, TS - 8, TS - 10);
            
            const pulse = 0.7 + Math.sin(now / 800 + col) * 0.3;
            ctx.fillStyle = lerpColor("#000033", accent, pulse * 0.6);
            ctx.fillRect(x + 6, y + 8, TS - 12, TS - 18);
            
            ctx.fillStyle = "rgba(255,255,255,0.4)";
            ctx.fillRect(x + 6, y + 10, TS - 12, 1);
            ctx.fillRect(x + 6, y + 13, TS - 12, 1);
            ctx.fillRect(x + 6, y + 16, TS - 12, 1);
            
            ctx.fillStyle = "#555";
            ctx.fillRect(x + TS/2 - 3, y + TS - 8, 6, 4);
            ctx.fillRect(x + 6, y + TS - 5, TS - 12, 3);
            
            ctx.strokeStyle = "#000";
            ctx.lineWidth = 1;
            ctx.strokeRect(x + 4, y + 6, TS - 8, TS - 10);
            break;
          }

          case 3: { 
            ctx.fillStyle = "#1a3311";
            ctx.fillRect(x, y, TS, TS);
            
            ctx.fillStyle = "#2a5020";
            ctx.fillRect(x + 6, y + 2, TS - 12, TS - 2);
            ctx.strokeStyle = "#000";
            ctx.lineWidth = 1;
            ctx.strokeRect(x + 6, y + 2, TS - 12, TS - 2);
            break;
          }

          case 4: { 
            const isChk = (row + col) % 2 === 0;
            ctx.fillStyle = isChk ? checkerDark : checkerLight;
            ctx.fillRect(x, y, TS, TS);
            ctx.strokeStyle = "rgba(0,0,0,0.18)";
            ctx.lineWidth = 0.5;
            ctx.strokeRect(x, y, TS, TS);
            break;
          }

          case 5: { 
            ctx.fillStyle = "#1a0000";
            ctx.fillRect(x, y, TS, TS);
            
            const danger = (Math.sin(now / 400) + 1) / 2;
            ctx.strokeStyle = `rgba(200,0,0,${0.4 + danger * 0.6})`;
            ctx.lineWidth = 2;
            ctx.strokeRect(x + 1, y + 1, TS - 2, TS - 2);
            break;
          }

          case 6: { 
            const isChk = (row + col) % 2 === 0;
            ctx.fillStyle = isChk ? checkerDark : checkerLight;
            ctx.fillRect(x, y, TS, TS);
            ctx.strokeStyle = "rgba(0,0,0,0.18)";
            ctx.lineWidth = 0.5;
            ctx.strokeRect(x, y, TS, TS);
            break;
          }

          case 7: { 
            const unlocked = !checkZoneLock();
            if (unlocked) {
              
              ctx.fillStyle = "#1a3311";
              ctx.fillRect(x, y, TS, TS);
              ctx.fillStyle = "#2a5020";
              ctx.fillRect(x + 4, y + 0, TS - 8, TS);
              ctx.strokeStyle = "#000";
              ctx.lineWidth = 1;
              ctx.strokeRect(x + 4, y, TS - 8, TS);
            } else {
              
              ctx.fillStyle = wall;
              ctx.fillRect(x, y, TS, TS);
              ctx.fillStyle = wallTop;
              ctx.fillRect(x, y, TS, 5);
              ctx.fillStyle = wallSide;
              ctx.fillRect(x, y + TS - 3, TS, 3);
              
              const lx = x + TS/2 - 5, ly = y + TS/2 - 5;
              ctx.fillStyle = "#ffcc00";
              ctx.fillRect(lx + 2, ly, 6, 5);     
              ctx.fillStyle = "rgba(0,0,0,0.8)";
              ctx.fillRect(lx + 3, ly + 1, 4, 4); 
              ctx.fillStyle = "#ffcc00";
              ctx.fillRect(lx, ly + 4, 10, 7);    
              ctx.fillStyle = "#000";
              ctx.fillRect(lx + 3, ly + 6, 4, 3); 
              ctx.strokeStyle = "#000";
              ctx.lineWidth = 1;
              ctx.strokeRect(x + 0.5, y + 0.5, TS - 1, TS - 1);
            }
            break;
          }

          case 8: { 
            ctx.fillStyle = "#0a1a0a";
            ctx.fillRect(x, y, TS, TS);
            break;
          }

          case 9: { 
            const isChk = (row + col) % 2 === 0;
            ctx.fillStyle = isChk ? checkerDark : checkerLight;
            ctx.fillRect(x, y, TS, TS);
            
            ctx.fillStyle = "#7a4a1a";
            ctx.fillRect(x + TS/2 - 2, y + TS/2, 4, TS/2 - 2);
            
            ctx.fillStyle = "#aa6a2a";
            ctx.fillRect(x + 4, y + 6, TS - 8, TS/2 - 4);
            ctx.strokeStyle = "#4a2a00";
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x + 4, y + 6, TS - 8, TS/2 - 4);
            
            ctx.fillStyle = "#fff";
            ctx.font = "bold 10px monospace";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("!", x + TS/2, y + TS/4 + 2);
            break;
          }
        }
      }
    }
  }

  
  function drawEntities() {
    const now = performance.now();

    
    for (const npc of (zoneData.npcs || [])) {
      const x    = npc.tileX * TS + TS / 2;
      const y    = npc.tileY * TS + TS / 2;
      const char = CONFIG.CHARACTERS[npc.character];
      const bob  = Math.sin(now / 800 + npc.tileX) * 1.5;
      const spoke = window.PROGRESS[npc.progressFlag];

      ctx.save();
      
      drawUTCharacter(ctx, x, y + bob, char.color, spoke);
      
      if (!spoke) {
        const excPulse = Math.abs(Math.sin(now / 500));
        ctx.fillStyle = `rgba(255,255,0,${0.7 + excPulse * 0.3})`;
        ctx.font = `bold ${TS * 0.5}px monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("!", x, y + bob - TS * 0.75);
      }
      ctx.restore();
    }

    
    for (const enemy of (zoneData.enemies || [])) {
      const key = `${zone}:enemy:${enemy.tileX},${enemy.tileY}`;
      if (defeatedEnemies.has(key)) continue;
      const x    = enemy.tileX * TS + TS / 2;
      const y    = enemy.tileY * TS + TS / 2;
      const eDef = CONFIG.ENEMIES[enemy.id];
      if (!eDef) continue;

      const hover = Math.sin(now / 600 + enemy.tileX) * 2;
      const pulse = (Math.sin(now / 350) + 1) / 2;

      ctx.save();
      ctx.globalAlpha = 0.85 + pulse * 0.15;
      
      ctx.font = `${TS * 0.8}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(eDef.sprite, x, y + hover);
      ctx.restore();
    }

    
    if (zoneData.bossEnemy && !bossTriggered) {
      const b = zoneData.bossEnemy;
      const bDef = CONFIG.ENEMIES[b.id];
      if (bDef) {
        const pulse = (Math.sin(now / 250) + 1) / 2;
        const hover = Math.sin(now / 500) * 3;
        const bx = b.tileX * TS + TS / 2;
        const by = b.tileY * TS + TS / 2 + hover;
        ctx.save();
        ctx.globalAlpha = 0.75 + pulse * 0.25;
        if (bDef.spriteType === "img") {
          // Draw boss as image sprite
          if (!window._bossImg) {
            window._bossImg = new Image();
            window._bossImg.src = bDef.sprite;
          }
          if (window._bossImg.complete) {
            const bSize = TS * 1.8;
            ctx.drawImage(window._bossImg, bx - bSize / 2, by - bSize / 2, bSize, bSize);
          } else {
            // Fallback text while image loads
            ctx.font = `${TS}px sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "#cc44ff";
            ctx.fillText("👨‍🏫", bx, by);
          }
        } else {
          ctx.font = `${TS}px sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(bDef.sprite, bx, by);
        }
        ctx.restore();
      }
    }

    
    for (const item of (zoneData.items || [])) {
      const key = `${zone}:item:${item.tileX},${item.tileY}`;
      if (collectedItems.has(key)) continue;
      const x      = item.tileX * TS + TS / 2;
      const y      = item.tileY * TS + TS / 2;
      const bounce = Math.sin(now / 500 + item.tileX) * 3;
      const cfg    = CONFIG.ITEMS[item.id];
      if (!cfg) continue;

      ctx.save();
      
      drawItemBox(ctx, x, y + bounce, cfg.emoji);
      ctx.restore();
    }
  }

  
  function drawUTCharacter(ctx, cx, cy, color, dimmed) {
    const alpha = dimmed ? 0.7 : 1.0;
    ctx.globalAlpha = alpha;
    
    ctx.fillStyle = color;
    ctx.fillRect(cx - 6, cy - 18, 12, 10);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    ctx.strokeRect(cx - 6, cy - 18, 12, 10);
    
    ctx.fillStyle = "#fff";
    ctx.fillRect(cx - 4, cy - 16, 2, 2);
    ctx.fillRect(cx + 2,  cy - 16, 2, 2);
    
    ctx.fillStyle = lerpColor(color, "#000", 0.25);
    ctx.fillRect(cx - 5, cy - 8, 10, 10);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    ctx.strokeRect(cx - 5, cy - 8, 10, 10);
    
    ctx.fillStyle = lerpColor(color, "#000", 0.4);
    ctx.fillRect(cx - 5, cy + 2, 4, 6);
    ctx.fillRect(cx + 1,  cy + 2, 4, 6);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    ctx.strokeRect(cx - 5, cy + 2, 4, 6);
    ctx.strokeRect(cx + 1,  cy + 2, 4, 6);
    ctx.globalAlpha = 1.0;
  }

  
  function drawItemBox(ctx, cx, cy, emoji) {
    
    ctx.fillStyle = "#ffff00";
    ctx.fillRect(cx - 10, cy - 10, 20, 18);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(cx - 10, cy - 10, 20, 18);
    
    ctx.fillStyle = "#fff";
    ctx.fillRect(cx - 4, cy - 7, 4, 3);
    
    ctx.font = "12px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(emoji, cx, cy + 1);
  }

  
  function drawPlayer() {
    const cx = player.x + player.w / 2;
    const cy = player.y + player.h / 2;

    
    ctx.save();
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.ellipse(cx, player.y + player.h + 1, player.w * 0.35, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    
    ctx.save();
    drawFrisk(ctx, cx, cy);
    ctx.restore();
  }

  function drawFrisk(ctx, cx, cy) {
    
    const bodyColor = "#8B4513";
    const skinColor = "#FFDAB9";
    const hairColor = "#4a2000";

    
    ctx.fillStyle = skinColor;
    ctx.fillRect(cx - 5, cy - 16, 10, 9);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    ctx.strokeRect(cx - 5, cy - 16, 10, 9);

    
    ctx.fillStyle = hairColor;
    ctx.fillRect(cx - 5, cy - 16, 10, 3);
    if (player.dir !== "up") {
      
      if (player.dir !== "down") {
        ctx.fillStyle = "#000";
        ctx.fillRect(player.dir === "left" ? cx - 3 : cx + 1, cy - 12, 2, 2);
      } else {
        ctx.fillStyle = "#000";
        ctx.fillRect(cx - 3, cy - 12, 2, 2);
        ctx.fillRect(cx + 1,  cy - 12, 2, 2);
      }
    }

    
    ctx.fillStyle = bodyColor;
    ctx.fillRect(cx - 4, cy - 7, 8, 8);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    ctx.strokeRect(cx - 4, cy - 7, 8, 8);

    
    const legOff = player.frame === 1 ? 2 : 0;
    ctx.fillStyle = "#5a3011";
    ctx.fillRect(cx - 4, cy + 1, 3, 5 + (player.frame === 0 ? legOff : 0));
    ctx.fillRect(cx + 1,  cy + 1, 3, 5 + (player.frame === 1 ? legOff : 0));
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    ctx.strokeRect(cx - 4, cy + 1, 3, 5);
    ctx.strokeRect(cx + 1,  cy + 1, 3, 5);
  }

  
  function drawMinimap() {
    if (!zoneData || !minimapCtx) return;
    const mW   = minimapCanvas.width  || 80;
    const mH   = minimapCanvas.height || 60;
    const map  = zoneData.map;
    const rows = map.length;
    const cols = map[0].length;
    const tw   = mW / cols;
    const th   = mH / rows;

    minimapCtx.clearRect(0, 0, mW, mH);
    minimapCtx.fillStyle = "#000";
    minimapCtx.fillRect(0, 0, mW, mH);

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const tile = map[row][col];
        switch (tile) {
          case 0: minimapCtx.fillStyle = "rgba(255,255,255,0.12)"; break;
          case 1: minimapCtx.fillStyle = "rgba(255,255,255,0.7)";  break;
          case 2: minimapCtx.fillStyle = "#00aaff";                break;
          case 4: minimapCtx.fillStyle = "#ffffff";                break;
          case 5: minimapCtx.fillStyle = "#ff0000";                break;
          case 6: minimapCtx.fillStyle = "#ffff00";                break;
          case 7: minimapCtx.fillStyle = "#ffaa00";                break;
          case 9: minimapCtx.fillStyle = "#aaa";                   break;
          default: minimapCtx.fillStyle = "transparent";
        }
        minimapCtx.fillRect(col * tw, row * th, tw, th);
      }
    }

    
    const px = ((player.x + player.w / 2) / TS) * tw;
    const py = ((player.y + player.h / 2) / TS) * th;
    minimapCtx.fillStyle = "#ff0000";
    minimapCtx.fillRect(px - 2, py - 2, 4, 4);
  }

  function updateHUD() {
    const hpEl    = document.getElementById("hud-hp-val");
    const scoreEl = document.getElementById("hud-score-val");
    if (hpEl)    hpEl.textContent    = CONFIG.PLAYER.hp;
    if (scoreEl) scoreEl.textContent = CONFIG.PLAYER.score;
  }

  
  
  function lerpColor(hexA, hexB, t) {
    const parse = (h) => {
      h = h.replace("#","");
      if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
      return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
    };
    const [ar,ag,ab] = parse(hexA);
    const [br,bg,bb] = parse(hexB);
    const r = Math.round(ar + (br - ar) * t);
    const g = Math.round(ag + (bg - ag) * t);
    const b = Math.round(ab + (bb - ab) * t);
    return `rgb(${r},${g},${b})`;
  }

  return {
    init,
    stop,
    resume,
    loadZone,
    getZone: () => zone
  };

})();
