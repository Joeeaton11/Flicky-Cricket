import { initializeApp } from 'firebase/app';
import { initializeAuth, indexedDBLocalPersistence, browserLocalPersistence, signInAnonymously, onAuthStateChanged, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc, collection, query, where, orderBy, limit, getDocs, getCount, documentId, serverTimestamp, increment, runTransaction, connectFirestoreEmulator, arrayUnion, arrayRemove } from 'firebase/firestore/lite';
window.FBX = { initializeApp, initializeAuth, indexedDBLocalPersistence, browserLocalPersistence, signInAnonymously, onAuthStateChanged, connectAuthEmulator,
  getFirestore, doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc, collection, query, where, orderBy, limit, getDocs, getCount, documentId, serverTimestamp, increment, runTransaction, connectFirestoreEmulator, arrayUnion, arrayRemove };
