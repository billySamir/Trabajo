/**
 * Lógica exclusiva para la página de Perfil (perfil.html)
 */

let auth;
let db;
let usuarioActual = null;

function volverAEmpleos() {
    window.location.href = "empleos.html";
}

function guardarEnBase(campo, valor) {
    if (!db || !usuarioActual) return;

    const datos = {};
    datos[campo] = valor;

    db.collection("users").doc(usuarioActual.uid).set(datos, { merge: true });
}

function cargarDatosUsuario(user) {
    usuarioActual = user;

    const nameInput = document.getElementById("inputName");
    const emailInput = document.getElementById("inputEmail");
    const phoneInput = document.getElementById("inputPhone");
    const avatar = document.querySelector(".rounded-full");

    if (!nameInput || !emailInput || !phoneInput) return;

    const usuarioGuardado = JSON.parse(localStorage.getItem("user") || "{}");

    nameInput.value = user?.displayName || usuarioGuardado.nombre || "Sin nombre";
    emailInput.value = user?.email || usuarioGuardado.email || "";
    phoneInput.value = usuarioGuardado.telefono || "+51 999 999 999";

    if (avatar) {
        avatar.textContent = (user?.displayName || usuarioGuardado.nombre || "U").charAt(0).toUpperCase();
    }
}

function toggleEdicion(inputId, boton) {
    const input = document.getElementById(inputId);

    if (!input) return;

    if (input.disabled) {
        input.disabled = false;
        input.focus();

        const val = input.value;
        input.value = "";
        input.value = val;

        boton.innerText = "Guardar";
        boton.classList.remove("text-indigo-600");
        boton.classList.add("text-green-600", "bg-green-50", "rounded-lg");
    } else {
        input.disabled = true;

        boton.innerText = "Editar";
        boton.classList.remove("text-green-600", "bg-green-50", "rounded-lg");
        boton.classList.add("text-indigo-600");

        const mapaCampos = {
            inputName: "nombre",
            inputEmail: "email",
            inputPhone: "telefono"
        };

        const campo = mapaCampos[inputId];
        if (campo) {
            const valor = input.value;
            guardarEnBase(campo, valor);

            const usuarioGuardado = JSON.parse(localStorage.getItem("user") || "{}");
            usuarioGuardado[campo] = valor;
            localStorage.setItem("user", JSON.stringify(usuarioGuardado));
        }

        console.log(`Dato actualizado [${inputId}]:`, input.value);
    }
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
        return;
    }

    try {
        window.firebase.initializeApp(firebaseConfig);
        auth = window.firebase.auth();
        db = window.firebase.firestore();

        auth.onAuthStateChanged((user) => {
            if (!user) {
                window.location.href = "login.html";
                return;
            }

            cargarDatosUsuario(user);
        });
    } catch (error) {
        console.error("No se pudo inicializar Firebase en perfil.", error);
    }

    console.log("Módulo Perfil cargado correctamente.");
});