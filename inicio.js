/**
 * Lógica exclusiva para la página de Presentación (index.html)
 */

// Redirigir a la vista principal de empleos disponibles
function irAEmpleos() {
    console.log("Navegando a la lista de empleos...");
    // Al tener archivos separados, redirigimos al HTML de empleos
    window.location.href = "empleos.html";
}

// Redirigir a la pantalla de Inicio de Sesión / Registro
function irALogin() {
    console.log("Navegando al login...");
    // Redirigimos al HTML de login
    window.location.href = "login.html";
}

// Recargar la página de inicio (Logo)
function irAInicio() {
    window.location.href = "index.html";
}

// Mensaje de confirmación al cargar el módulo en consola
document.addEventListener("DOMContentLoaded", () => {
    console.log("Módulo Inicio (Presentación) cargado correctamente.");
});