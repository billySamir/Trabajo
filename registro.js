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
        mostrarMensaje(error.message || "No se pudo crear la cuenta.");
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