const API_URL = 'http://localhost:3000/api';

// Proyectos del grupo (datos locales como fallback)
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
        urlGithub: "https://github.com/vcontrerasg/Pokemon-Test",
        urlDemo: "https://vcontrerasg.github.io/Pokemon-Test/",
        icono: "⚡",
        autor: { nombre: "Equipo" }
    },
    {
        titulo: "MineDex – Enciclopedia Minecraft",
        descripcion: "Catálogo interactivo de criaturas y bloques de Minecraft. Permite navegar, filtrar y explorar los mobs del Overworld, Nether y The End con diseño pixel art.",
        tecnologias: ["HTML", "CSS", "JavaScript"],
        urlGithub: "https://github.com/vcontrerasg/MinecraftFrontEnd",
        urlDemo: "https://vcontrerasg.github.io/MinecraftFrontEnd/",
        icono: "🧱",
        autor: { nombre: "Equipo" }
    }
];

// Integrantes del grupo (datos locales como fallback)
const INTEGRANTES_LOCALES = [
    {
        nombre: "Víctor Ignacio Contreras Guilloux",
        rol: "Desarrollador Frontend",
        sobreMi: "Persona organizada y responsable, con habilidad para el estudio autodidacta y capacidad de aprendizaje rápido. Estudiante de Ingeniería en Ejecución en Informática, 2do año UCSC.",
        habilidades: ["HTML5", "CSS3", "JavaScript", "Git", "GitHub Pages"],
        foto: "https://i.pinimg.com/736x/95/18/c7/9518c7baecedd451cc171af7ec775a51.jpg",
        links: {
            github: "https://github.com/vcontrerasg",
            linkedin: "https://linkedin.com/in/víctor-contreras-guilloux-7080352ba",
            discord: "https://discord.com/users/v1kthor_"
        }
    },
    {
        nombre: "Fabián Gacitúa Medi",
        rol: "Desarrollador Full Stack",
        sobreMi: "Apasionado por la tecnología y las computadoras. Responsable, justo y con gran disposición para el trabajo en equipo y el aprendizaje continuo. Estudiante UCSC 2do año.",
        habilidades: ["SQL", "HTML5", "CSS3", "C# Básico"],
        foto: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNX1Q9Mth6w326YhW1aZ0plv9Qu9toF4AY4Q&s",
        links: {}
    },
    {
        nombre: "Sebastián Carrillo",
        rol: "Desarrollador Frontend",
        sobreMi: "Estudiante de informática en formación, interesado en el desarrollo web y las aplicaciones móviles. Experiencia en atención al cliente y trabajo bajo presión como Croupier.",
        habilidades: ["HTML5", "VS Code", "Trabajo en equipo", "Desarrollo Frontend"],
        foto: null,
        links: {}
    }
];

document.addEventListener('DOMContentLoaded', () => {
    cargarIntegrantes();
    cargarProyectos();
    inicializarMúsica();
    inicializarDarkMode();
    inicializarFormulario();
});

// Pantalla completa para el iframe de BYTELAND
function toggleFullscreenGame() {
    const iframe = document.getElementById('byteland-iframe');
    if (iframe.requestFullscreen) iframe.requestFullscreen();
    else if (iframe.webkitRequestFullscreen) iframe.webkitRequestFullscreen();
    else if (iframe.mozRequestFullScreen) iframe.mozRequestFullScreen();
}

// 1. CARGAR INTEGRANTES DESDE MONGODB
async function cargarIntegrantes() {
    try {
        const res = await fetch(`${API_URL}/integrantes`, { signal: AbortSignal.timeout(3000) });
        const integrantes = await res.json();
        if (integrantes && integrantes.length > 0) {
            renderizarIntegrantes(integrantes);
            return;
        }
    } catch (err) {
        console.warn("Backend no disponible, usando integrantes locales.", err);
    }
    renderizarIntegrantes(INTEGRANTES_LOCALES, true);
}

function renderizarIntegrantes(integrantes, esLocal = false) {
    const contenedor = document.getElementById('contenedor-integrantes');
    contenedor.innerHTML = '';
    if (!integrantes || integrantes.length === 0) {
        contenedor.innerHTML = '<p style="color: var(--text-color); opacity: 0.6;">Conecta el servidor para ver los integrantes del equipo.</p>';
        return;
    }
    integrantes.forEach(i => {
        const foto = esLocal && i.foto
            ? `<img src="${i.foto}" alt="${i.nombre}" class="integrante-foto" onerror="this.style.display='none'">`
            : (i.foto ? `<img src="${i.foto}" alt="${i.nombre}" class="integrante-foto" onerror="this.style.display='none'">` : '');

        const links = esLocal && i.links ? Object.entries(i.links).map(([key, url]) => {
            const iconos = { github: '🐙 GitHub', linkedin: '💼 LinkedIn', discord: '💬 Discord' };
            return `<a href="${url}" target="_blank" class="btn-link" style="font-size:0.75rem; padding:4px 10px;">${iconos[key] || key}</a>`;
        }).join('') : '';

        contenedor.innerHTML += `
            <div class="card-integrante">
                ${foto}
                <h3>${i.nombre}</h3>
                <p class="rol"><strong>${i.rol}</strong></p>
                <p>${i.sobreMi}</p>
                <div class="tags">
                    ${(i.habilidades || []).map(h => `<span class="tag">${h}</span>`).join('')}
                </div>
                ${links ? `<div class="integrante-links">${links}</div>` : ''}
            </div>
        `;
    });
}

// 2. CARGAR PROYECTOS (API o datos locales como fallback)
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

// 3. (BYTELAND es el minijuego - ver sección #minijuego del HTML)

// 4. MÚSICA
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

// 5. MODO OSCURO
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

// 6. FORMULARIO DE CONTACTO
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
