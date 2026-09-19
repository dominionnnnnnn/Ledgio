import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { hasSeenOnboarding, isStandalone } from '../lib/platform';
import LoadingScreen from '../components/LoadingScreen';
import ErrorScreen from '../components/ErrorScreen';

/** Where a signed-in user belongs, based on how far through setup they are. */
export function homeFor({ business }) {
  if (!business) return '/setup';
  if (!business.fields?.length) return '/setup/fields';
  return '/app';
}

/**
 * "/" — decides the first screen:
 *   signed in          → app (or the setup step they stopped at)
 *   installed app      → onboarding the first time, then log in
 *   browser            → landing page
 */
export function EntryRedirect({ landing }) {
  const auth = useAuth();
  if (auth.error) return <ErrorScreen />;
  if (!auth.ready) return <LoadingScreen />;
  if (auth.user) return <Navigate to={homeFor(auth)} replace />;
  if (isStandalone()) return <Navigate to={hasSeenOnboarding() ? '/login' : '/welcome'} replace />;
  return landing;
}

/** Log in, sign up, onboarding: signed-in users skip past them. */
export function GuestOnly() {
  const auth = useAuth();
  if (!auth.ready) return <LoadingScreen />;
  if (auth.user) return <Navigate to={homeFor(auth)} replace />;
  return <Outlet />;
}

/**
 * Business setup.
 *   step "business" — only until the business exists
 *   step "fields"   — needs a business; also reachable later from inside the app
 */
export function SetupOnly({ step }) {
  const auth = useAuth();
  const location = useLocation();
  if (auth.error) return <ErrorScreen />;
  if (!auth.ready) return <LoadingScreen />;
  if (!auth.user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (step === 'business' && auth.business) return <Navigate to={homeFor(auth)} replace />;
  if (step === 'fields' && !auth.business) return <Navigate to="/setup" replace />;
  return <Outlet />;
}

/** The app itself: signed in with a finished setup. */
export function RequireBusiness() {
  const auth = useAuth();
  const location = useLocation();
  if (auth.error) return <ErrorScreen />;
  if (!auth.ready) return <LoadingScreen />;
  if (!auth.user) return <Navigate to="/login" replace state={{ from: location }} />;
  const target = homeFor(auth);
  if (target !== '/app') return <Navigate to={target} replace />;
  return <Outlet />;
}
