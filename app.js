const API_URL = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', () => {
    cargarIntegrantes();
    cargarProyectos();
    inicializarMinijuego();
    inicializarMúsica();
    inicializarDarkMode();
    inicializarFormulario();
});

async function cargarIntegrantes() {
    try {
        const res = await fetch(`${API_URL}/integrantes`);
        const integrantes = await res.getJson ? await res.json() : await res.json();
        const contenedor = document.getElementById('contenedor-integrantes');
        contenedor.innerHTML = '';

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
    } catch (err) { console.error("Error cargando integrantes", err); }
}

async function cargarProyectos(tecnologia = '') {
    try {
        let url = `${API_URL}/proyectos`;
        if (tecnologia) url += `?tech=${tecnologia}`;

        const res = await fetch(url);
        const proyectos = await res.json();
        const contenedor = document.getElementById('contenedor-proyectos');
        contenedor.innerHTML = '';

        proyectos.forEach(p => {
            contenedor.innerHTML += `
                <div class="card-proyecto">
                    <h3>${p.titulo}</h3>
                    <p>${p.descripcion}</p>
                    <small>Desarrollado por: ${p.autor ? p.autor.nombre : 'Equipo'}</small>
                    <br>
                    <a href="${p.urlGithub}" target="_blank" class="btn-link">Ver GitHub</a>
                </div>
            `;
        });
    } catch (err) { console.error("Error cargando proyectos", err); }
}

function inicializarMinijuego() {
    let numeroSecreto = Math.floor(Math.random() * 20) + 1;
    let intentos = 0;
    
    const btn = document.getElementById('btn-adivina');
    const input = document.getElementById('input-adivina');
    const feedback = document.getElementById('feedback-juego');

    btn.addEventListener('click', () => {
        let suposicion = parseInt(input.value);
        intentos++;

        if (suposicion === numeroSecreto) {
            feedback.innerHTML = `🎉 ¡Correcto! Lo lograste en ${intentos} intentos.`;
            feedback.style.color = "green";
            numeroSecreto = Math.floor(Math.random() * 20) + 1;
            intentos = 0;
        } else if (suposicion < numeroSecreto) {
            feedback.innerHTML = `El número es mayor. Intentos: ${intentos}`;
            feedback.style.color = "orange";
        } else {
            feedback.innerHTML = `El número es menor. Intentos: ${intentos}`;
            feedback.style.color = "orange";
        }
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
        if (document.body.classList.contains('dark-theme')) {
            localStorage.setItem('theme', 'dark');
        } else {
            localStorage.setItem('theme', 'light');
        }
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

        const res = await fetch(`${API_URL}/mensajes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoMensaje)
        });

        if (res.ok) {
            alert('¡Mensaje enviado de forma persistente a MongoDB!');
            form.reset();
        }
    });
}