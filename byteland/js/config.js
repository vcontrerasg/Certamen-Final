window.CONFIG = {

  CHARACTERS: {
    victor: {
      name: "Víctor",
      title: "El Compilador",
      color: "#1aff7a",
      portraits: {
        normal: "img/victor_normal.jpg",
        feliz:  "img/victor_feliz.jpg",
        triste: "img/victor_triste.jpg"
      },
      flavor: "Guarda el conocimiento de todos los algoritmos."
    },
    fabian: {
      name: "Fabián",
      title: "El Debugger",
      color: "#00ffcc",
      portraits: {
        normal: "img/fabian_normal.jpg",
        feliz:  "img/fabian_feliz.jpg",
        triste: "img/fabian_triste.jpg"
      },
      flavor: "Encuentra errores donde nadie más mira."
    },
    seba: {
      name: "Sebastián",
      title: "El Root",
      color: "#ff3a6e",
      portraits: {
        normal: "img/seba_normal.jpg",
        feliz:  "img/seba_feliz.jpg",
        triste: "img/seba_triste.jpg"
      },
      flavor: "Controla los permisos del sistema."
    }
  },

  PLAYER: {
    name: "Usuario",
    maxHp: 100,
    hp: 100,
    atk: 10,
    def: 5,
    score: 0,
    inventory: []
  },

  TILE_SIZE: 32,

  PROGRESS_DEFAULTS: {
    victorsSpoke:    false,
    fabianSpoke:     false,
    sebaSpoke:       false,
    zone1EnemiesDefeated: 0,
    zone2Unlocked:   false,
    z2fabianSpoke:   false,
    z2victorSpoke:   false,
    z2sebaSpoke:     false,
    zone2EnemiesDefeated: 0,
    zone3Unlocked:   false,
    z3fabianSpoke:   false,
    z3victorSpoke:   false,
    z3sebaSpoke:     false,
    zone3EnemiesDefeated: 0,
    zone4Unlocked:   false,
    bossDefeated:    false
  },

  ZONES: [
    {
      id: "terminal",
      name: "Terminal de Acceso",
      bgColor: "#1a0a00",
      floorColor: "#2a1a0a",
      wallColor: "#4a2a10",
      accentColor: "#ff8800",
      map: [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9,0,1],
        [1,0,0,2,0,0,0,1,1,1,1,1,0,0,0,0,0,0,2,0,0,0,0,1],
        [1,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,1,4,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,1],
        [1,0,0,0,0,0,1,4,0,0,0,0,0,0,0,0,0,4,1,0,0,0,0,1],
        [1,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,6,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,0,0,0,6,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,9,0,0,9,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,7,1,1,1,1,1,1,1,1,1,1,1,1],
      ],
      npcs: [
        {
          tileX: 8, tileY: 5,
          character: "victor",
          progressFlag: "victorsSpoke",
          dialogue: [
            { emotion: "normal", text: "¡Oye! ¿Eres el nuevo usuario? Llevo horas intentando contactar con alguien de fuera..." },
            { emotion: "triste",  text: "Mira, no voy a andarte con rodeos: el sistema está en pésimo estado. Un proceso llamado NULLPOINTER lleva días corrompiendo sectores enteros." },
            { emotion: "normal", text: "Yo soy Víctor. Compilo el código que mantiene vivo este mundo. O lo hacía, hasta que empezaron los problemas." },
            { emotion: "feliz",  text: "Habla con mis colegas, Fabián y Seba. Ellos están en las otras salas. Juntos podemos explicarte qué necesitas hacer. ¡Suerte!" }
          ]
        },
        {
          tileX: 7, tileY: 10,
          character: "fabian",
          progressFlag: "fabianSpoke",
          dialogue: [
            { emotion: "normal", text: "Ajá... un nuevo proceso entrando al sistema. Interesante. Soy Fabián, debugger. Mi trabajo es encontrar por qué las cosas se rompen." },
            { emotion: "triste",  text: "Y créeme, ahora mismo MUCHAS cosas se están rompiendo. Los bugs que ves por ahí son fragmentos del NULLPOINTER. Código corrupto que deambula solo." },
            { emotion: "normal", text: "Tip de profesional: cuando enfrentes uno, puedes LUCHAR para eliminarlo, o ACTUAR para intentar repararlo. Los reparados generan menos... caos." },
            { emotion: "feliz",  text: "Oh, y busca a Seba también. Él tiene información sobre la puerta del sur. ¡Vas a necesitarla!" }
          ]
        },
        {
          tileX: 17, tileY: 10,
          character: "seba",
          progressFlag: "sebaSpoke",
          dialogue: [
            { emotion: "normal", text: "..." },
            { emotion: "normal", text: "Soy Sebastián. Root del sistema. Normalmente no hablo mucho, pero esto es urgente." },
            { emotion: "triste",  text: "La puerta del sur está bloqueada. Para abrirla, el sistema necesita ver que puedes manejar lo que hay ahí afuera. Derrota los bugs de esta zona." },
            { emotion: "feliz",  text: "Y habla con Víctor y Fabián si no lo has hecho. No por protocolo, sino porque realmente necesitas saber lo que saben. Confía en mí." }
          ],
          dialogueVisited: [
            { emotion: "normal", text: "¿Ya hablaste con todos? ¿Derrotaste los bugs? Entonces la puerta debería estar abierta. Sigue al sur." }
          ]
        }
      ],
      enemies: [
        { tileX: 14, tileY: 7,  id: "bug_simple",    label: "z1e1" },
        { tileX: 10, tileY: 13, id: "loop_infinito",  label: "z1e2" }
      ],
      items: [
        { tileX: 2,  tileY: 13, id: "patch",   name: "Parche v1.0", effect: "heal", value: 20 },
        { tileX: 21, tileY: 13, id: "ram",      name: "RAM Extra",   effect: "atk",  value: 3  }
      ],
      terminals: [
        {
          tileX: 3, tileY: 3,
          message: "> cat /etc/motd\n\nBIENVENIDO A BYTELAND\n═══════════════════════\nSistema: ByteOS 4.2\nÚltimo acceso: DESCONOCIDO\nUptime: 72h (degradado)\n\n[ADVERTENCIA] Proceso anómalo detectado\n[ADVERTENCIA] Integridad del sistema: 34%\n\n> _"
        },
        {
          tileX: 18, tileY: 3,
          message: "> ls -la /home/usuario/\ntotal 8\n-rw-r--r--  diario.txt\n-rw-r--r--  TODO.md\ndrwx------  .ssh/\ndrwxr-xr-x  proyectos/\n\n> cat TODO.md\n[ ] Hablar con los 3 compiladores\n[ ] Limpiar bugs del sector\n[ ] Llegar al Servidor Central\n[ ] Detener al NULLPOINTER\n\n> _"
        }
      ],
      signs: [
        { tileX: 2,  tileY: 2,  text: "— ZONA DE ACCESO —\nHabla con los residentes\nantes de continuar." },
        { tileX: 21, tileY: 2,  text: "TERMINAL INFORMATIVA\nPresiona Z para leer\nlos registros del sistema." },
        { tileX: 10, tileY: 16, text: "→ SECTOR SUR (BLOQUEADO)\nRequiere: clearance básico" },
        { tileX: 13, tileY: 16, text: "Estado del sistema:\nIntegridad: CRÍTICA\nSe necesita ayuda urgente." }
      ],
      playerStart: { x: 12, y: 2 },
      nextZone: "ram_district",
      exitTile: { x: 11, y: 17 },
      lockCondition: "zone1_locked",
      lockMessage: "La puerta está cerrada.\n\nNecesitas hablar con Víctor, Fabián y Seba,\ny derrotar los bugs de esta zona.\n\n[Enemigos restantes: {enemiesLeft}]\n[NPCs pendientes: {npcsLeft}]"
    },

    {
      id: "ram_district",
      name: "Distrito RAM",
      bgColor: "#050a18",
      floorColor: "#0a1428",
      wallColor: "#1a2a50",
      accentColor: "#88aaff",
      map: [
        [1,1,1,1,1,1,1,1,1,1,1,8,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9,0,1],
        [1,0,0,0,0,0,0,0,5,0,0,0,0,0,5,0,0,0,0,0,0,0,0,1],
        [1,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,1],
        [1,0,0,1,4,1,0,0,0,0,0,0,0,0,0,0,0,0,1,4,1,0,0,1],
        [1,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,5,0,0,0,0,0,0,5,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1],
        [1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1],
        [1,0,0,1,0,0,0,0,0,6,0,0,0,0,0,0,6,0,0,0,1,0,0,1],
        [1,0,0,1,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,1,0,0,1],
        [1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,9,0,0,9,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,7,1,1,1,1,1,1,1,1,1,1,1,1],
      ],
      npcs: [
        {
          tileX: 4, tileY: 5,
          character: "fabian",
          progressFlag: "z2fabianSpoke",
          dialogue: [
            { emotion: "normal", text: "¡Me seguiste hasta el Distrito RAM! Bien. Este lugar es donde el sistema guarda todo en tiempo real." },
            { emotion: "triste",  text: "Mira los indicadores: la memoria está al 97% de uso. Todo es el NULLPOINTER. Va consumiendo recursos sin parar, como un proceso zombi." },
            { emotion: "normal", text: "Aquí los enemigos son más peligrosos. El SegFault especialmente... accede a memoria que no le corresponde. Usa el NULL check cuando lo enfrentes." },
            { emotion: "feliz",  text: "¡Pero tú puedes! Ya lo vi manejar la zona anterior. Busca a Víctor y Seba por aquí, ellos tienen más contexto." }
          ]
        },
        {
          tileX: 19, tileY: 5,
          character: "victor",
          progressFlag: "z2victorSpoke",
          dialogue: [
            { emotion: "feliz",  text: "¡Llegaste al Distrito RAM! Esto significa que ya eres una amenaza real para el NULLPOINTER." },
            { emotion: "triste",  text: "He analizado su código. No es un virus accidental... alguien lo programó. Tiene arquitectura demasiado limpia para ser un error." },
            { emotion: "normal", text: "Lo que sé es que opera desde el Servidor Central. Si puedes llegar ahí y terminar su proceso, todo se puede restaurar." },
            { emotion: "feliz",  text: "Seba tiene una sorpresa para ti en la sala central. Ve a verlo cuando puedas." }
          ]
        },
        {
          tileX: 10, tileY: 14,
          character: "seba",
          progressFlag: "z2sebaSpoke",
          dialogue: [
            { emotion: "triste",  text: "Llegaste. Aquí, en el corazón de la RAM." },
            { emotion: "normal", text: "Encontré algo mientras husmeaba en los logs del NULLPOINTER. Registros de sus orígenes. Alguien lo ejecutó con intención, hace exactamente 72 horas." },
            { emotion: "triste",  text: "Lo que me preocupa es que... tenía acceso root. Solo alguien del sistema podría haber hecho eso. Pero no voy a señalar a nadie sin pruebas." },
            { emotion: "feliz",  text: "De todas formas: aquí tienes permisos extra. El comando PIEDAD ahora funciona mejor. Los enemigos reparados no solo se van, se convierten en aliados del sistema." }
          ],
          dialogueVisited: [
            { emotion: "normal", text: "Los permisos extra siguen activos. Úsalos bien. La siguiente zona está al sur cuando estés listo." }
          ]
        }
      ],
      enemies: [
        { tileX: 8,  tileY: 3,  id: "segfault",      label: "z2e1" },
        { tileX: 14, tileY: 3,  id: "memory_leak",    label: "z2e2" },
        { tileX: 8,  tileY: 9,  id: "loop_infinito",  label: "z2e3" },
        { tileX: 15, tileY: 9,  id: "segfault",       label: "z2e4" }
      ],
      items: [
        { tileX: 9,  tileY: 13, id: "antivirus", name: "Antivirus v2.0", effect: "heal", value: 40 },
        { tileX: 16, tileY: 13, id: "overclock",  name: "Overclock",      effect: "atk",  value: 5  }
      ],
      terminals: [
        {
          tileX: 5, tileY: 8,
          message: "> free -h\n           total    usada    libre\nMem:        8.0G     7.7G     0.3G\nSwap:       2.0G     2.0G     0.0G\n\n[CRÍTICO] Memoria al 97%\nProceso consumidor: NULLPOINTER\nPID: 666  CPU: 94.2%  MEM: 7.7G\n\n> kill -9 666\nbash: kill: Permiso denegado\n\nNecesitas acceso root.\n> _"
        },
        {
          tileX: 17, tileY: 8,
          message: "> ps aux | grep NULLPOINTER\nroot  666  94  97  NULLPOINTER --infect --all\n\n> strace -p 666\nstrace: attach: ptrace: Operación no permitida\n\n> cat /proc/666/maps\nAAAA-FFFF rw-p 00000000 [stack corrupted]\n\nNo se puede inspeccionar.\nEl proceso tiene permisos root.\n> _"
        }
      ],
      signs: [
        { tileX: 2,  tileY: 2,  text: "DISTRITO RAM\nCeldas de memoria en uso:\n████████░░ 97%" },
        { tileX: 21, tileY: 2,  text: "ADVERTENCIA\nZona de alta densidad\nde errores activos." },
        { tileX: 10, tileY: 17, text: "→ SECTOR SUR (BLOQUEADO)\nRequiere: clearance RAM" },
        { tileX: 13, tileY: 17, text: "Fragmentos de NULLPOINTER\ndetectados en este sector.\nProceder con cuidado." }
      ],
      playerStart: { x: 11, y: 1 },
      nextZone: "firewall",
      exitTile: { x: 11, y: 19 },
      lockCondition: "zone2_locked",
      lockMessage: "Acceso denegado.\n\nEl sistema requiere más clearance.\n\nHabla con los residentes y\nelimina las amenazas activas.\n\n[Enemigos restantes: {enemiesLeft}]\n[NPCs pendientes: {npcsLeft}]"
    },

    {
      id: "firewall",
      name: "Firewall — Sector 7",
      bgColor: "#1f0800",
      floorColor: "#2a1000",
      wallColor: "#501800",
      accentColor: "#ff4400",
      map: [
        [1,1,1,1,1,1,1,1,1,1,1,8,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,1,1,1,1,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,1],
        [1,0,0,0,1,0,0,1,0,0,5,0,0,5,0,1,0,0,1,0,0,0,0,1],
        [1,0,0,0,1,0,0,1,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,1],
        [1,0,0,0,1,1,0,1,0,0,0,0,0,0,0,1,0,1,1,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,4,0,0,0,0,0,4,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,9,0,0,9,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,7,1,1,1,1,1,1,1,1,1,1,1,1],
      ],
      npcs: [
        {
          tileX: 8, tileY: 12,
          character: "victor",
          progressFlag: "z3victorSpoke",
          dialogue: [
            { emotion: "triste",  text: "Este lugar... es el Firewall. Debería estar protegiéndonos, pero el NULLPOINTER lo ha convertido en su segundo hogar." },
            { emotion: "normal", text: "He estado revisando sus logs de compilación. El virus tiene estructura de árbol binario. Por eso es tan difícil de matar con un solo golpe." },
            { emotion: "feliz",  text: "Pero encontré algo: tiene un punto débil cuando está en estado de gracia. Si logras usar PIEDAD en el momento exacto, puedes acceder a su código raíz." },
            { emotion: "feliz",  text: "¡Limpia este sector y nos vemos en el Servidor Central! Seba y yo estaremos esperándote allá." }
          ]
        },
        {
          tileX: 14, tileY: 12,
          character: "fabian",
          progressFlag: "z3fabianSpoke",
          dialogue: [
            { emotion: "normal", text: "El Firewall. Cuántos días pasé aquí rastreando al NULLPOINTER..." },
            { emotion: "triste",  text: "Sabes, al principio creía que era solo un bug escapado de alguna actualización. Pero ahora... no sé. Tiene demasiada coherencia interna para ser un accidente." },
            { emotion: "normal", text: "Cuando lo enfrentes en el servidor, presta atención a sus mensajes. Un proceso no corrupto de nacimiento siempre deja trazas de lo que fue." },
            { emotion: "feliz",  text: "Y oye... gracias por llegar hasta aquí. No esperaba que alguien realmente lo intentara. Mucha suerte ahí adentro." }
          ]
        }
      ],
      enemies: [
        { tileX: 10, tileY: 5,  id: "segfault",      label: "z3e1" },
        { tileX: 13, tileY: 5,  id: "memory_leak",    label: "z3e2" },
        { tileX: 5,  tileY: 11, id: "race_condition", label: "z3e3" },
        { tileX: 17, tileY: 11, id: "race_condition", label: "z3e4" }
      ],
      items: [
        { tileX: 2,  tileY: 14, id: "antivirus",  name: "Antivirus v3.0",    effect: "heal", value: 50 },
        { tileX: 21, tileY: 14, id: "sudo_token", name: "Token Sudo",         effect: "atk",  value: 8  }
      ],
      terminals: [
        {
          tileX: 3, tileY: 9,
          message: "> iptables -L\nChain INPUT (policy CORRUPTED)\nTarget  Proto  Source       Dest\nDROP    all    NULLPOINTER  anywhere\nACCEPT  all    anywhere     anywhere\n\nEl firewall ya no discrimina.\nTodo pasa. Nada está protegido.\n\n> _"
        },
        {
          tileX: 19, tileY: 9,
          message: "> netstat -an | grep LISTEN\ntcp  0  0  0.0.0.0:666  LISTEN  [NULLPOINTER]\ntcp  0  0  0.0.0.0:22   LISTEN  [sshd]\ntcp  0  0  0.0.0.0:80   LISTEN  [CORRUPTED]\n\nEl proceso escucha en todos los puertos.\nOrigen: Servidor Central\nEstado: REPLICANDO\n\n> _"
        }
      ],
      signs: [
        { tileX: 2,  tileY: 2,  text: "FIREWALL SECTOR 7\nEstado: COMPROMETIDO\nEficiencia: 12%" },
        { tileX: 21, tileY: 2,  text: "ZONA RESTRINGIDA\nNivel de amenaza: CRÍTICO\nEquipo de respuesta: N/A" },
        { tileX: 10, tileY: 16, text: "→ SERVIDOR CENTRAL\n(Requiere: clearance total)" },
        { tileX: 13, tileY: 16, text: "Más allá de esta puerta\nvive el origen del caos.\nPrepárate." }
      ],
      playerStart: { x: 11, y: 1 },
      nextZone: "servidor_central",
      exitTile: { x: 11, y: 19 },
      lockCondition: "zone3_locked",
      lockMessage: "La puerta está bloqueada.\n\nEl sistema detecta amenazas\nactivas en este sector.\n\nElimina todos los procesos\ncorruptos para continuar.\n\n[Enemigos restantes: {enemiesLeft}]"
    },

    {
      id: "servidor_central",
      name: "Servidor Central — Núcleo",
      bgColor: "#0a0014",
      floorColor: "#140025",
      wallColor: "#280050",
      accentColor: "#cc44ff",
      map: [
        [1,1,1,1,1,1,1,1,1,1,1,8,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,5,0,0,5,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      ],
      npcs: [
        {
          tileX: 6, tileY: 6,
          character: "seba",
          progressFlag: "z4sebaSpoke",
          dialogue: [
            { emotion: "feliz",  text: "¡Llegaste al Servidor Central! Yo mismo no creía que lo conseguirías, y mira." },
            { emotion: "normal", text: "Aquí tienes acceso ROOT completo. Usé mis últimas reservas para dártelo antes de que llegaras." },
            { emotion: "triste",  text: "El Profesor está más allá del corredor. Va a ser la batalla más difícil que hayas tenido. Tiene tres fases." },
            { emotion: "feliz",  text: "Pero escucha: cuando esté al 30% de HP, puedes usar PIEDAD. Si logras pedirle perdón correctamente, quizás te escuche." }
          ]
        },
        {
          tileX: 16, tileY: 6,
          character: "victor",
          progressFlag: "z4victorSpoke",
          dialogue: [
            { emotion: "feliz",  text: "Este lugar es el corazón de BYTELAND. Aquí compila todo el código que hace que nuestro mundo exista." },
            { emotion: "triste",  text: "Y está siendo destruido desde adentro. Hemos visto demasiado para rendirse ahora." },
            { emotion: "normal", text: "Un último dato técnico: el Profesor usa tres patrones de ataque distintos según la fase. Aprende sus movimientos." },
            { emotion: "feliz",  text: "¡Adelante, Usuario! Fabián, Seba y yo estaremos monitoreando desde aquí. ¡No estás solo!" }
          ]
        }
      ],
      enemies: [
        { tileX: 10, tileY: 18, id: "nullpointer_guardian", label: "z4e1" },
        { tileX: 13, tileY: 18, id: "nullpointer_guardian", label: "z4e2" }
      ],
      bossEnemy: { tileX: 11, tileY: 18, id: "profesor_boss", label: "boss", isBoss: true },
      items: [],
      terminals: [
        {
          tileX: 4, tileY: 4,
          message: "> sudo systemctl status BYTELAND\n● BYTELAND.service — Sistema Principal\n   Loaded: loaded\n   Active: degradado desde 72h\n Main PID: 1 (byteos)\n   Tasks: 847 (limit: 512)\n   CGroup: NULLPOINTER secuestró PID 1\n\n[ALERTA] Sistema en estado crítico\n[ALERTA] El código necesita un compilador\n\n> _"
        },
        {
          tileX: 18, tileY: 4,
          message: "> cat /var/log/ia_warning.log\n[ERROR] Uso de IA detectado\n[ERROR] ChatGPT invocado sin permiso\n[WARN]  GitHub Copilot activo en proyecto\n[INFO]  Origen: estudiantes clase INF-101\n[INFO]  Timestamp: hace 72 horas\n\n> ¿Fue un error usar IA?\n  ¿O nadie les explicó bien\n  cómo hacerlo responsablemente?\n\n> _"
        }
      ],
      signs: [
        { tileX: 2,  tileY: 2,  text: "SERVIDOR CENTRAL\nNúcleo del sistema\nZona de máxima seguridad" },
        { tileX: 21, tileY: 2,  text: "⚠ ADVERTENCIA FINAL\nMás allá: El Profesor\nNo hay vuelta atrás." }
      ],
      playerStart: { x: 11, y: 1 },
      nextZone: null,
      exitTile: null,
      lockCondition: null,
      lockMessage: null
    }
  ],

  ENEMIES: {
    bug_simple: {
      name: "Bug Simple",
      sprite: "🐛",
      hp: 25, maxHp: 25,
      atk: 8, def: 2,
      exp: 10, score: 50,
      flavor: "Un pequeño error de lógica. Parece confundido.",
      flavorMerciful: "El Bug parece arrepentido. Míralo, casi da lástima.",
      actOptions: ["Analizar código", "Refactorizar", "Añadir comentario"],
      actResults: [
        "Encuentras un typo en su código. El Bug se sonroja (si los bugs pudieran sonrojarse).",
        "Limpias su código. Ahora tiene mejor estructura y se ve... aliviado.",
        "Añades '// TODO: fix me'. El Bug siente que alguien lo entiende por primera vez."
      ],
      mercyThreshold: 0.6,
      attacks: [
        {
          name: "Spam de Errores",
          type: "bullets",
          bullets: [
            { type: "hline", y: 0.25, speed: 160, height: 10, color: "#ff3a6e" },
            { type: "hline", y: 0.50, speed: 180, height: 10, color: "#ff6a00" },
            { type: "hline", y: 0.75, speed: 160, height: 10, color: "#ff3a6e" }
          ],
          duration: 3500
        },
        {
          name: "Typo Explosivo",
          type: "bullets",
          bullets: [
            { type: "hline",        y: 0.4,  speed: 170, height: 10, color: "#ff3a6e" },
            { type: "hline",        y: 0.6,  speed: 170, height: 10, color: "#ff3a6e" },
            { type: "circle_burst", count: 4, speed: 90, color: "#ff6a00", radius: 5 }
          ],
          duration: 3500
        }
      ]
    },

    loop_infinito: {
      name: "Loop Infinito",
      sprite: "🔄",
      hp: 40, maxHp: 40,
      atk: 12, def: 3,
      exp: 20, score: 100,
      flavor: "Atrapado en un ciclo sin condición de salida. Eterno e involuntario.",
      flavorMerciful: "El Loop está perdido en su propio ciclo. ¿Y si solo necesita un break?",
      actOptions: ["Buscar break statement", "Cambiar condición", "Inyectar return"],
      actResults: [
        "Encuentras el break perdido. El Loop se detiene, desorientado pero tranquilo.",
        "Cambias while(true) a while(condicion). El Loop ve luz al final del túnel.",
        "Inyectas un return inesperado. El Loop sale por fin de su ciclo infinito."
      ],
      mercyThreshold: 0.5,
      attacks: [
        {
          name: "Ciclo de Daño",
          type: "bullets",
          bullets: [
            { type: "circle_burst", count: 7, speed: 120, color: "#ffdc42", radius: 5 },
            { type: "hline",        y: 0.5,   speed: 150, height: 8, color: "#ff6a00" }
          ],
          duration: 4000
        },
        {
          name: "Iteración Infinita",
          type: "bullets",
          bullets: [
            { type: "circle_burst", count: 6, speed: 130, color: "#ffdc42", radius: 5 },
            { type: "raining",      count: 4, speed: 110, color: "#ff6a00", radius: 4 }
          ],
          duration: 4500
        }
      ]
    },

    segfault: {
      name: "SegFault",
      sprite: "💣",
      hp: 55, maxHp: 55,
      atk: 18, def: 5,
      exp: 35, score: 175,
      flavor: "Accede a zonas de memoria prohibidas. Impredecible y peligroso.",
      flavorMerciful: "El SegFault solo quería acceder a datos que no le pertenecían. Un poco entrometido.",
      actOptions: ["Verificar puntero", "Añadir NULL check", "Asignar memoria"],
      actResults: [
        "Verificas el puntero antes de dereferenciarlo. El SegFault queda expuesto.",
        "Añades el NULL check que faltaba. El SegFault no puede avanzar.",
        "Asignas la memoria correctamente. El SegFault queda sin argumento."
      ],
      mercyThreshold: 0.45,
      attacks: [
        {
          name: "Acceso Prohibido",
          type: "bullets",
          bullets: [
            { type: "vline", x: 0.15, speed: 230, width: 10, color: "#ff3a6e" },
            { type: "vline", x: 0.40, speed: 230, width: 10, color: "#ff3a6e" },
            { type: "vline", x: 0.65, speed: 230, width: 10, color: "#ff3a6e" },
            { type: "vline", x: 0.88, speed: 230, width: 10, color: "#ff3a6e" }
          ],
          duration: 3500
        },
        {
          name: "Desbordamiento de Pila",
          type: "bullets",
          bullets: [
            { type: "vline",    x: 0.25, speed: 210, width: 10, color: "#ff3a6e" },
            { type: "vline",    x: 0.75, speed: 210, width: 10, color: "#ff3a6e" },
            { type: "diagonal", angle: 90, speed: 180, color: "#ff6a00", radius: 5 }
          ],
          duration: 4000
        },
        {
          name: "Null Dereference",
          type: "bullets",
          bullets: [
            { type: "circle_burst", count: 6, speed: 150, color: "#ff3a6e", radius: 5 },
            { type: "vline",        x: 0.5,   speed: 240, width: 12, color: "#ff6a00" }
          ],
          duration: 3500
        }
      ]
    },

    memory_leak: {
      name: "Memory Leak",
      sprite: "💧",
      hp: 45, maxHp: 45,
      atk: 14, def: 6,
      exp: 28, score: 140,
      flavor: "Consume memoria sin liberarla jamás. Lento pero devastador.",
      flavorMerciful: "Solo quería retener las cosas. Es muy apegado. Necesita soltar.",
      actOptions: ["Llamar free()", "Usar garbage collector", "Detectar con Valgrind"],
      actResults: [
        "Llamas free() en el bloque perdido. El Memory Leak libera lo que retenía.",
        "El garbage collector recolecta sus fragmentos. Se encoge visiblemente.",
        "Valgrind señala cada fuga. El Memory Leak ya no tiene donde esconderse."
      ],
      mercyThreshold: 0.4,
      attacks: [
        {
          name: "Drenar Recursos",
          type: "bullets",
          bullets: [
            { type: "raining", count: 12, speed: 110, color: "#00ffcc", radius: 5 },
            { type: "hline",   y: 0.6,    speed: 140, height: 9, color: "#00ffcc" }
          ],
          duration: 5000
        },
        {
          name: "Fuga Masiva",
          type: "bullets",
          bullets: [
            { type: "raining",      count: 8,  speed: 130, color: "#00ffcc", radius: 5 },
            { type: "circle_burst", count: 5,  speed: 100, color: "#00cc88", radius: 4 }
          ],
          duration: 5000
        },
        {
          name: "Heap Overflow",
          type: "bullets",
          bullets: [
            { type: "raining", count: 7, speed: 120, color: "#00ffcc", radius: 6 },
            { type: "hline",   y: 0.3,   speed: 150, height: 9, color: "#00cc88" },
            { type: "hline",   y: 0.7,   speed: 150, height: 9, color: "#00cc88" }
          ],
          duration: 5500
        }
      ]
    },

    race_condition: {
      name: "Race Condition",
      sprite: "⚡",
      hp: 60, maxHp: 60,
      atk: 22, def: 4,
      exp: 45, score: 220,
      flavor: "Dos procesos compiten por el mismo recurso. El caos es su naturaleza.",
      flavorMerciful: "La Race Condition no tiene la culpa de que nadie la sincronizó correctamente.",
      actOptions: ["Usar mutex", "Añadir semáforo", "Serializar acceso"],
      actResults: [
        "Aplicas un mutex lock. Los procesos esperan su turno. La Race Condition se estabiliza.",
        "Insertas un semáforo. El caos se convierte en cola ordenada.",
        "Serializas el acceso al recurso. La carrera termina. Hay un ganador claro."
      ],
      mercyThreshold: 0.45,
      attacks: [
        {
          name: "Condición Caótica",
          type: "bullets",
          bullets: [
            { type: "diagonal", angle: 45,  speed: 210, color: "#ffdc42", radius: 5 },
            { type: "diagonal", angle: 135, speed: 210, color: "#ff6a00", radius: 5 },
            { type: "hline",    y: 0.35,    speed: 185, height: 8, color: "#ff3a6e" },
            { type: "hline",    y: 0.65,    speed: 185, height: 8, color: "#ff3a6e" }
          ],
          duration: 4000
        },
        {
          name: "Deadlock",
          type: "bullets",
          bullets: [
            { type: "diagonal",     angle: 60,  speed: 220, color: "#ffdc42", radius: 5 },
            { type: "diagonal",     angle: 120, speed: 220, color: "#ff6a00", radius: 5 },
            { type: "diagonal",     angle: 90,  speed: 200, color: "#ff3a6e", radius: 4 },
            { type: "circle_burst", count: 5,   speed: 130, color: "#ffdc42", radius: 4 }
          ],
          duration: 4500
        },
        {
          name: "Data Race",
          type: "bullets",
          bullets: [
            { type: "diagonal", angle: 45,  speed: 200, color: "#ffdc42", radius: 5 },
            { type: "diagonal", angle: 135, speed: 200, color: "#ff6a00", radius: 5 },
            { type: "raining",  count: 6,   speed: 130, color: "#ff3a6e", radius: 4 },
            { type: "vline",    x: 0.5,     speed: 210, width: 10, color: "#ffdc42" }
          ],
          duration: 5000
        }
      ]
    },

    nullpointer_guardian: {
      name: "Guardián NULL",
      sprite: "🔒",
      hp: 80, maxHp: 80,
      atk: 20, def: 8,
      exp: 80, score: 400,
      flavor: "Fragmento del NULLPOINTER. Fiel y sin voluntad propia.",
      flavorMerciful: "Un guardián sin amo es solo código esperando instrucciones.",
      actOptions: ["Examinar código", "Desactivar rutina", "Reasignar tarea"],
      actResults: [
        "Examinas su código fuente. Es casi idéntico al NULLPOINTER, pero más simple.",
        "Desactivas su rutina de guardia. El Guardián queda en standby.",
        "Le reasignas una tarea nueva. Confundido, pero dispuesto a obedecer."
      ],
      mercyThreshold: 0.35,
      attacks: [
        {
          name: "Barrera de Bits",
          type: "bullets",
          bullets: [
            { type: "hline",        y: 0.20, speed: 210, height: 10, color: "#8b00ff" },
            { type: "hline",        y: 0.50, speed: 210, height: 10, color: "#cc44ff" },
            { type: "hline",        y: 0.80, speed: 210, height: 10, color: "#8b00ff" },
            { type: "circle_burst", count: 5, speed: 140, color: "#ff3a6e", radius: 6 }
          ],
          duration: 4000
        },
        {
          name: "Protocolo Nulo",
          type: "bullets",
          bullets: [
            { type: "circle_burst", count: 8,  speed: 160, color: "#8b00ff", radius: 6 },
            { type: "vline",        x: 0.25,   speed: 230, width: 11, color: "#cc44ff" },
            { type: "vline",        x: 0.75,   speed: 230, width: 11, color: "#cc44ff" }
          ],
          duration: 4500
        },
        {
          name: "Cifrado Corrupto",
          type: "bullets",
          bullets: [
            { type: "diagonal",     angle: 45,  speed: 200, color: "#8b00ff", radius: 5 },
            { type: "diagonal",     angle: 135, speed: 200, color: "#cc44ff", radius: 5 },
            { type: "hline",        y: 0.35,    speed: 220, height: 10, color: "#8b00ff" },
            { type: "hline",        y: 0.65,    speed: 220, height: 10, color: "#8b00ff" },
            { type: "circle_burst", count: 4,   speed: 120, color: "#ff3a6e", radius: 5 }
          ],
          duration: 5000
        }
      ]
    },

    profesor_boss: {
      name: "El Profesor",
      sprite: "img/profesor_fase1.png",
      spriteType: "img",
      hp: 250, maxHp: 250,
      atk: 28, def: 10,
      exp: 999, score: 9999,
      flavor: "El guardián del rigor académico. No tolerará el uso de IA sin justificación.",
      flavorMerciful: "El Profesor baja la guardia. Quizás... si le pides perdón de verdad...",
      actOptions: ["Mostrar tu código propio", "Explicar el proceso", "Pedir disculpas"],
      actResults: [
        "Muestras el código que escribiste tú. El Profesor lo inspecciona en silencio.",
        "Explicas paso a paso cómo usaste la IA. El Profesor frunce el ceño, pensativo.",
        "Te disculpas sinceramente por usar IA sin avisar. El Profesor suspira profundo."
      ],
      mercyThreshold: 0.3,
      isBoss: true,
      attacks: [
        {
          name: "Tarea Extra",
          type: "bullets",
          bullets: [
            { type: "hline", y: 0.2, speed: 230, height: 12, color: "#ff3a6e" },
            { type: "hline", y: 0.5, speed: 230, height: 12, color: "#8b00ff" },
            { type: "hline", y: 0.8, speed: 230, height: 12, color: "#ff3a6e" }
          ],
          duration: 4000
        },
        {
          name: "Parcial Sorpresa",
          type: "bullets",
          bullets: [
            { type: "circle_burst", count: 10, speed: 170, color: "#8b00ff", radius: 6 }
          ],
          duration: 4500
        },
        {
          name: "Código a Mano",
          type: "bullets",
          bullets: [
            { type: "diagonal", angle: 45,  speed: 190, color: "#ff3a6e", radius: 5 },
            { type: "diagonal", angle: 135, speed: 190, color: "#8b00ff", radius: 5 },
            { type: "raining",  count: 6,   speed: 130, color: "#ff3a6e", radius: 4 }
          ],
          duration: 5000
        },
        {
          name: "¡Expulsión!",
          type: "bullets",
          bullets: [
            { type: "circle_burst", count: 8,  speed: 150, color: "#ff3a6e", radius: 7 },
            { type: "hline",        y: 0.35,   speed: 200, height: 14, color: "#8b00ff" },
            { type: "vline",        x: 0.5,    speed: 200, width:  14, color: "#ff3a6e" }
          ],
          duration: 5500
        }
      ],
      phases: [
        { hpPercent: 0.66, message: "EL PROFESOR > FASE 2: ¡Esto es plagio académico!", atkBoost: 5,  newSprite: "img/profesor_fase2.png", newSpriteType: "img" },
        { hpPercent: 0.33, message: "EL PROFESOR > FASE 3: ¡REPROBADO SIN DERECHO A EXAMEN!", atkBoost: 10, newSprite: "img/profesor_fase3.png", newSpriteType: "img" }
      ]
    }
  },

  ITEMS: {
    patch:      { name: "Parche v1.0",  desc: "Restaura 20 HP",   effect: "heal", value: 20, emoji: "🩹" },
    ram:        { name: "RAM Extra",    desc: "+3 ATK (permanente)", effect: "atk",  value: 3,  emoji: "💾" },
    antivirus:  { name: "Antivirus",    desc: "Restaura 50 HP",   effect: "heal", value: 50, emoji: "🛡" },
    overclock:  { name: "Overclock",    desc: "+5 ATK (permanente)", effect: "atk",  value: 5,  emoji: "⚡" },
    sudo_token: { name: "Token Sudo",   desc: "+8 ATK (permanente)", effect: "atk",  value: 8,  emoji: "🔑" }
  }
};
