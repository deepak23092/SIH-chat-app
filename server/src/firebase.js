// Import the functions you need from the SDKs you need

const { initializeApp } = require("firebase/app");
const { getFirestore } = require("firebase/firestore");
const firebaseConfig = {
  apiKey: "AIzaSyCwtOQjxPnfTnktG4b_-bMDKAotKxw4604",
  authDomain: "farmer-89418.firebaseapp.com",
  projectId: "farmer-89418",
  storageBucket: "farmer-89418.appspot.com",
  messagingSenderId: "16376572103",
  appId: "1:16376572103:web:3d4b2acbe6c0e4d37cf6e2",
};

const firebaseApp = initializeApp(firebaseConfig);

// Get Firestore database instance
const db = getFirestore(firebaseApp);

module.exports = db;
