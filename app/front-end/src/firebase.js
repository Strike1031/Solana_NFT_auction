// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyCz-t3uwpSxpz1fgpBsZ1nwXKj6Dgi-s8o",
  authDomain: "solana-nft-125f6.firebaseapp.com",
  projectId: "solana-nft-125f6",
  storageBucket: "solana-nft-125f6.appspot.com",
  messagingSenderId: "74004369361",
  appId: "1:74004369361:web:efbeb1d5e228b9c12d5af0",
  measurementId: "G-C8Z6PP2YR9"
}

// Initialize Firebase
const initializeFirebase = () => initializeApp(firebaseConfig)

export default initializeFirebase