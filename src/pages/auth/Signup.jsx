import { useState } from 'react';
import { Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { authMessage, isEmail } from '../../lib/authErrors';
import { PasswordInput, TextInput } from '../../components/Field';
import AuthLayout from './AuthLayout';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    const next = {};
    if (!isEmail(email)) next.email = 'Type a valid email address.';
    if (password.length < 6) next.password = 'Use at least 6 characters.';
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        businessId: null,
        createdAt: serverTimestamp(),
      });
      // The route guard moves the user on to business setup.
    } catch (err) {
      setErrors({ form: authMessage(err) });
      setBusy(false);
    }
  }

  return (
    <AuthLayout
      title="Open your record book"
      body="One account keeps your workers, records and profit in one place."
      cta="Create account"
      onSubmit={submit}
      busy={busy}
      formError={errors.form}
      alt={
        <Link
          to="/login"
          className="self-center rounded-full px-4 py-2 text-sm font-semibold text-accent-700 no-underline hover:bg-tint-soft"
        >
          I already have an account
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
        autoComplete="new-password"
        placeholder="At least 6 characters"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
      />
    </AuthLayout>
  );
}
