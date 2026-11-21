import { useCallback, useEffect, useState } from 'react';
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import type {
  ProblemProgress,
  ProblemStatus,
  ProgrammingLanguage,
} from '../types/dsa';

const GUEST_STORAGE_KEY = 'coderecall_guest_progress_v1';
const MAX_CODE_LEN = 25000;
const MAX_NOTES_LEN = 5000;

function readGuestProgress(): Record<string, ProblemProgress> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(GUEST_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, ProblemProgress>;
  } catch {
    return {};
  }
}

function writeGuestProgress(map: Record<string, ProblemProgress>): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Ignore storage quota errors
  }
}

function sanitizeCode(value: string | undefined): string {
  return (value ?? '').slice(0, MAX_CODE_LEN);
}

function sanitizeNotes(value: string | undefined): string {
  return (value ?? '').slice(0, MAX_NOTES_LEN);
}

export function useUserProgress() {
  const { user, profile, authReady } = useAuth();
  const [progressMap, setProgressMap] = useState<Record<string, ProblemProgress>>({});
  const [loading, setLoading] = useState(true);
  const [savingProblemId, setSavingProblemId] = useState<string | null>(null);

  useEffect(() => {
    if (!authReady) return;

    if (!user) {
      setProgressMap(readGuestProgress());
      setLoading(false);
      return;
    }

    if (!profile) {
      setLoading(true);
      return;
    }

    const progressPath = `users/${user.uid}/progress`;
    setLoading(true);

    const unsubscribe = onSnapshot(
      collection(db, 'users', user.uid, 'progress'),
      (snapshot) => {
        const next: Record<string, ProblemProgress> = {};
        snapshot.forEach((docSnap) => {
          next[docSnap.id] = docSnap.data() as ProblemProgress;
        });
        setProgressMap(next);
        setLoading(false);
      },
      (err) => {
        setLoading(false);
        handleFirestoreError(err, OperationType.LIST, progressPath);
      },
    );

    return () => unsubscribe();
  }, [user, profile, authReady]);

  const savePracticeState = useCallback(
    async (
      problemId: string,
      updates: {
        status?: ProblemStatus;
        preferredLanguage?: ProgrammingLanguage;
        codeJava?: string;
        codeCpp?: string;
        codePython?: string;
        notes?: string;
      },
    ) => {
      if (!/^[a-zA-Z0-9_-]+$/.test(problemId)) {
        throw new Error('Invalid problem identifier.');
      }

      const existing = progressMap[problemId];
      const nextStatus: ProblemStatus =
        updates.status ?? existing?.status ?? 'attempted';
      const nextLang: ProgrammingLanguage =
        updates.preferredLanguage ?? existing?.preferredLanguage ?? 'python';

      if (!user) {
        const nowIso = new Date().toISOString();
        const nextRecord: ProblemProgress = {
          userId: 'guest',
          problemId,
          status: nextStatus,
          preferredLanguage: nextLang,
          codeJava: sanitizeCode(updates.codeJava ?? existing?.codeJava),
          codeCpp: sanitizeCode(updates.codeCpp ?? existing?.codeCpp),
          codePython: sanitizeCode(updates.codePython ?? existing?.codePython),
          notes: sanitizeNotes(updates.notes ?? existing?.notes),
          recallAttempts: existing?.recallAttempts ?? 0,
          recallSuccessCount: existing?.recallSuccessCount ?? 0,
          lastRecallAccuracy: existing?.lastRecallAccuracy ?? 0,
          easeFactor: existing?.easeFactor ?? 2.5,
          intervalDays: existing?.intervalDays ?? 0,
          repetitions: existing?.repetitions ?? 0,
          lastPracticedAt: nowIso,
          createdAt: existing?.createdAt ?? nowIso,
          updatedAt: nowIso,
        };
        const updatedMap = { ...progressMap, [problemId]: nextRecord };
        setProgressMap(updatedMap);
        writeGuestProgress(updatedMap);
        return;
      }

      const docPath = `users/${user.uid}/progress/${problemId}`;
      const docRef = doc(db, 'users', user.uid, 'progress', problemId);
      setSavingProblemId(problemId);

      try {
        const snap = await getDoc(docRef);
        if (!snap.exists()) {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          const payload = {
            userId: user.uid,
            problemId,
            status: nextStatus,
            preferredLanguage: nextLang,
            codeJava: sanitizeCode(updates.codeJava),
            codeCpp: sanitizeCode(updates.codeCpp),
            codePython: sanitizeCode(updates.codePython),
            notes: sanitizeNotes(updates.notes),
            recallAttempts: 0,
            recallSuccessCount: 0,
            lastRecallAccuracy: 0,
            easeFactor: 2.5,
            intervalDays: 0,
            repetitions: 0,
            nextReviewAt: Timestamp.fromDate(tomorrow),
            lastPracticedAt: serverTimestamp(),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };
          await setDoc(docRef, payload);
        } else {
          const updatePayload: Record<string, unknown> = {
            status: nextStatus,
            preferredLanguage: nextLang,
            lastPracticedAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };
          if (updates.codeJava !== undefined) {
            updatePayload.codeJava = sanitizeCode(updates.codeJava);
          }
          if (updates.codeCpp !== undefined) {
            updatePayload.codeCpp = sanitizeCode(updates.codeCpp);
          }
          if (updates.codePython !== undefined) {
            updatePayload.codePython = sanitizeCode(updates.codePython);
          }
          if (updates.notes !== undefined) {
            updatePayload.notes = sanitizeNotes(updates.notes);
          }
          await updateDoc(docRef, updatePayload);
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, docPath);
      } finally {
        setSavingProblemId(null);
      }
    },
    [progressMap, user],
  );

  return {
    progressMap,
    loading,
    savingProblemId,
    savePracticeState,
    isAuthenticated: Boolean(user),
  };
}
