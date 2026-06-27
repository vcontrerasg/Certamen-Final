<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BYTELAND — El Mundo de los Bits</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>

<!-- ══ TÍTULO ══════════════════════════════════════════════ -->
<div id="screen-title" class="screen active">
  <div class="title-bg">
    <div class="scanlines"></div>
    <div class="title-content">
      <div class="title-logo">
        <span class="title-main">BYTELAND</span>
        <span class="title-sub">El Mundo de los Bits</span>
      </div>
      <div class="title-menu">
        <button class="menu-btn" id="btn-start">INICIAR JUEGO</button>
        <button class="menu-btn" id="btn-controls">CONTROLES</button>
        <button class="menu-btn" id="btn-credits">CREDITOS</button>
      </div>
      <div class="title-credits">
        <p>Un RPG de exploracion · Estilo Undertale</p>
        <p>Victor · Fabian · Sebastian</p>
        <p style="opacity:0.5; font-size:9px">Informatica — ByteOS 4.2</p>
      </div>
      <div class="title-hint">[ Z / Enter para iniciar ]</div>
    </div>
  </div>
</div>

<!-- ══ CONTROLES ═══════════════════════════════════════════ -->
<div id="screen-controls" class="screen">
  <div class="panel-window">
    <div class="panel-title">CONFIGURAR CONTROLES</div>
    <div class="controls-grid" id="controls-grid"></div>
    <p class="controls-hint">Haz clic en una accion y presiona la tecla nueva</p>
    <button class="menu-btn" id="btn-controls-back">VOLVER</button>
  </div>
</div>

<!-- ══ CRÉDITOS ════════════════════════════════════════════ -->
<div id="screen-credits" class="screen">
  <div class="panel-window">
    <div class="panel-title">CREDITOS</div>
    <div class="credits-content">
      <h3>BYTELAND — El Mundo de los Bits</h3>
      <p>Un RPG de exploracion tematico de informatica</p>
      <br>
      <h4>Desarrolladores</h4>
      <p>Victor &bull; Fabian &bull; Sebastian</p>
      <br>
      <h4>Inspirado en</h4>
      <p>Undertale (Toby Fox, 2015)</p>
      <br>
      <h4>Tecnologias</h4>
      <p>HTML5 &bull; CSS3 &bull; JavaScript Vanilla</p>
      <br>
      <h4>Zonas del mundo</h4>
      <p>Terminal de Acceso → Distrito RAM</p>
      <p>Firewall Sector 7 → Servidor Central</p>
      <br>
      <h4>Controles</h4>
      <p>Flechas/WASD — Mover &bull; Z — Interactuar</p>
    </div>
    <button class="menu-btn" id="btn-credits-back">VOLVER</button>
  </div>
</div>

<!-- ══ OVERWORLD ═══════════════════════════════════════════ -->
<div id="screen-world" class="screen">
  <div id="world-container">
    <canvas id="world-canvas"></canvas>
    <!-- HUD Undertale-style -->
    <div id="hud">
      <div id="hud-left">
        <span id="hud-area">* Terminal de Acceso</span>
      </div>
      <div id="hud-right">
        <span id="hud-hp">❤ <span id="hud-hp-val">100</span>/100</span>
        <span id="hud-score">💾 <span id="hud-score-val">0</span> pts</span>
      </div>
    </div>
    <!-- Control hint -->
    <div id="hud-progress-bar">
      <span id="prog-hint">Flechas: mover · Z: interactuar · Acercate a NPCs y terminales</span>
    </div>
    <!-- Minimap -->
    <div id="minimap-wrap">
      <div id="minimap-label">MAPA</div>
      <canvas id="minimap" width="80" height="60"></canvas>
    </div>
  </div>
</div>

<!-- ══ DIÁLOGO (Undertale style) ════════════════════════════ -->
<div id="screen-dialogue" class="screen">
  <div id="world-bg-blur"></div>
  <div id="dialogue-box">
    <div id="dialogue-portrait-area">
      <img id="dialogue-portrait" src="" alt="personaje" style="display:none" onerror="this.style.display='none'; document.getElementById('dialogue-portrait-placeholder').style.display='flex'">
      <div id="dialogue-portrait-placeholder" style="display:flex">❤</div>
    </div>
    <div id="dialogue-text-area">
      <div id="dialogue-speaker"></div>
      <div id="dialogue-text"></div>
      <div id="dialogue-arrow">▼</div>
    </div>
  </div>
  <div id="dialogue-hint">[ Z / Espacio / Enter para continuar ]</div>
</div>

<!-- ══ BATALLA ═════════════════════════════════════════════ -->
<div id="screen-battle" class="screen">
  <div id="battle-wrapper">

    <!-- Enemy -->
    <div id="battle-enemy-area">
      <div id="battle-enemy-sprite"></div>
      <div id="battle-enemy-name-hp">
        <span id="battle-enemy-name">???</span>
        <div id="battle-enemy-hpbar-outer">
          <div id="battle-enemy-hpbar"></div>
        </div>
      </div>
    </div>

    <!-- Arena (heart dodging area) -->
    <div id="battle-arena-wrap">
      <canvas id="battle-arena"></canvas>
      <div id="battle-message"></div>
    </div>

    <!-- UI Panel — Undertale bottom panel -->
    <div id="battle-ui">
      <div id="battle-stats">
        <span>❤ <span id="b-hp-val">100</span>/<span id="b-hp-max">100</span></span>
        <span>ATK <span id="b-atk-val">10</span></span>
        <span>DEF <span id="b-def-val">5</span></span>
        <div id="battle-hp-outer">
          <div id="battle-hp-bar"></div>
        </div>
      </div>
      <div id="battle-actions">
        <button class="battle-btn" id="b-fight">⚔ LUCHAR</button>
        <button class="battle-btn" id="b-act">💬 ACTUAR</button>
        <button class="battle-btn" id="b-mercy">❤ PIEDAD</button>
        <button class="battle-btn" id="b-item">🎒 ITEMS</button>
      </div>
      <div id="battle-submenu" class="hidden">
        <div id="battle-submenu-title"></div>
        <div id="battle-submenu-options"></div>
        <button class="menu-btn small" id="b-submenu-back">◀ VOLVER</button>
      </div>
      <div id="battle-flavor"></div>
    </div>

  </div>
</div>

<!-- ══ GAME OVER ═══════════════════════════════════════════ -->
<div id="screen-gameover" class="screen">
  <div class="gameover-content">
    <div class="gameover-title">GAME OVER</div>
    <div class="gameover-msg" id="gameover-msg">El sistema ha fallado...</div>
    <div class="gameover-score">Score: <span id="gameover-score">0</span></div>
    <button class="menu-btn" id="btn-retry">REINTENTAR</button>
    <button class="menu-btn" id="btn-title">PANTALLA DE TITULO</button>
  </div>
</div>

<!-- ══ VICTORIA ════════════════════════════════════════════ -->
<div id="screen-victory" class="screen">
  <div class="victory-content">
    <div class="victory-title">VICTORIA</div>
    <div class="victory-msg" id="victory-msg">¡BYTELAND ha sido liberado!</div>
    <div class="victory-score">Score final: <span id="victory-score">0</span></div>
    <button class="menu-btn" id="btn-victory-title">PANTALLA DE TITULO</button>
  </div>
</div>

<!-- Scripts -->
<script src="js/audio.js"></script>
<script src="js/config.js"></script>
<script src="js/controls.js"></script>
<script src="js/world.js"></script>
<script src="js/dialogue.js"></script>
<script src="js/battle.js"></script>
<script src="js/game.js"></script>
</body>
</html>
