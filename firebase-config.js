// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Tu configuración web de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAZsFCjwAm-Hy_1uK6xIxjm6KPShcZZITY",
  authDomain: "busqueda-de-trabajo-b7f08.firebaseapp.com",
  projectId: "busqueda-de-trabajo-b7f08",
  storageBucket: "busqueda-de-trabajo-b7f08.firebasestorage.app",
  messagingSenderId: "929331290926",
  appId: "1:929331290926:web:33eacdf1ecbbb8439410bf",
  measurementId: "G-XCVVWHH6GM"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Exportar los servicios para usarlos en el resto de la aplicación
export { app, analytics };