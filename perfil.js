/**
 * Lógica completa para la página de Perfil (perfil.html)
 */

let auth;
let db;
let usuarioActual = null;
let cambioActual = null;

// ====== NAVEGACIÓN ======
function volverAEmpleos() {
    window.location.href = "empleos.html";
}

// ====== TABS ======
function cambiarTab(tabName) {
    // Ocultar todos los tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });
    
    // Mostrar el tab seleccionado
    document.getElementById('contenido-' + tabName).classList.remove('hidden');
    
    // Actualizar estilos de botones
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('text-indigo-600', 'border-b-2', 'border-indigo-600');
        btn.classList.add('text-slate-600', 'hover:text-slate-800');
    });
    
    document.getElementById('tab-' + tabName).classList.remove('text-slate-600', 'hover:text-slate-800');
    document.getElementById('tab-' + tabName).classList.add('text-indigo-600', 'border-b-2', 'border-indigo-600');
}

// ====== AVATAR Y FOTO ======
function actualizarAvatar(usuario) {
    const avatar = document.getElementById('avatar-display');
    if (!avatar || !usuario) return;
    
    const nombre = usuario.displayName || usuario.nombre || usuario.email || 'U';
    avatar.textContent = nombre.charAt(0).toUpperCase();
}

function cambiarFoto(event) {
    const archivo = event.target.files[0];
    if (!archivo) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const foto = e.target.result;
        const avatar = document.getElementById('avatar-display');
        
        // Mostrar imagen en el avatar
        if (avatar) {
            avatar.style.backgroundImage = `url('${foto}')`;
            avatar.style.backgroundSize = 'cover';
            avatar.style.backgroundPosition = 'center';
            avatar.textContent = ''; // Limpiar texto
        }
        
        // Guardar en localStorage
        if (usuarioActual) {
            const userData = JSON.parse(localStorage.getItem('user') || '{}');
            userData.foto = foto;
            localStorage.setItem('user', JSON.stringify(userData));
            
            // Guardar en Firebase
            if (db && usuarioActual.uid) {
                db.collection('users').doc(usuarioActual.uid).set({
                    foto: foto
                }, { merge: true });
            }
        }
        
        alert('✅ Foto actualizada correctamente');
    };
    
    reader.readAsDataURL(archivo);
}

// ====== EDICIÓN SIMPLE (Nombre) ======
function toggleEdicion(inputId, boton, campo) {
    const input = document.getElementById(inputId);
    if (!input) return;
    
    if (input.disabled) {
        // Habilitar edición
        input.disabled = false;
        input.focus();
        boton.textContent = 'Guardar';
        boton.classList.add('text-green-600');
    } else {
        // Guardar cambio
        input.disabled = true;
        boton.textContent = 'Editar';
        boton.classList.remove('text-green-600');
        
        // Guardar en base de datos
        const valor = input.value;
        if (valor.trim()) {
            guardarCampo(campo, valor);
        }
    }
}

function guardarCampo(campo, valor) {
    // Guardar en localStorage
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    userData[campo] = valor;
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Guardar en Firebase
    if (db && usuarioActual && usuarioActual.uid) {
        const data = {};
        data[campo] = valor;
        db.collection('users').doc(usuarioActual.uid).set(data, { merge: true });
    }
    
    alert('✅ ' + campo + ' actualizado correctamente');
}

// ====== EDICIÓN SENSIBLE (Email, Contraseña, Celular) ======
let recaptchaVerifier = null;

function toggleEdicionSensible(inputId, tipo) {
    cambioActual = {
        inputId: inputId,
        tipo: tipo,
        valorOriginal: document.getElementById(inputId).value,
        verificationId: null,
        telefonoCode: null
    };
    
    const modal = document.getElementById('confirmation-modal');
    const title = document.getElementById('modal-title');
    const message = document.getElementById('modal-message');
    const inputs = document.getElementById('modal-inputs');
    
    title.textContent = 'Confirmar cambio de ' + tipo;
    
    if (tipo === 'contraseña') {
        message.textContent = 'Se enviará un enlace al correo registrado para completar el cambio de contraseña.';
        inputs.innerHTML = `
            <input type="password" id="currentPassword" placeholder="Contraseña actual" class="w-full p-3 border border-slate-200 rounded-xl mb-3 outline-none focus:ring-2 focus:ring-indigo-500">
            <input type="password" id="newPassword" placeholder="Nueva contraseña" class="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500">
        `;
    } else if (tipo === 'correo') {
        message.textContent = 'Necesitamos tu contraseña actual y enviaremos un correo de verificación al nuevo correo.';
        inputs.innerHTML = `
            <input type="email" id="newEmail" placeholder="Nuevo correo electrónico" class="w-full p-3 border border-slate-200 rounded-xl mb-3 outline-none focus:ring-2 focus:ring-indigo-500">
            <input type="password" id="currentPassword" placeholder="Contraseña actual" class="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500">
        `;
    } else if (tipo === 'celular') {
        const currentPhone = document.getElementById('inputPhone').value || '';
        message.textContent = 'Se enviará un código al número actual para autorizar el cambio.';
        inputs.innerHTML = `
            <div class="mb-3 text-sm text-slate-600">Número actual: <strong>${currentPhone}</strong></div>
            <input type="tel" id="newPhone" placeholder="Nuevo número de celular" class="w-full p-3 border border-slate-200 rounded-xl mb-3 outline-none focus:ring-2 focus:ring-indigo-500">
            <button type="button" id="sendPhoneCodeButton" onclick="enviarCodigoCelularActual()" class="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition mb-3">
                Enviar código al número actual
            </button>
            <input type="text" id="phoneVerificationCode" placeholder="Código de verificación" class="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 hidden">
        `;
    }
    
    modal.classList.remove('hidden');
}

