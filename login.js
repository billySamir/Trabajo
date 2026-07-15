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
        return;
    }

    const datosUsuario = {
        uid: user.uid,
        nombre: user.displayName || "",
        email: user.email || "",
        foto: user.photoURL || ""
    };

    localStorage.setItem("user", JSON.stringify(datosUsuario));
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
            try {
                const credenciales = await auth.createUserWithEmailAndPassword(email, password);
                await guardarUsuarioEnBase(credenciales.user);
                persistirUsuario(credenciales.user);
                window.location.href = "empleos.html";
            } catch (crearError) {
                mostrarMensaje(crearError.message || "No se pudo crear la cuenta.");
            }
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
        const resultado = await auth.signInWithPopup(provider);
        await guardarUsuarioEnBase(resultado.user);
        persistirUsuario(resultado.user);
        window.location.href = "empleos.html";
    } catch (error) {
        mostrarMensaje(error.message || `No se pudo iniciar sesión con ${plataforma}.`);
    }
}

// Volver a la página principal (Logo)
function irAInicio() {
    window.location.href = "index.html";
}

// Mensaje de confirmación en consola
document.addEventListener("DOMContentLoaded", () => {
    const firebaseConfig = window.FIREBASE_CONFIG || {
        apiKey: "TU_API_KEY",
        authDomain: "TU_AUTH_DOMAIN",
        projectId: "TU_PROJECT_ID",
        storageBucket: "TU_STORAGE_BUCKET",
        messagingSenderId: "TU_MESSAGING_SENDER_ID",
        appId: "TU_APP_ID"
    };

    const necesitaConfiguracion = !firebaseConfig.apiKey || firebaseConfig.apiKey.includes("TU_");

    if (necesitaConfiguracion) {
        mostrarMensaje("Agrega la configuración de tu proyecto de Firebase en login.js para activar Google y Firestore.");
        return;
    }

    try {
        window.firebase.initializeApp(firebaseConfig);
        auth = window.firebase.auth();
        db = window.firebase.firestore();
        googleProvider = new window.firebase.auth.GoogleAuthProvider();
        googleProvider.addScope("profile");
        googleProvider.addScope("email");
        githubProvider = new window.firebase.auth.GithubAuthProvider();
        githubProvider.addScope("user:email");

        auth.onAuthStateChanged((usuario) => {
            if (usuario) {
                persistirUsuario(usuario);
                // Solo redirigir a empleos si estamos en la página de login
                if (window.location.pathname.endsWith("login.html")) {
                    window.location.href = "empleos.html";
                }
            }
        });
    } catch (error) {
        mostrarMensaje("No se pudo inicializar Firebase. Revisa la configuración web.");
    }

    console.log("Módulo Login cargado correctamente.");
});