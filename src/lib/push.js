import { deleteToken, getMessaging, getToken, isSupported, onMessage } from 'firebase/messaging';
import { deleteDoc, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { app, db } from './firebase';

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;
const LAST_TOKEN = 'ledgio:pushToken';

/** Browser can do web push, and we have a key to use. */
export async function pushSupported() {
  return Boolean(VAPID_KEY) && 'Notification' in window && (await isSupported().catch(() => false));
}

/** 'granted' | 'denied' | 'default' | 'unsupported' */
export function pushPermission() {
  return 'Notification' in window ? Notification.permission : 'unsupported';
}

const tokenDoc = (bizId, token) => doc(db, 'businesses', bizId, 'pushTokens', token);

/**
 * Ask permission (the browser asks once and remembers), then register this phone/browser.
 * One token per device, stored on the business so the admin console can reach it.
 * Returns 'on' | 'denied' | 'unsupported' | 'error'.
 */
export async function enablePush(bizId, uid) {
  if (!(await pushSupported())) return 'unsupported';
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return 'denied';

  try {
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    const token = await getToken(getMessaging(app), { vapidKey: VAPID_KEY, serviceWorkerRegistration: registration });
    if (!token) return 'error';
    await setDoc(tokenDoc(bizId, token), {
      uid,
      platform: navigator.userAgent.slice(0, 200),
      createdAt: serverTimestamp(),
    });
    localStorage.setItem(LAST_TOKEN, token);
    return 'on';
  } catch (err) {
    console.warn('Push registration failed:', err);
    return 'error';
  }
}

/** Stop push on this device and forget its token. */
export async function disablePush(bizId) {
  const token = localStorage.getItem(LAST_TOKEN);
  try {
    await deleteToken(getMessaging(app)).catch(() => {});
    if (token) await deleteDoc(tokenDoc(bizId, token)).catch(() => {});
  } finally {
    localStorage.removeItem(LAST_TOKEN);
  }
}

/** True when this device is already registered. */
export const pushOnHere = () => Boolean(localStorage.getItem(LAST_TOKEN)) && pushPermission() === 'granted';

/** Messages that arrive while Ledgio is open and on screen (no OS banner then). */
export async function onForegroundPush(handler) {
  if (!(await pushSupported())) return () => {};
  return onMessage(getMessaging(app), ({ data = {} }) => handler(data));
}