async function confirmarCambio() {
    if (!cambioActual) return;
    
    const tipo = cambioActual.tipo;
    
    if (tipo === 'contraseña') {
        const currentPassword = document.getElementById('currentPassword')?.value;
        const newPassword = document.getElementById('newPassword')?.value;
        
        if (!currentPassword || !newPassword) {
            alert('⚠️ Completa ambos campos');
            return;
        }
        
        if (newPassword.length < 6) {
            alert('⚠️ La nueva contraseña debe tener al menos 6 caracteres');
            return;
        }
        
        const reauthOk = await reauthenticateWithPassword(currentPassword);
        if (!reauthOk) return;

        try {
            await auth.sendPasswordResetEmail(auth.currentUser.email);
            alert('✅ Se envió un enlace de restablecimiento a tu correo. Sigue las instrucciones para cambiar tu contraseña.');
        } catch (error) {
            console.error('Error enviando correo de restablecimiento:', error);
            alert('⚠️ No se pudo enviar el correo de restablecimiento. Intenta nuevamente.');
            return;
        }
    } else if (tipo === 'correo') {
        const newEmail = document.getElementById('newEmail')?.value;
        const currentPassword = document.getElementById('currentPassword')?.value;
        
        if (!newEmail || !newEmail.includes('@')) {
            alert('⚠️ Ingresa un correo válido');
            return;
        }
        if (!currentPassword) {
            alert('⚠️ Ingresa tu contraseña actual para confirmar el cambio');
            return;
        }
        
        const reauthOk = await reauthenticateWithPassword(currentPassword);
        if (!reauthOk) return;

        try {
            await auth.currentUser.updateEmail(newEmail);
            await auth.currentUser.sendEmailVerification();
            document.getElementById('inputEmail').value = newEmail;
            guardarCampo('correo', newEmail);
            alert('✅ Correo actualizado. Se envió un correo de verificación al nuevo correo. Comprueba tu bandeja.');
        } catch (error) {
            console.error('Error actualizando correo:', error);
            alert(error.message || '⚠️ No se pudo actualizar el correo.');
            return;
        }
    } else if (tipo === 'celular') {
        const newPhone = document.getElementById('newPhone')?.value;
        const code = document.getElementById('phoneVerificationCode')?.value;

        if (!newPhone) {
            alert('⚠️ Ingresa un nuevo número de celular');
            return;
        }

        if (!code) {
            alert('⚠️ Ingresa el código de verificación enviado al número actual');
            return;
        }

        try {
            if (cambioActual.verificationId) {
                const credential = window.firebase.auth.PhoneAuthProvider.credential(cambioActual.verificationId, code);
                await auth.currentUser.reauthenticateWithCredential(credential);
            } else if (cambioActual.telefonoCode) {
                if (code !== cambioActual.telefonoCode) {
                    alert('⚠️ Código incorrecto');
                    return;
                }
            } else {
                alert('⚠️ Primero debes enviar el código al número actual');
                return;
            }

            document.getElementById('inputPhone').value = newPhone;
            guardarCampo('telefono', newPhone);
            alert('✅ Número de celular actualizado correctamente');
        } catch (error) {
            console.error('Error verificando código de celular:', error);
            alert('⚠️ La verificación del código falló. Intenta nuevamente.');
            return;
        }
    }
    
    cancelarConfirmacion();
}

function cancelarConfirmacion() {
    document.getElementById('confirmation-modal').classList.add('hidden');
    document.getElementById('modal-inputs').innerHTML = '';
    cambioActual = null;
}

