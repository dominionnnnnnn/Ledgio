import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { authMessage, isEmail } from '../../lib/authErrors';
import { PasswordInput, TextInput } from '../../components/Field';
import AuthLayout, { PANELS } from './AuthLayout';
import SwitchLine from '../../components/SwitchLine';
import { Lock, Mail } from 'lucide-react';

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
      body="One account keeps your workers, your records and your profit in one place. Free for up to 3 workers."
      cta="Create account"
      onSubmit={submit}
      busy={busy}
      formError={errors.form}
      panel={PANELS.signup}
      side="left"
      alt={<SwitchLine text="Already keeping records with Ledgio?" to="/login" label="Log in" />}
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
        autoComplete="new-password"
        placeholder="At least 6 characters"
        icon={Lock}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
      />
    </AuthLayout>
  );
}