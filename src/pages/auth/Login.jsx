import { useState } from 'react';
import { Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { authMessage, isEmail } from '../../lib/authErrors';
import { PasswordInput, TextInput } from '../../components/Field';
import AuthLayout from './AuthLayout';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    const next = {};
    if (!isEmail(email)) next.email = 'Type a valid email address.';
    if (!password) next.password = 'Type your password.';
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      // The route guard takes the user to the app (or unfinished setup).
    } catch (err) {
      setErrors({ form: authMessage(err) });
      setBusy(false);
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      body="Log in to see how the business is doing today."
      cta="Log in"
      onSubmit={submit}
      busy={busy}
      formError={errors.form}
      afterFields={
        <Link
          to="/forgot"
          state={{ email }}
          className="mt-2.5 self-start rounded-full px-1 py-2 text-sm font-semibold text-accent-700 no-underline hover:underline"
        >
          Forgot password?
        </Link>
      }
      alt={
        <Link
          to="/signup"
          className="self-center rounded-full px-4 py-2 text-sm font-semibold text-accent-700 no-underline hover:bg-tint-soft"
        >
          I don't have an account yet
        </Link>
      }
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
      <PasswordInput
        autoComplete="current-password"
        placeholder="Your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
      />
    </AuthLayout>
  );
}
