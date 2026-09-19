import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  browserLocalPersistence,
  browserSessionPersistence,
  setPersistence,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { Check, Lock, Mail } from 'lucide-react';
import { auth } from '../../lib/firebase';
import { authMessage, isEmail } from '../../lib/authErrors';
import { PasswordInput, TextInput } from '../../components/Field';
import AuthLayout, { PANELS } from './AuthLayout';
import SwitchLine from '../../components/SwitchLine';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  // Desktop only: on a shared computer, don't stay logged in after the browser closes.
  const [remember, setRemember] = useState(true);

  async function submit(e) {
    e.preventDefault();
    const next = {};
    if (!isEmail(email)) next.email = 'Type a valid email address.';
    if (!password) next.password = 'Type your password.';
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    try {
      await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
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
      panel={PANELS.login}
      side="right"
      afterFields={
        <div className="mt-2.5 flex items-center gap-3 lg:mt-4">
          <label className="hidden cursor-pointer items-center gap-2.5 text-sm lg:flex">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="peer sr-only"
            />
            <span className="grid size-5 place-items-center rounded-md border border-divider bg-card text-on-accent peer-checked:border-accent peer-checked:bg-accent peer-focus-visible:outline-2 peer-focus-visible:outline-accent">
              {remember && <Check size={13} strokeWidth={2.4} />}
            </span>
            <span className="opacity-75">Remember me on this computer</span>
          </label>
          <Link
            to="/forgot"
            state={{ email }}
            className="rounded-full px-1 py-2 text-sm font-semibold text-accent-700 no-underline hover:underline lg:ml-auto"
          >
            Forgot password?
          </Link>
        </div>
      }
      alt={<SwitchLine text="Don’t have an account yet?" to="/signup" label="Sign up" />}
    >
      <TextInput
        label="Email address"
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder="you@business.com"
        icon={Mail}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
      />
      <PasswordInput
        autoComplete="current-password"
        placeholder="Your password"
        icon={Lock}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
      />
    </AuthLayout>
  );
}