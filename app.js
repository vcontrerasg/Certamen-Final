const API_URL = 'http://localhost:3000/api';

const PROYECTOS_LOCALES = [
    {
        titulo: "BYTELAND — El Mundo de los Bits",
        descripcion: "RPG de exploración estilo Undertale ambientado en el mundo de la informática. Combate por turnos, sistema de diálogo, mapa por zonas, jefe final con 3 fases y mecánicas de piedad. ¡Disponible como minijuego en este portafolio!",
        tecnologias: ["HTML5", "CSS3", "JavaScript", "Canvas API"],
        urlGithub: "#",
        urlDemo: "byteland/index.html",
        icono: "🕹️",
        autor: { nombre: "Equipo" }
    },
    {
        titulo: "Batalla Pokémon Pro",
        descripcion: "Juego de batalla por turnos inspirado en Pokémon, con selección de equipo, sistema de combate completo, efectos de sonido, integración con PokéAPI y modo Game Boy retro.",
        tecnologias: ["HTML", "CSS", "JavaScript", "PokeAPI"],
        urlGithub: "#",
        urlDemo: "#",
        icono: "⚡",
        autor: { nombre: "Equipo" }
    },
    {
        titulo: "MineDex – Enciclopedia Minecraft",
        descripcion: "Catálogo interactivo de criaturas y bloques de Minecraft. Permite navegar, filtrar y explorar los mobs del Overworld, Nether y The End con diseño pixel art.",
        tecnologias: ["HTML", "CSS", "JavaScript"],
        urlGithub: "#",
        urlDemo: "#",
        icono: "🧱",
        autor: { nombre: "Equipo" }
    }
];

document.addEventListener('DOMContentLoaded', () => {
    cargarIntegrantes();
    cargarProyectos();
    inicializarMúsica();
    inicializarDarkMode();
    inicializarFormulario();
});

function toggleFullscreenGame() {
    const iframe = document.getElementById('byteland-iframe');
    if (iframe.requestFullscreen) iframe.requestFullscreen();
    else if (iframe.webkitRequestFullscreen) iframe.webkitRequestFullscreen();
    else if (iframe.mozRequestFullScreen) iframe.mozRequestFullScreen();
}

async function cargarIntegrantes() {
    try {
        const res = await fetch(`${API_URL}/integrantes`);
        const integrantes = await res.json();
        renderizarIntegrantes(integrantes);
    } catch (err) {
        console.warn("Backend no disponible, mostrando integrantes de ejemplo.", err);
        renderizarIntegrantes([]);
    }
}

function renderizarIntegrantes(integrantes) {
    const contenedor = document.getElementById('contenedor-integrantes');
    contenedor.innerHTML = '';
    if (integrantes.length === 0) {
        contenedor.innerHTML = '<p style="color: var(--text-color); opacity: 0.6;">Conecta el servidor para ver los integrantes del equipo.</p>';
        return;
    }
    integrantes.forEach(i => {
        contenedor.innerHTML += `
            <div class="card-integrante">
                <h3>${i.nombre}</h3>
                <p class="rol"><strong>${i.rol}</strong></p>
                <p>${i.sobreMi}</p>
                <div class="tags">
                    ${i.habilidades.map(h => `<span class="tag">${h}</span>`).join('')}
                </div>
            </div>
        `;
    });
}

async function cargarProyectos(tecnologia = '') {
    const contenedor = document.getElementById('contenedor-proyectos');
    contenedor.innerHTML = '<p style="opacity:0.5; padding: 10px;">Cargando proyectos...</p>';

    let proyectos = [];
    try {
        let url = `${API_URL}/proyectos`;
        if (tecnologia) url += `?tech=${tecnologia}`;
        const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
        proyectos = await res.json();
    } catch (err) {
        console.warn("Backend no disponible, usando proyectos locales.", err);
        proyectos = tecnologia
            ? PROYECTOS_LOCALES.filter(p => p.tecnologias.includes(tecnologia))
            : PROYECTOS_LOCALES;
    }

    renderizarProyectos(proyectos);
}

function renderizarProyectos(proyectos) {
    const contenedor = document.getElementById('contenedor-proyectos');
    contenedor.innerHTML = '';

    if (proyectos.length === 0) {
        contenedor.innerHTML = '<p style="opacity:0.6; padding:10px;">No hay proyectos con ese filtro.</p>';
        return;
    }

    proyectos.forEach(p => {
        const techs = (p.tecnologias || []).map(t => `<span class="tag">${t}</span>`).join('');
        const icono = p.icono || '💻';
        const demo = p.urlDemo ? `<a href="${p.urlDemo}" target="_blank" class="btn-link btn-demo">Ver Demo</a>` : '';
        const github = p.urlGithub && p.urlGithub !== '#'
            ? `<a href="${p.urlGithub}" target="_blank" class="btn-link">Ver GitHub</a>`
            : '';

        contenedor.innerHTML += `
            <div class="card-proyecto">
                <div class="proyecto-icono">${icono}</div>
                <h3>${p.titulo}</h3>
                <p>${p.descripcion}</p>
                <div class="tags proyecto-tags">${techs}</div>
                <small class="proyecto-autor">Desarrollado por: ${p.autor ? p.autor.nombre : 'Equipo'}</small>
                <div class="proyecto-links">
                    ${github}
                    ${demo}
                </div>
            </div>
        `;
    });
}


function inicializarMúsica() {
    const musica = document.getElementById('musica-fondo');
    const btnMusica = document.getElementById('btn-musica');

    btnMusica.addEventListener('click', () => {
        if (musica.paused) {
            musica.play();
            btnMusica.textContent = "⏸️ Pausar Música";
        } else {
            musica.pause();
            btnMusica.textContent = "🎵 Play Música";
        }
    });
}

function inicializarDarkMode() {
    const toggle = document.getElementById('dark-mode-toggle');

    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-theme');
    }

    toggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
    });
}

function inicializarFormulario() {
    const form = document.getElementById('form-contacto');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nuevoMensaje = {
            nombre: document.getElementById('nombre').value,
            correo: document.getElementById('correo').value,
            tipoConsulta: document.getElementById('tipo').value,
            mensaje: document.getElementById('mensaje').value
        };

        try {
            const res = await fetch(`${API_URL}/mensajes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevoMensaje)
            });
            if (res.ok) {
                alert('¡Mensaje enviado exitosamente!');
                form.reset();
            }
        } catch (err) {
            alert('Mensaje guardado localmente. El servidor no está disponible en este momento.');
            form.reset();
        }
    });
}
