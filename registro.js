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
        foto: user.photoURL || ""
    };

    localStorage.setItem("user", JSON.stringify(datosUsuario));
    sessionStorage.setItem("auth", "true");
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

async function registrarCuenta() {
    const nombre = document.getElementById("nameInput")?.value.trim();
    const email = document.getElementById("emailInput")?.value.trim();
    const password = document.getElementById("passwordInput")?.value;

    if (!nombre || !email || !password) {
        mostrarMensaje("Completa todos los campos para continuar.");
        return;
    }

    if (!auth) {
        mostrarMensaje("Firebase no está listo todavía. Revisa la configuración del proyecto.");
        return;
    }

    try {
        const credenciales = await auth.createUserWithEmailAndPassword(email, password);
        await credenciales.user.updateProfile({ displayName: nombre });
        await guardarUsuarioEnBase(credenciales.user);
        persistirUsuario(credenciales.user);
        window.location.href = "empleos.html";
    } catch (error) {
        let mensaje = "No se pudo crear la cuenta.";

        if (error.code === 'auth/email-already-in-use') {
            mensaje = 'Ese correo ya está registrado. Inicia sesión o usa otro correo.';
        } else if (error.code === 'auth/invalid-email') {
            mensaje = 'Ingresa un correo electrónico válido.';
        } else if (error.code === 'auth/weak-password') {
            mensaje = 'La contraseña debe tener al menos 6 caracteres.';
        }

        mostrarMensaje(mensaje, 'error');
    }
}

function togglePasswordVisibility() {
    const passwordInput = document.getElementById('passwordInput');
    const icon = document.getElementById('passwordEyeIcon');
    if (!passwordInput || !icon) return;

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.956 9.956 0 012.223-3.444m1.63-1.63A9.958 9.958 0 0112 5c4.478 0 8.268 2.943 9.542 7-.394 1.256-1.01 2.423-1.8 3.44m-1.294 1.334A8.035 8.035 0 0112 17a7.993 7.993 0 01-6.858-3.713M15 12a3 3 0 11-6 0 3 3 0 016 0z" />';
    } else {
        passwordInput.type = 'password';
        icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />\n                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />';
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

function irAInicio() {
    window.location.href = "index.html";
}

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
        mostrarMensaje("Agrega la configuración de tu proyecto de Firebase en firebase-config.js para activar Google, GitHub y Firestore.");
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
    } catch (error) {
        mostrarMensaje("No se pudo inicializar Firebase. Revisa la configuración web.");
    }

    console.log("Módulo Registro cargado correctamente.");
});