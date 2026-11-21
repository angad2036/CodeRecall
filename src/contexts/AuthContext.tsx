import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
} from '../lib/firebase';
import type { ProgrammingLanguage, UserProfile } from '../types/dsa';

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  authReady: boolean;
  authError: string | null;
  isSigningIn: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updatePreferredLanguage: (lang: ProgrammingLanguage) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getTodayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function getYesterdayIsoDate(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setAuthError(null);

      if (!firebaseUser) {
        setProfile(null);
        setAuthReady(true);
        return;
      }

      const userPath = `users/${firebaseUser.uid}`;
      const userRef = doc(db, 'users', firebaseUser.uid);

      try {
        const snap = await getDoc(userRef);
        const today = getTodayIsoDate();
        const yesterday = getYesterdayIsoDate();

        if (!snap.exists()) {
          const newProfile: UserProfile = {
            uid: firebaseUser.uid,
            displayName: (firebaseUser.displayName || 'Learner').slice(0, 100),
            email: (firebaseUser.email || '').slice(0, 254),
            ...(firebaseUser.photoURL
              ? { photoURL: firebaseUser.photoURL.slice(0, 500) }
              : {}),
            preferredLanguage: 'python',
            streakDays: 1,
            lastActiveDate: today,
          };

          await setDoc(userRef, {
            ...newProfile,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          setProfile(newProfile);
        } else {
          const existing = snap.data() as UserProfile;
          let nextStreak = existing.streakDays ?? 1;
          if (existing.lastActiveDate === yesterday) {
            nextStreak += 1;
          } else if (existing.lastActiveDate !== today) {
            nextStreak = 1;
          }

          if (existing.lastActiveDate !== today) {
            await updateDoc(userRef, {
              streakDays: nextStreak,
              lastActiveDate: today,
              displayName: (firebaseUser.displayName || existing.displayName).slice(0, 100),
              email: (firebaseUser.email || existing.email).slice(0, 254),
              ...(firebaseUser.photoURL
                ? { photoURL: firebaseUser.photoURL.slice(0, 500) }
                : {}),
              updatedAt: serverTimestamp(),
            });
          }

          setProfile({
            ...existing,
            streakDays: nextStreak,
            lastActiveDate: today,
          });
        }
      } catch (err) {
        console.error('Error synchronizing user profile:', err);
        setAuthError(
          err instanceof Error
            ? err.message
            : 'Unable to load your CodeRecall profile.',
        );
      } finally {
        setAuthReady(true);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setAuthError(null);
    setIsSigningIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setAuthError(
        err instanceof Error
          ? err.message
          : 'Google sign-in failed. Please allow popups and try again.',
      );
    } finally {
      setIsSigningIn(false);
    }
  };

  const signOut = async () => {
    setAuthError(null);
    try {
      await firebaseSignOut(auth);
      setProfile(null);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Sign-out failed.');
    }
  };

  const updatePreferredLanguage = async (lang: ProgrammingLanguage) => {
    if (!user) return;
    const path = `users/${user.uid}`;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        preferredLanguage: lang,
        updatedAt: serverTimestamp(),
      });
      setProfile((prev) => (prev ? { ...prev, preferredLanguage: lang } : prev));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        authReady,
        authError,
        isSigningIn,
        signInWithGoogle,
        signOut,
        updatePreferredLanguage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