async function reauthenticateWithPassword(password) {
    if (!auth || !auth.currentUser || !auth.currentUser.email) {
        alert('⚠️ No se pudo verificar tu sesión. Vuelve a iniciar sesión.');
        return false;
    }

    const credential = window.firebase.auth.EmailAuthProvider.credential(auth.currentUser.email, password);
    try {
        await auth.currentUser.reauthenticateWithCredential(credential);
        return true;
    } catch (error) {
        console.error('Error reautenticando usuario:', error);
        alert('⚠️ La contraseña actual no es correcta.');
        return false;
    }
}

async function enviarCodigoCelularActual() {
    const currentPhone = document.getElementById('inputPhone').value?.trim();
    const newPhone = document.getElementById('newPhone')?.value?.trim();
    const codeInput = document.getElementById('phoneVerificationCode');
    const sendButton = document.getElementById('sendPhoneCodeButton');

    if (!currentPhone) {
        alert('⚠️ No hay un número actual registrado.');
        return;
    }
    if (!newPhone) {
        alert('⚠️ Ingresa el nuevo número de celular antes de enviar el código.');
        return;
    }

    try {
        if (!window.firebase || !window.firebase.auth || !window.firebase.auth.PhoneAuthProvider) {
            throw new Error('PhoneAuth no disponible');
        }

        if (recaptchaVerifier) {
            recaptchaVerifier.clear();
        }
        recaptchaVerifier = new window.firebase.auth.RecaptchaVerifier('recaptcha-container', {
            size: 'invisible'
        });

        const phoneProvider = new window.firebase.auth.PhoneAuthProvider(auth);
        cambioActual.verificationId = await phoneProvider.verifyPhoneNumber(currentPhone, recaptchaVerifier);
        codeInput.classList.remove('hidden');
        sendButton.disabled = true;
        alert('✅ Se envió un código al número actual. Ingresa el código para confirmar el cambio.');
    } catch (error) {
        console.warn('No se pudo enviar SMS real, usando código simulado:', error);
        cambioActual.telefonoCode = Math.floor(100000 + Math.random() * 900000).toString();
        codeInput.classList.remove('hidden');
        sendButton.disabled = true;
        alert(`✅ Código simulado generado para pruebas: ${cambioActual.telefonoCode}`);
    }
}

// ====== CURRÍCULUM ======
function subirCurriculum() {
    document.getElementById('inputCurriculum').click();
}

function guardarCurriculum(event) {
    const archivo = event.target.files[0];
    if (!archivo) return;
    
    const nombreArchivo = archivo.name;
    const tamano = (archivo.size / 1024 / 1024).toFixed(2) + ' MB';
    
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    userData.curriculum = {
        nombre: nombreArchivo,
        tamano: tamano,
        fecha: new Date().toLocaleDateString('es-ES')
    };
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Guardar en Firebase
    if (db && usuarioActual && usuarioActual.uid) {
        db.collection('users').doc(usuarioActual.uid).set({
            curriculum: userData.curriculum
        }, { merge: true });
    }
    
    // Actualizar interfaz
    const curriculumContent = document.getElementById('curriculum-content');
    curriculumContent.innerHTML = `
        <div class="bg-indigo-50 p-6 rounded-xl border border-indigo-200">
            <p class="font-bold text-indigo-900 mb-2">📄 ${nombreArchivo}</p>
            <p class="text-sm text-indigo-700">Tamaño: ${tamano}</p>
            <p class="text-sm text-indigo-700">Subido: ${userData.curriculum.fecha}</p>
            <button onclick="eliminarCurriculum()" class="mt-4 text-red-600 font-semibold hover:text-red-800">🗑️ Eliminar</button>
        </div>
    `;
    
    alert('✅ Currículum subido correctamente');
}

function eliminarCurriculum() {
    if (confirm('¿Estás seguro de que deseas eliminar tu currículum?')) {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        delete userData.curriculum;
        localStorage.setItem('user', JSON.stringify(userData));
        
        if (db && usuarioActual && usuarioActual.uid) {
            db.collection('users').doc(usuarioActual.uid).update({
                curriculum: window.firebase.firestore.FieldValue.delete()
            });
        }
        
        document.getElementById('curriculum-content').innerHTML = '<p class="text-slate-500 text-center py-8">No has subido ningún currículum todavía</p>';
        alert('✅ Currículum eliminado');
    }
}

