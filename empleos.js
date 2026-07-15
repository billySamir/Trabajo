/**
 * Lógica exclusiva para la página de Empleos (empleos.html)
 */

// Base de datos simulada de empleos
const empleos = [
    { id: 1, title: 'Desarrollador Frontend', company: 'TechCorp', type: 'Remoto', salary: '$2000 - $3000', img: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=400' },
    { id: 2, title: 'Diseñador UX/UI', company: 'Creativa', type: 'Híbrido', salary: '$1500 - $2500', img: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=400' },
    { id: 3, title: 'Product Manager', company: 'StartupX', type: 'Remoto', salary: '$3000 - $4000', img: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&q=80&w=400' },
    { id: 4, title: 'Backend Engineer', company: 'DevSolutions', type: 'Remoto', salary: '$2500 - $3500', img: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=400' },
    { id: 5, title: 'Marketing Lead', company: 'Growthify', type: 'Presencial', salary: '$2200 - $3200', img: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=400' },
    { id: 6, title: 'Data Scientist', company: 'DataMind', type: 'Híbrido', salary: '$3500 - $4500', img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=400' }
];

let filtroActual = 'Todos';

// Renderizar tarjetas de empleo en el DOM
function renderizarEmpleos(listaEmpleos) {
    const contenedor = document.getElementById('jobList');
    contenedor.innerHTML = listaEmpleos.map(empleo => `
        <div class="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-xl transition hover:shadow-2xl hover:-translate-y-1 duration-300 flex flex-col h-full">
            <img src="${empleo.img}" alt="${empleo.title}" class="w-full h-48 object-cover">
            <div class="p-6 flex flex-col flex-grow">
                <span class="text-xs font-bold text-indigo-600 uppercase tracking-wider">${empleo.type}</span>
                <h3 class="text-xl font-bold mt-2 text-slate-800">${empleo.title}</h3>
                <p class="text-slate-500 mt-1">${empleo.company}</p>
                <p class="text-slate-700 font-semibold mt-2 mb-6">💰 ${empleo.salary}</p>
                
                <button onclick="postular()" class="mt-auto w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition">
                    Postularme
                </button>
            </div>
        </div>
    `).join('');
}

// Filtrar por botones (Remoto, Híbrido, etc.)
function aplicarFiltro(tipo, botonRef) {
    filtroActual = tipo;
    
    // Actualizar estilos de los botones
    const botones = document.querySelectorAll('.filtro-btn');
    botones.forEach(btn => {
        btn.classList.remove('bg-indigo-600', 'text-white', 'shadow-md');
        btn.classList.add('bg-white', 'text-slate-600');
    });
    
    botonRef.classList.remove('bg-white', 'text-slate-600');
    botonRef.classList.add('bg-indigo-600', 'text-white', 'shadow-md');

    // Ejecutar filtro combinado (tipo + texto)
    filtrarPorTexto();
}

// Filtrar por el input de búsqueda
function filtrarPorTexto() {
    const textoBuscado = document.getElementById('searchInput').value.toLowerCase();
    
    const filtrados = empleos.filter(empleo => {
        const coincideTexto = empleo.title.toLowerCase().includes(textoBuscado) || 
                              empleo.company.toLowerCase().includes(textoBuscado);
        const coincideTipo = (filtroActual === 'Todos') ? true : (empleo.type === filtroActual);
        
        return coincideTexto && coincideTipo;
    });

    renderizarEmpleos(filtrados);
}

// Verificar si el usuario está autenticado
function usuarioAutenticado() {
    return localStorage.getItem("user") !== null;
}

// Obtener datos del usuario autenticado
function obtenerUsuarioActual() {
    const usuarioGuardado = localStorage.getItem("user");
    return usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
}

// Menú de Perfil
function toggleMenu() {
    const menu = document.getElementById('profile-menu');
    menu.classList.toggle('hidden');
}

// Cerrar el menú si se hace clic fuera de él
document.addEventListener('click', function(event) {
    const menu = document.getElementById('profile-menu');
    const avatar = menu.previousElementSibling;
    
    if (!menu.contains(event.target) && !avatar.contains(event.target)) {
        menu.classList.add('hidden');
    }
});

// Navegación
function irAPerfil() {
    window.location.href = "perfil.html#datos";
}

function irACurriculum() {
    window.location.href = "perfil.html#curriculum";
}

function irAPostulaciones() {
    window.location.href = "perfil.html#postulaciones";
}

function irAConfiguracion() {
    window.location.href = "perfil.html#configuracion";
}

function irAInicio() {
    window.location.href = "index.html";
}

function cerrarSesion() {
    // Limpiar localStorage
    localStorage.removeItem("user");
    // Hacer logout en Firebase (si está disponible)
    if (typeof cerrarSesionFirebase === 'function') {
        cerrarSesionFirebase();
    }
    // Redirigir a inicio
    window.location.href = "index.html";
}

function postular() {
    // Verificar si está autenticado
    if (!usuarioAutenticado()) {
        mostrarModalAutenticacion();
        return;
    }
    
    alert('¡Te has postulado con éxito a esta posición!');
}

// Función para mostrar modal personalizado de autenticación
function mostrarModalAutenticacion() {
    // Crear overlay
    const overlay = document.createElement('div');
    overlay.className = 'auth-modal-overlay';
    
    // Crear contenido del modal
    overlay.innerHTML = `
        <div class="auth-modal-content">
            <div class="auth-modal-header">
                <div class="auth-modal-icon">🔐</div>
                <h2 class="auth-modal-title">Inicia Sesión</h2>
                <p class="auth-modal-message">
                    Necesitas una cuenta para postularte a empleos. Es rápido y seguro.
                </p>
            </div>
            
            <div class="auth-modal-buttons">
                <button class="auth-modal-btn auth-modal-btn-primary" onclick="irALogin()">
                    Iniciar Sesión
                </button>
                <button class="auth-modal-btn auth-modal-btn-secondary" onclick="cerrarModal(this)">
                    Cancelar
                </button>
            </div>
        </div>
    `;
    
    // Agregar al DOM
    document.body.appendChild(overlay);
    
    // Cerrar al hacer clic en el overlay (fuera del modal)
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.remove();
        }
    });
}

function irALogin() {
    window.location.href = "login.html";
}

function cerrarModal(btn) {
    const overlay = btn.closest('.auth-modal-overlay');
    if (overlay) {
        overlay.remove();
    }
}

// Inicializar la vista al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    const usuario = obtenerUsuarioActual();
    
    if (!usuario) {
        // Si no está autenticado, ocultar el menú de perfil y mostrar botón de login
        const profileNav = document.querySelector('nav .relative');
        if (profileNav) {
            profileNav.innerHTML = `
                <button onclick="window.location.href='login.html'" class="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition duration-300 shadow-md">
                    Iniciar Sesión
                </button>
            `;
        }
    } else {
        // Actualizar avatar con la primera letra del nombre
        actualizarAvatarEmpleos(usuario);
        // Actualizar el menú de perfil
        actualizarMenuPerfil(usuario);
    }
    
    renderizarEmpleos(empleos);
    console.log("Módulo Empleos cargado correctamente.");
});

// Función para actualizar el avatar en empleos
function actualizarAvatarEmpleos(usuario) {
    const avatar = document.getElementById('avatar-btn');
    if (avatar) {
        const nombre = usuario.nombre || usuario.email || 'U';
        avatar.textContent = nombre.charAt(0).toUpperCase();
    }
}

// Función para actualizar el menú de perfil con datos del usuario
function actualizarMenuPerfil(usuario) {
    const nombreElement = document.querySelector('#profile-menu .text-sm.font-extrabold');
    const emailElement = document.querySelector('#profile-menu .text-xs.text-slate-500');
    
    if (nombreElement) {
        nombreElement.textContent = usuario.nombre || usuario.email || 'Usuario';
    }
    if (emailElement) {
        emailElement.textContent = usuario.email || '';
    }
}