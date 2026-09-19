import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export const AuthContext = createContext(null);

/**
 * Tracks three things, each loaded after the one before:
 *   user     — the Firebase Auth user (or null)
 *   profile  — users/{uid}
 *   business — businesses/{profile.businessId}
 * `ready` becomes true once everything that can be loaded has been.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = still checking
  const [profile, setProfile] = useState(undefined);
  const [business, setBusiness] = useState(undefined);
  const [error, setError] = useState(null);

  useEffect(() => onAuthStateChanged(auth, (u) => setUser(u ?? null)), []);

  useEffect(() => {
    if (!user) {
      setProfile(user === null ? null : undefined);
      return;
    }
    setProfile(undefined);
    return onSnapshot(
      doc(db, 'users', user.uid),
      (snap) => setProfile(snap.exists() ? { id: snap.id, ...snap.data() } : null),
      (err) => setError(err),
    );
  }, [user]);

  const businessId = profile?.businessId ?? null;
  useEffect(() => {
    if (profile === undefined) {
      setBusiness(undefined);
      return;
    }
    if (!businessId) {
      setBusiness(null);
      return;
    }
    setBusiness(undefined);
    return onSnapshot(
      doc(db, 'businesses', businessId),
      (snap) => setBusiness(snap.exists() ? { id: snap.id, ...snap.data() } : null),
      (err) => setError(err),
    );
  }, [profile, businessId]);

  const value = useMemo(
    () => ({
      user,
      profile,
      business,
      error,
      ready: user !== undefined && profile !== undefined && business !== undefined,
      logout: () => signOut(auth),
    }),
    [user, profile, business, error],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