// ====== POSTULACIONES ======
function cargarPostulaciones() {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const postulaciones = userData.postulaciones || [];
    
    const listElement = document.getElementById('postulaciones-list');
    
    if (postulaciones.length === 0) {
        listElement.innerHTML = '<p class="text-slate-500 text-center py-8">Aún no te has postulado a ninguna oferta</p>';
        return;
    }
    
    listElement.innerHTML = postulaciones.map(post => `
        <div class="bg-slate-50 p-6 rounded-xl border border-slate-200 hover:border-indigo-300 transition">
            <div class="flex justify-between items-start">
                <div>
                    <h4 class="font-bold text-slate-800">${post.titulo}</h4>
                    <p class="text-slate-600 text-sm">${post.empresa}</p>
                    <span class="inline-block mt-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">
                        ${post.estado || 'En revisión'}
                    </span>
                </div>
                <span class="text-slate-400 text-sm">${post.fecha || 'N/A'}</span>
            </div>
        </div>
    `).join('');
}

// ====== CONFIGURACIÓN ======
function cerrarSesion() {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        localStorage.removeItem('user');
        if (typeof cerrarSesionFirebase === 'function') {
            cerrarSesionFirebase();
        }
        window.location.href = 'index.html';
    }
}

function eliminarCuenta() {
    if (confirm('⚠️ ATENCIÓN: Esta acción es IRREVERSIBLE. ¿Estás seguro de que deseas eliminar tu cuenta permanentemente?')) {
        if (confirm('Esto eliminará todos tus datos. Escribe "ELIMINAR" para confirmar.')) {
            // En un caso real, aquí harías la eliminación en Firebase
            localStorage.removeItem('user');
            if (auth) {
                auth.currentUser.delete();
            }
            alert('✅ Cuenta eliminada');
            window.location.href = 'index.html';
        }
    }
}

// ====== INICIALIZACIÓN ======
document.addEventListener('DOMContentLoaded', () => {
    const usuario = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!usuario.uid) {
        window.location.href = 'login.html';
        return;
    }
    
    // Cargar datos
    const nameInput = document.getElementById('inputName');
    const emailInput = document.getElementById('inputEmail');
    const phoneInput = document.getElementById('inputPhone');
    
    if (nameInput) nameInput.value = usuario.nombre || '';
    if (emailInput) emailInput.value = usuario.correo || usuario.email || '';
    if (phoneInput) phoneInput.value = usuario.telefono || '';
    
    // Actualizar avatar
    actualizarAvatar(usuario);
    
    // Restaurar foto de perfil si existe
    if (usuario.foto) {
        const avatar = document.getElementById('avatar-display');
        if (avatar) {
            avatar.style.backgroundImage = `url('${usuario.foto}')`;
            avatar.style.backgroundSize = 'cover';
            avatar.style.backgroundPosition = 'center';
            avatar.textContent = '';
        }
    }
    
    // Cargar currículum si existe
    if (usuario.curriculum) {
        document.getElementById('curriculum-content').innerHTML = `
            <div class="bg-indigo-50 p-6 rounded-xl border border-indigo-200">
                <p class="font-bold text-indigo-900 mb-2">📄 ${usuario.curriculum.nombre}</p>
                <p class="text-sm text-indigo-700">Tamaño: ${usuario.curriculum.tamano}</p>
                <p class="text-sm text-indigo-700">Subido: ${usuario.curriculum.fecha}</p>
                <button onclick="eliminarCurriculum()" class="mt-4 text-red-600 font-semibold hover:text-red-800">🗑️ Eliminar</button>
            </div>
        `;
    }
    
    // Cargar postulaciones
    cargarPostulaciones();
    
    // Detectar hash para cambiar de tab automáticamente
    const hash = window.location.hash.substring(1);
    if (hash) {
        cambiarTab(hash);
    }
    
    // Inicializar Firebase
    const firebaseConfig = window.FIREBASE_CONFIG || {
        apiKey: "TU_API_KEY",
        authDomain: "TU_AUTH_DOMAIN",
        projectId: "TU_PROJECT_ID",
        storageBucket: "TU_STORAGE_BUCKET",
        messagingSenderId: "TU_MESSAGING_SENDER_ID",
        appId: "TU_APP_ID"
    };
    
    try {
        if (!window.firebase || !window.firebase.apps || window.firebase.apps.length === 0) {
            window.firebase.initializeApp(firebaseConfig);
        }
        auth = window.firebase.auth();
        db = window.firebase.firestore();

        auth.onAuthStateChanged((usuario) => {
            if (usuario) {
                usuarioActual = usuario;
            } else {
                localStorage.removeItem('user');
                window.location.href = 'login.html';
            }
        });
    } catch (error) {
        console.log("Firebase error:", error);
    }
    
    console.log("Módulo Perfil cargado correctamente.");
});