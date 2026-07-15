/**
 * Lógica exclusiva para la página de Iniciar Sesión (login.html)
 */

let auth;
let db;
let googleProvider;
let githubProvider;

function mostrarMensaje(texto, tipo = "error") {
    const mensaje = document.getElementById("auth-message");
    if (!mensaje) return;

    mensaje.textContent = texto;
    mensaje.className = `mt-4 text-sm text-center ${tipo === "error" ? "text-red-600" : "text-green-600"}`;
}

function guardarUsuarioEnBase(user) {
    if (!db || !user) return Promise.resolve();

    const datosUsuario = {
        uid: user.uid,
        nombre: user.displayName || "",
        email: user.email || "",
        foto: user.photoURL || "",
        proveedor: user.providerData?.[0]?.providerId || "firebase",
        actualizadoEn: new Date().toISOString()
    };

    return db.collection("users").doc(user.uid).set(datosUsuario, { merge: true });
}

function persistirUsuario(user) {
    if (!user) {
        localStorage.removeItem("user");
        sessionStorage.removeItem("auth");
        return;
    }

    const datosUsuario = {
        uid: user.uid,
        nombre: user.displayName || "",
        email: user.email || "",
        foto: user.photoURL || "",
        provider: user.providerData?.[0]?.providerId || "firebase"
    };

    localStorage.setItem("user", JSON.stringify(datosUsuario));
    sessionStorage.setItem("auth", "true");
}

async function iniciarSesion() {
    const emailInput = document.getElementById("emailInput");
    const passwordInput = document.getElementById("passwordInput");

    if (!emailInput || !passwordInput || !auth) {
        mostrarMensaje("Firebase no está listo todavía. Revisa la configuración del proyecto.");
        return;
    }

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
        mostrarMensaje("Ingresa tu correo y contraseña para continuar.");
        return;
    }

    try {
        const credenciales = await auth.signInWithEmailAndPassword(email, password);
        await guardarUsuarioEnBase(credenciales.user);
        persistirUsuario(credenciales.user);
        window.location.href = "empleos.html";
    } catch (error) {
        if (error.code === "auth/user-not-found") {
            mostrarMensaje("Correo no registrado. Por favor regístrate primero.");
            return;
        }

        mostrarMensaje(error.message || "No se pudo iniciar sesión.");
    }
}

async function iniciarSesionSocial(plataforma) {
    if (!auth || (!googleProvider && !githubProvider)) {
        mostrarMensaje("Firebase no está listo todavía. Revisa la configuración del proyecto.");
        return;
    }

    let provider;

    if (plataforma === "Google") {
        provider = googleProvider;
    } else if (plataforma === "GitHub") {
        provider = githubProvider;
    } else {
        mostrarMensaje("Por ahora solo Google y GitHub están disponibles.");
        return;
    }

    try {
        // Usar redirect para evitar problemas de popup en navegadores con políticas estrictas.
        await auth.signInWithRedirect(provider);
        return;
    } catch (error) {
        console.error('Error iniciando sesión social:', error);

        if (error.code === 'auth/unauthorized-domain') {
            mostrarMensaje('Dominio no autorizado en Firebase. Añade tu dominio en la consola de Firebase.');
            return;
        }

        mostrarMensaje(error.message || `No se pudo iniciar sesión con ${plataforma}.`);
    }
}

function cerrarSesionFirebase() {
    if (auth) {
        auth.signOut().catch(error => console.log("Error al cerrar sesión en Firebase:", error));
    }
}

// Volver a la página principal (Logo)
function irAInicio() {
    window.location.href = "index.html";
}

// Mensaje de confirmación en consola
document.addEventListener("DOMContentLoaded", () => {
    // Solo inicializar si estamos en login.html o si necesitamos desloguear desde empleos
    const enLoginPage = window.location.pathname.endsWith("login.html");
    
    const firebaseConfig = window.FIREBASE_CONFIG || {
        apiKey: "TU_API_KEY",
        authDomain: "TU_AUTH_DOMAIN",
        projectId: "TU_PROJECT_ID",
        storageBucket: "TU_STORAGE_BUCKET",
        messagingSenderId: "TU_MESSAGING_SENDER_ID",
        appId: "TU_APP_ID"
    };

    const necesitaConfiguracion = !firebaseConfig.apiKey || firebaseConfig.apiKey.includes("TU_");

    if (necesitaConfiguracion && enLoginPage) {
        mostrarMensaje("Agrega la configuración de tu proyecto de Firebase en login.js para activar Google y Firestore.");
        return;
    }

    try {
        // Evitar inicializar Firebase múltiples veces
        if (!window.firebase || !window.firebase.apps || window.firebase.apps.length === 0) {
            window.firebase.initializeApp(firebaseConfig);
        }
        
        auth = window.firebase.auth();
        db = window.firebase.firestore();
        
        auth.setPersistence(window.firebase.auth.Auth.Persistence.SESSION).catch(error => {
            console.log('No se pudo configurar la persistencia de sesión:', error);
        });

        if (enLoginPage) {
            googleProvider = new window.firebase.auth.GoogleAuthProvider();
            googleProvider.addScope("profile");
            googleProvider.addScope("email");
            githubProvider = new window.firebase.auth.GithubAuthProvider();
            githubProvider.addScope("user:email");

            auth.onAuthStateChanged(async (usuario) => {
                if (!usuario) return;
                await guardarUsuarioEnBase(usuario);
                persistirUsuario(usuario);
                window.location.href = "empleos.html";
            });

            auth.getRedirectResult()
                .then(async (result) => {
                    if (result.user) {
                        await guardarUsuarioEnBase(result.user);
                        persistirUsuario(result.user);
                        window.location.href = "empleos.html";
                    }
                })
                .catch((redirectError) => {
                    console.warn('Error al procesar redirect de Firebase:', redirectError);
                    if (redirectError.code === 'auth/unauthorized-domain') {
                        mostrarMensaje('Dominio no autorizado en Firebase. Añade este dominio en la consola de Firebase.');
                    }
                });
        }
    } catch (error) {
        if (enLoginPage) {
            mostrarMensaje("No se pudo inicializar Firebase. Revisa la configuración web.");
        }
        console.log("Error inicializando Firebase:", error);
    }

    console.log("Módulo Login cargado correctamente.");
});