import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { MailCheck } from 'lucide-react';
import { auth } from '../../lib/firebase';
import { authMessage, isEmail } from '../../lib/authErrors';
import { TextInput } from '../../components/Field';
import AuthLayout from './AuthLayout';

const backLink = (
  <Link
    to="/login"
    className="self-center rounded-full px-4 py-2 text-sm font-semibold text-accent-700 no-underline hover:bg-tint-soft"
  >
    Back to log in
  </Link>
);

export default function Forgot() {
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email ?? '');
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!isEmail(email)) return setErrors({ email: 'Type a valid email address.' });
    setErrors({});
    setBusy(true);
    try {
      await sendPasswordResetEmail(auth, email.trim(), { url: `${window.location.origin}/login` });
      setSent(true);
    } catch (err) {
      // Don't reveal whether an account exists; only surface real problems.
      if (err?.code === 'auth/user-not-found') setSent(true);
      else setErrors({ form: authMessage(err) });
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <AuthLayout
        title="Check your email"
        body={`If there is an account for ${email.trim()}, a reset link is on its way. It can take a minute — check spam too.`}
        alt={backLink}
      >
        <div className="grid size-16 place-items-center rounded-full bg-ok-soft text-ok">
          <MailCheck size={28} strokeWidth={1.5} />
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot your password?"
      body="Type your email and we will send you a reset link."
      cta="Send reset link"
      onSubmit={submit}
      busy={busy}
      formError={errors.form}
      alt={backLink}
    >
      <TextInput
        label="Email address"
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder="you@business.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
      />
    </AuthLayout>
  );
}
