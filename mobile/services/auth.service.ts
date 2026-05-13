import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { auth } from './firebase.config';
import api from './api';

export async function register(email: string, password: string, displayName: string) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName });
  await api.post('/auth/profile', { displayName, email });
  return credential.user;
}

export async function login(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function logout() {
  await signOut(auth);
}

export async function forgotPassword(email: string) {
  await sendPasswordResetEmail(auth, email);
}

export async function saveFcmToken(token: string) {
  await api.post('/auth/fcm-token', { token });
}
