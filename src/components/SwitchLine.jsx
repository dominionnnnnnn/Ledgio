import { Link } from 'react-router-dom';

/** "Don't have an account yet? Sign up" line under the auth forms. */
export default function SwitchLine({ text, to, label }) {
  return (
    <p className="m-0 self-center text-sm lg:self-start">
      <span className="opacity-60">{text}</span>{' '}
      <Link to={to} className="font-semibold text-accent-700 underline-offset-4 hover:underline">
        {label}
      </Link>
    </p>
  );
}
