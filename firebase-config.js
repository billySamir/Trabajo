// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAZSfCjwAm-Hy_1uk6xIxjm6KPShcZZITY",
  authDomain: "busqueda-de-trabajo-b7f08.firebaseapp.com",
  projectId: "busqueda-de-trabajo-b7f08",
  storageBucket: "busqueda-de-trabajo-b7f08.firebasestorage.app",
  messagingSenderId: "929331290926",
  appId: "1:929331290926:web:33eacdf1ecbbb8439410bf",
  measurementId: "G-XCVVWHH6GM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);