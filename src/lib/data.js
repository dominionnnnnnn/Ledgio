import { useEffect, useState } from 'react';
import {
  collection,
  doc,
  getDoc,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import { monthOf } from './dates';

// ---------- paths ----------
const bizDoc = (bizId) => doc(db, 'businesses', bizId);
const workersCol = (bizId) => collection(db, 'businesses', bizId, 'workers');
const recordsCol = (bizId) => collection(db, 'businesses', bizId, 'records');
const usageDoc = (bizId, month) => doc(db, 'businesses', bizId, 'usage', month);

// ---------- live hooks ----------
/** Subscribe to a query or doc; returns { data, loading, error }. Pass null to skip. */
function useLive(ref, deps) {
  const [state, setState] = useState({ data: undefined, loading: true, error: null });
  useEffect(() => {
    if (!ref) {
      setState({ data: undefined, loading: false, error: null });
      return;
    }
    setState((s) => ({ ...s, loading: true }));
    return onSnapshot(
      ref,
      (snap) => {
        const data =
          'docs' in snap
            ? snap.docs.map((d) => ({ id: d.id, ...d.data() }))
            : snap.exists()
              ? { id: snap.id, ...snap.data() }
              : null;
        setState({ data, loading: false, error: null });
      },
      (error) => setState({ data: undefined, loading: false, error }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return state;
}

const byCreated = (a, b) => (a.createdAt?.seconds ?? Infinity) - (b.createdAt?.seconds ?? Infinity);
const byDateDesc = (a, b) =>
  b.date.localeCompare(a.date) || (b.createdAt?.seconds ?? Infinity) - (a.createdAt?.seconds ?? Infinity);

export function useWorkers(bizId) {
  const s = useLive(bizId ? workersCol(bizId) : null, [bizId]);
  return { ...s, data: s.data ? [...s.data].sort(byCreated) : s.data };
}

export function useWorker(bizId, id) {
  return useLive(bizId && id ? doc(workersCol(bizId), id) : null, [bizId, id]);
}

/** Records dated on or after `fromDate` (YYYY-MM-DD). */
export function useRecordsSince(bizId, fromDate) {
  const s = useLive(bizId ? query(recordsCol(bizId), where('date', '>=', fromDate)) : null, [bizId, fromDate]);
  return { ...s, data: s.data ? [...s.data].sort(byDateDesc) : s.data };
}

export function useMonthRecords(bizId, month) {
  const s = useLive(bizId ? query(recordsCol(bizId), where('month', '==', month)) : null, [bizId, month]);
  return { ...s, data: s.data ? [...s.data].sort(byDateDesc) : s.data };
}

export function useRecord(bizId, id) {
  return useLive(bizId && id ? doc(recordsCol(bizId), id) : null, [bizId, id]);
}

/** { count } of records created for a month (the plan limit counter). */
export function useUsage(bizId, month) {
  const s = useLive(bizId ? usageDoc(bizId, month) : null, [bizId, month]);
  return { ...s, count: s.data?.count ?? 0 };
}

// ---------- writes ----------
// Writes are not awaited by callers when offline: Firestore queues them and the UI
// updates from the local cache straight away. `commit()` resolves once the server accepts.

export function addWorker(bizId, worker) {
  const ref = doc(workersCol(bizId));
  const batch = writeBatch(db);
  batch.set(ref, { ...worker, active: true, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  // The rules only accept a new worker together with this counter bump (enforces the plan limit).
  batch.update(bizDoc(bizId), { workerCount: increment(1), lastWorkerId: ref.id, updatedAt: serverTimestamp() });
  return { id: ref.id, done: batch.commit() };
}

export function updateWorker(bizId, id, changes) {
  const batch = writeBatch(db);
  batch.update(doc(workersCol(bizId), id), { ...changes, updatedAt: serverTimestamp() });
  return { id, done: batch.commit() };
}

export function deleteWorker(bizId, id) {
  const batch = writeBatch(db);
  batch.delete(doc(workersCol(bizId), id));
  batch.update(bizDoc(bizId), { workerCount: increment(-1), lastWorkerId: id, updatedAt: serverTimestamp() });
  return { id, done: batch.commit() };
}

/**
 * Create a record. Goes out with the month's usage counter in one batch; the rules
 * refuse the batch once the monthly limit is reached.
 */
export function addRecord(bizId, uid, record) {
  const ref = doc(recordsCol(bizId));
  const month = monthOf(record.date);
  const batch = writeBatch(db);
  batch.set(ref, {
    ...record,
    month,
    createdBy: uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  batch.set(usageDoc(bizId, month), { count: increment(1), lastRecordId: ref.id }, { merge: true });
  return { id: ref.id, done: batch.commit() };
}

export function updateRecord(bizId, id, record) {
  const batch = writeBatch(db);
  batch.update(doc(recordsCol(bizId), id), { ...record, updatedAt: serverTimestamp() });
  return { id, done: batch.commit() };
}

export function deleteRecord(bizId, id) {
  const batch = writeBatch(db);
  batch.delete(doc(recordsCol(bizId), id));
  return { id, done: batch.commit() };
}

// ---------- notifications ----------
const notifsCol = (bizId) => collection(db, 'businesses', bizId, 'notifications');

/** Latest 50 notifications, newest first. */
export function useNotifications(bizId) {
  return useLive(bizId ? query(notifsCol(bizId), orderBy('createdAt', 'desc'), limit(50)) : null, [bizId]);
}

/**
 * Create a notification once. `key` is a stable id (e.g. "norec-2026-09-17"), so running
 * the check again — or in another tab — never makes a duplicate.
 */
export async function notifyOnce(bizId, key, data) {
  const ref = doc(notifsCol(bizId), key);
  try {
    const snap = await getDoc(ref);
    if (snap.exists()) return;
    await setDoc(ref, { ...data, unread: true, createdAt: serverTimestamp() });
  } catch {
    /* offline or a race with another tab — try again next time */
  }
}

export function markRead(bizId, id) {
  return updateDoc(doc(notifsCol(bizId), id), { unread: false }).catch(() => {});
}

export function markAllRead(bizId, ids) {
  if (!ids.length) return Promise.resolve();
  const batch = writeBatch(db);
  for (const id of ids) batch.update(doc(notifsCol(bizId), id), { unread: false });
  return batch.commit().catch(() => {});
}

// ---------- support tickets ----------
const ticketsCol = (bizId) => collection(db, 'businesses', bizId, 'tickets');
const messagesCol = (bizId, tid) => collection(db, 'businesses', bizId, 'tickets', tid, 'messages');

export function useTickets(bizId) {
  return useLive(bizId ? query(ticketsCol(bizId), orderBy('updatedAt', 'desc')) : null, [bizId]);
}

export function useTicket(bizId, id) {
  return useLive(bizId && id ? doc(ticketsCol(bizId), id) : null, [bizId, id]);
}

export function useTicketMessages(bizId, id) {
  return useLive(bizId && id ? query(messagesCol(bizId, id), orderBy('createdAt', 'asc')) : null, [bizId, id]);
}

/** Open a ticket with its first message, in one batch. */
export function createTicket(bizId, uid, { category, subject, message, screenshotUrl }) {
  const ref = doc(ticketsCol(bizId));
  const batch = writeBatch(db);
  batch.set(ref, {
    ref: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
    category,
    subject,
    status: 'open',
    screenshotUrl: screenshotUrl ?? null,
    createdBy: uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  batch.set(doc(messagesCol(bizId, ref.id)), { from: 'user', text: message, createdAt: serverTimestamp() });
  return { id: ref.id, done: batch.commit() };
}

/** Add a reply from the user; re-opens the ticket so support sees it. */
export function replyToTicket(bizId, id, text) {
  const batch = writeBatch(db);
  batch.set(doc(messagesCol(bizId, id)), { from: 'user', text, createdAt: serverTimestamp() });
  batch.update(doc(ticketsCol(bizId), id), { status: 'open', updatedAt: serverTimestamp() });
  return { id, done: batch.commit() };
}

export function setTicketStatus(bizId, id, status) {
  const batch = writeBatch(db);
  batch.update(doc(ticketsCol(bizId), id), { status, updatedAt: serverTimestamp() });
  return { id, done: batch.commit() };
}

// ---------- business profile ----------
export function updateBusiness(bizId, changes) {
  const batch = writeBatch(db);
  batch.update(bizDoc(bizId), { ...changes, updatedAt: serverTimestamp() });
  return { id: bizId, done: batch.commit() };
}