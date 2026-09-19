import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { authMessage } from '../../lib/authErrors';
import { PasswordInput } from '../../components/Field';
import { useToast } from '../../components/Toast';
import AuthLayout from './AuthLayout';

const backLink = (
  <Link
    to="/login"
    className="self-center rounded-full px-4 py-2 text-sm font-semibold text-accent-700 no-underline hover:bg-tint-soft"
  >
    Back to log in
  </Link>
);

/** Target of the password-reset email link: /reset?mode=resetPassword&oobCode=… */
export default function Reset() {
  const [params] = useSearchParams();
  const code = params.get('oobCode');
  const navigate = useNavigate();
  const toast = useToast();

  const [status, setStatus] = useState(code ? 'checking' : 'invalid');
  const [linkError, setLinkError] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!code) return;
    verifyPasswordResetCode(auth, code)
      .then(() => setStatus('ready'))
      .catch((err) => {
        setLinkError(authMessage(err));
        setStatus('invalid');
      });
  }, [code]);

  async function submit(e) {
    e.preventDefault();
    const next = {};
    if (password.length < 6) next.password = 'Use at least 6 characters.';
    else if (confirm !== password) next.confirm = 'The two passwords are not the same.';
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    try {
      await confirmPasswordReset(auth, code, password);
      toast('Password changed. Log in with your new password.');
      navigate('/login', { replace: true });
    } catch (err) {
      setErrors({ form: authMessage(err) });
      setBusy(false);
    }
  }

  if (status === 'invalid') {
    return (
      <AuthLayout
        title="This link doesn’t work"
        body={linkError || 'Open the reset link from your email, or ask for a new one.'}
        alt={
          <>
            <Link
              to="/forgot"
              className="lg-tap flex h-14 items-center justify-center rounded-full bg-accent font-heading text-[19px] font-semibold text-on-accent no-underline shadow-card"
            >
              Send a new link
            </Link>
            {backLink}
          </>
        }
      />
    );
  }

  return (
    <AuthLayout
      title="Set a new password"
      body="Choose something you will remember. At least 6 characters."
      cta={status === 'checking' ? null : 'Save new password'}
      onSubmit={submit}
      busy={busy}
      formError={errors.form}
      alt={backLink}
    >
      {status === 'ready' && (
        <>
          <PasswordInput
            label="New password"
            autoComplete="new-password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
          />
          <PasswordInput
            label="Repeat new password"
            autoComplete="new-password"
            placeholder="Repeat it"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            error={errors.confirm}
          />
        </>
      )}
    </AuthLayout>
  );
}
