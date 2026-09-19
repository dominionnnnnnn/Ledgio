/** Turn Firebase Auth error codes into plain sentences. */
export function authMessage(err) {
  switch (err?.code) {
    case 'auth/invalid-email':
      return 'That email address doesn’t look right.';
    case 'auth/missing-password':
      return 'Type your password.';
    case 'auth/weak-password':
      return 'Use at least 6 characters.';
    case 'auth/email-already-in-use':
      return 'There is already an account with this email. Log in instead.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Email or password is not correct.';
    case 'auth/too-many-requests':
      return 'Too many tries. Wait a few minutes and try again.';
    case 'auth/network-request-failed':
      return 'No connection. Check your network and try again.';
    case 'auth/expired-action-code':
      return 'This reset link has expired. Ask for a new one.';
    case 'auth/invalid-action-code':
      return 'This reset link has already been used or is not valid. Ask for a new one.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
