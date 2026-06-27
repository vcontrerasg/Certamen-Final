window.Game = (function() {

  let currentScreen = "title";
  let currentZone   = "terminal";

  function showScreen(id) {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    const el = document.getElementById("screen-" + id);
    if (el) el.classList.add("active");
    currentScreen = id;
  }

  function init() {
    Audio.init();
    Controls.init();
    bindTitleButtons();
    bindGameOverButtons();
    showScreen("title");
    Audio.playBGM("title");

    document.addEventListener("keydown", (e) => {
      if (currentScreen === "title" && (e.key === "Enter" || e.key === "z" || e.key === "Z")) startGame();
    });
  }

  function bindTitleButtons() {
    document.getElementById("btn-start").onclick    = () => { Audio.playConfirm(); startGame(); };
    document.getElementById("btn-controls").onclick = () => {
      Audio.playMenuOpen();
      Controls.renderControlsUI();
      showScreen("controls");
    };
    document.getElementById("btn-controls-back").onclick = () => {
      Audio.playCancel();
      Controls.updateHints();
      showScreen("title");
    };
    document.getElementById("btn-credits").onclick      = () => { Audio.playMenuOpen(); showScreen("credits"); };
    document.getElementById("btn-credits-back").onclick = () => { Audio.playCancel(); showScreen("title"); };
  }

  function bindGameOverButtons() {
    document.getElementById("btn-retry").onclick         = () => { Audio.playConfirm(); startGame(); };
    document.getElementById("btn-title").onclick         = () => { World.stop(); Audio.playBGM("title"); showScreen("title"); };
    document.getElementById("btn-victory-title").onclick = () => { World.stop(); Audio.playBGM("title"); showScreen("title"); };
  }

  function startGame() {
    CONFIG.PLAYER.hp    = CONFIG.PLAYER.maxHp;
    CONFIG.PLAYER.score = 0;
    CONFIG.PLAYER.atk   = 10;
    CONFIG.PLAYER.def   = 5;
    currentZone = "terminal";

    window.PROGRESS = Object.assign({}, CONFIG.PROGRESS_DEFAULTS);

    showScreen("world");
    Audio.playBGM("terminal");

    World.init(currentZone, {
      onDialogue:   handleDialogue,
      onBattle:     handleBattle,
      onZoneChange: handleZoneChange,
      onSign:       handleSign
    });

    setTimeout(() => {
      World.stop();
      handleDialogue([
        {
          speaker: "ByteOS 4.2",
          portrait: null,
          emotion: "normal",
          text: "Iniciando sesion...\nBienvenido, Usuario.\nAcceso concedido: Nivel basico.\n\nEste sistema esta en crisis.\nNecesitamos tu ayuda."
        },
        {
          speaker: "ByteOS 4.2",
          portrait: null,
          emotion: "triste",
          text: "Un proceso llamado NULLPOINTER esta\ncorrompiendo el nucleo desde hace 72 horas.\n\nHabla con los residentes de esta zona.\nEllos te explicaran que hacer.\n\n(Usa Z o Enter para interactuar)"
        }
      ]);
    }, 400);
  }

  function handleDialogue(lines) {
    showScreen("dialogue");
    document.getElementById("screen-world").style.display = "flex";
    Dialogue.show(lines, () => {
      document.getElementById("screen-world").style.display = "";
      showScreen("world");
      World.resume();
    });
  }

  function handleSign(text) {
    Audio.playSign();
    handleDialogue([{ speaker: "* ", portrait: null, emotion: "normal", text }]);
  }

  function handleBattle(enemyCfg, enemyObj, key, onDefeated) {
    const isBoss = enemyCfg.isBoss || false;

    if (isBoss) {
      const introLines = [
        {
          speaker: "SISTEMA",
          portrait: null,
          emotion: "triste",
          text: "ALERTA MAXIMA\nEl Profesor localizado en el núcleo\nIniciando protocolo de emergencia...\nNivel de amenaza: ACADEMICO CRITICO"
        },
        {
          speaker: "EL PROFESOR",
          portrait: "img/profesor_fase1.png",
          emotion: "normal",
          text: "...¿IA? ¿En mi asignatura?\n\nLlevo años enseñando esto.\nY así me pagan.\n\nVamos a ver qué saben realmente."
        },
        {
          speaker: "EL PROFESOR",
          portrait: "img/profesor_fase1.png",
          emotion: "triste",
          text: "No se pueden usar herramientas de IA\nsin entender lo que hacen.\nEso no es aprender. Eso es engañarse.\n\n...EVALUACION INICIADA"
        }
      ];

      showScreen("dialogue");
      document.getElementById("screen-world").style.display = "flex";
      Audio.stopBGM(0.8);
      setTimeout(() => Audio.playBossStart(), 200);
      Dialogue.show(introLines, () => {
        document.getElementById("screen-world").style.display = "";
        showScreen("battle");
        Audio.playBGM("battle_boss");
        startBattle(enemyCfg, enemyObj, key, onDefeated);
      });
    } else {
      showScreen("battle");
      Audio.playBattleStart();
      setTimeout(() => {
        const zoneBattleMusic = {
          terminal:         "battle_normal",
          ram_district:     "battle_ram",
          firewall:         "battle_firewall",
          servidor_central: "battle_servidor"
        };
        Audio.playBGM(zoneBattleMusic[currentZone] || "battle_normal");
      }, 600);
      startBattle(enemyCfg, enemyObj, key, onDefeated);
    }
  }

  function startBattle(enemyCfg, enemyObj, key, onDefeated) {
    Battle.start(enemyObj, {
      onEnd: (result) => {
        if (result === "defeat") return;
        if (onDefeated) onDefeated();

        const isBoss = enemyObj.isBoss || enemyCfg.isBoss;
        if (isBoss) {
          handleBossVictory(result);
        } else {
          handleEnemyVictory(enemyCfg, result);
        }
      },
      onDefeat: () => showGameOver()
    });
  }

  function handleEnemyVictory(enemyCfg, result) {
    const scoreGained = result === "mercy"
      ? Math.floor((enemyCfg.score || 0) * 0.7)
      : (enemyCfg.score || 0);

    CONFIG.PLAYER.score += scoreGained;

    if (result === "mercy") {
      Audio.playMercy();
    } else {
      Audio.playDefeat();
    }

    const speaker = result === "mercy" ? "REPARADO" : "DERROTA ENEMIGA";
    const txt = result === "mercy"
      ? `${enemyCfg.name} fue reparado y reintegrado.\n+${scoreGained} puntos`
      : `${enemyCfg.name} eliminado del sistema.\n+${scoreGained} puntos\nTotal: ${CONFIG.PLAYER.score} pts`;

    showScreen("dialogue");
    document.getElementById("screen-world").style.display = "flex";
    Dialogue.show([{ speaker, portrait: null, emotion: "normal", text: txt }], () => {
      document.getElementById("screen-world").style.display = "";
      showScreen("world");
      // Restaurar BGM de la zona DESPUÉS de cerrar el diálogo
      Audio.playBGM(currentZone);
      World.resume();
    });
  }

  function handleBossVictory(result) {
    window.PROGRESS.bossDefeated = true;
    Audio.stopBGM(0.5);
    setTimeout(() => Audio.playVictory(), 300);

    const victoryLines = [
      {
        speaker: "SISTEMA",
        portrait: null,
        emotion: "feliz",
        text: "Proceso crítico: DETENIDO\nLimpiando registros académicos...\nRestaurando integridad del sistema...\nProgreso: ████████████ 100%"
      },
      {
        speaker: "Victor",
        portrait: CONFIG.CHARACTERS.victor.portraits.feliz,
        emotion: "feliz",
        text: "¡Lo lograste! ¡El código vuelve a compilar correctamente!\n\nNunca había visto un proceso tan resiliente.\n¡BYTELAND está a salvo!"
      },
      {
        speaker: "Fabian",
        portrait: CONFIG.CHARACTERS.fabian.portraits.feliz,
        emotion: "feliz",
        text: "Mis herramientas de debugging nunca habían detectado cero errores...\n\n¡Hasta ahora! Error count: 0.\nPor primera vez en 72 horas."
      },
      {
        speaker: "Sebastian",
        portrait: CONFIG.CHARACTERS.seba.portraits.feliz,
        emotion: "feliz",
        text: "Acceso root: RESTAURADO.\nSistema: LIMPIO.\nIntegridad: 100%.\n\n...Gracias.\nDe verdad."
      }
    ];

    if (result === "mercy") {
      victoryLines.push({
        speaker: "EL PROFESOR",
        portrait: "img/profesor_perdon.png",
        emotion: "feliz",
        text: "...\n\nEsperé que alguien me pidiera disculpas\nde verdad. Que entendiera por qué importa.\n\nUsar IA no está mal si se hace con honestidad.\nLo que no acepto es el engaño."
      });
      victoryLines.push({
        speaker: "EL PROFESOR",
        portrait: "img/profesor_perdon.png",
        emotion: "feliz",
        text: "Esta vez... los perdono.\n\nPero la próxima vez que usen IA,\nquiero que me lo digan. Y que me expliquen\nqué aprendieron de verdad.\n\n¿Trato?"
      });
    }

    showScreen("dialogue");
    document.getElementById("screen-world").style.display = "flex";
    Dialogue.show(victoryLines, () => {
      document.getElementById("screen-world").style.display = "";
      showVictory(result);
    });
  }

  function handleZoneChange(newZoneId) {
    const newZone = CONFIG.ZONES.find(z => z.id === newZoneId);
    Audio.playZoneTransition();

    const transLines = [
      {
        speaker: "SISTEMA",
        portrait: null,
        emotion: "normal",
        text: `Accediendo: /${newZoneId.replace(/_/g, "/")}\nCargando: ${newZone ? newZone.name : newZoneId}...\nAcceso concedido.\nPreparando entorno...`
      }
    ];

    const idx = CONFIG.ZONES.findIndex(z => z.id === newZoneId);
    if (idx >= 1) window.PROGRESS[`zone${idx + 1}Unlocked`] = true;

    showScreen("dialogue");
    document.getElementById("screen-world").style.display = "flex";
    Dialogue.show(transLines, () => {
      document.getElementById("screen-world").style.display = "";
      currentZone = newZoneId;
      showScreen("world");
      World.loadZone(newZoneId);
      World.resume();
      Audio.playBGM(newZoneId);
    });
  }

  function showGameOver() {
    World.stop();
    Audio.playDeath();
    setTimeout(() => Audio.playBGM("gameover"), 800);
    document.getElementById("gameover-score").textContent = CONFIG.PLAYER.score;
    document.getElementById("gameover-msg").textContent =
      "El Profesor te ha reprobado.\nTu proceso fue terminado.\n\nPero el código siempre puede ser reescrito.";
    showScreen("gameover");
  }

  function showVictory(result) {
    World.stop();
    setTimeout(() => Audio.playBGM("victory"), 500);
    document.getElementById("victory-score").textContent = CONFIG.PLAYER.score;
    document.getElementById("victory-msg").textContent = result === "mercy"
      ? "¡El Profesor los ha perdonado!\nEl código vuelve a fluir limpio.\n\nRecuerda: la honestidad es el mejor algoritmo."
      : "¡BYTELAND ha sido liberado!\nEl código vuelve a fluir limpio.\n\nGracias, Usuario.";
    showScreen("victory");
  }

  return { init };

})();

document.addEventListener("DOMContentLoaded", () => Game.init());
