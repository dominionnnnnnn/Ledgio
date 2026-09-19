/**
 * Offline, a Firestore write only resolves once the phone reconnects, so the UI shouldn't wait
 * for it: the change is already in the local cache. Online, wait so rule errors can be shown.
 */
export function settle(done, onError = () => {}) {
  if (!navigator.onLine) {
    done.catch(() => {});
    return Promise.resolve();
  }
  return done.catch((e) => {
    onError(e);
    throw e;
  });
}
