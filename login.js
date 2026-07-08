/**
 * Lógica exclusiva para la página de Iniciar Sesión (login.html)
 */

// Redirigir a la página de empleos tras el login exitoso
function iniciarSesion() {
    console.log("Iniciando sesión con correo y contraseña...");
    
    // Aquí iría la lógica real de autenticación con el backend.
    // Por ahora, simulamos el éxito y redirigimos a los empleos.
    window.location.href = "empleos.html";
}

// Simular el inicio de sesión con redes sociales
function iniciarSesionSocial(plataforma) {
    console.log(`Iniciando sesión con ${plataforma}...`);
    
    // Redirigimos a los empleos simulando autenticación
    window.location.href = "empleos.html";
}

// Volver a la página principal (Logo)
function irAInicio() {
    window.location.href = "index.html";
}

// Mensaje de confirmación en consola
document.addEventListener("DOMContentLoaded", () => {
    console.log("Módulo Login cargado correctamente.");
});