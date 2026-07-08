/**
 * Lógica exclusiva para la página de Perfil (perfil.html)
 */

// Navegar de regreso a la lista de empleos
function volverAEmpleos() {
    window.location.href = "empleos.html";
}

// Alternar entre modo "Solo lectura" y modo "Edición"
function toggleEdicion(inputId, boton) {
    const input = document.getElementById(inputId);
    
    // Si el input está deshabilitado, lo habilitamos para editar
    if (input.disabled) {
        input.disabled = false;
        input.focus();
        
        // Colocamos el cursor al final del texto
        const val = input.value;
        input.value = '';
        input.value = val;
        
        // Cambiar el texto y estilo del botón
        boton.innerText = "Guardar";
        boton.classList.remove('text-indigo-600');
        boton.classList.add('text-green-600', 'bg-green-50', 'rounded-lg');
    } 
    // Si ya está habilitado, lo deshabilitamos (Guardar)
    else {
        input.disabled = true;
        
        // Restaurar el texto y estilo del botón
        boton.innerText = "Editar";
        boton.classList.remove('text-green-600', 'bg-green-50', 'rounded-lg');
        boton.classList.add('text-indigo-600');
        
        // Aquí iría la lógica para enviar el dato actualizado a la base de datos
        console.log(`Dato actualizado [${inputId}]:`, input.value);
    }
}

// Mensaje de confirmación en consola
document.addEventListener("DOMContentLoaded", () => {
    console.log("Módulo Perfil cargado correctamente.");
});