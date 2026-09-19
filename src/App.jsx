import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { EntryRedirect, GuestOnly, RequireBusiness, SetupOnly } from './routes/guards';
import OfflineBanner from './components/OfflineBanner';
import Landing from './pages/Landing';
import Onboarding from './pages/Onboarding';
import Signup from './pages/auth/Signup';
import Login from './pages/auth/Login';
import Forgot from './pages/auth/Forgot';
import Reset from './pages/auth/Reset';
import BusinessSetup from './pages/setup/BusinessSetup';
import RecordFields from './pages/setup/RecordFields';
import { ToastProvider } from './components/Toast';
import AppLayout from './components/app/AppLayout';
import Home from './pages/app/Home';
import Records from './pages/app/Records';
import RecordForm from './pages/app/RecordForm';
import RecordDetail from './pages/app/RecordDetail';
import WorkerForm from './pages/app/WorkerForm';
import WorkerDetail from './pages/app/WorkerDetail';
import Reports from './pages/app/Reports';
import Notifications from './pages/app/Notifications';
import Workers from './pages/app/Workers';
import Support from './pages/app/Support';
import Ticket from './pages/app/Ticket';
import BusinessProfile from './pages/app/BusinessProfile';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <OfflineBanner />
          <Routes>
            <Route path="/" element={<EntryRedirect landing={<Landing />} />} />

            {/* Signed-out only */}
            <Route element={<GuestOnly />}>
              <Route path="/welcome" element={<Onboarding />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot" element={<Forgot />} />
            </Route>
            {/* Password reset link from email: works signed in or out */}
            <Route path="/reset" element={<Reset />} />

            {/* Setup */}
            <Route element={<SetupOnly step="business" />}>
              <Route path="/setup" element={<BusinessSetup />} />
            </Route>
            <Route element={<SetupOnly step="fields" />}>
              <Route path="/setup/fields" element={<RecordFields />} />
            </Route>

            {/* The app */}
            <Route element={<RequireBusiness />}>
              <Route element={<AppLayout />}>
                <Route path="/app" element={<Home />} />
                <Route path="/app/records" element={<Records />} />
                <Route path="/app/records/new" element={<RecordForm />} />
                <Route path="/app/records/:id" element={<RecordDetail />} />
                <Route path="/app/records/:id/edit" element={<RecordForm />} />
                <Route path="/app/workers" element={<Workers />} />
                <Route path="/app/workers/new" element={<WorkerForm />} />
                <Route path="/app/workers/:id" element={<WorkerDetail />} />
                <Route path="/app/workers/:id/edit" element={<WorkerForm />} />
                <Route path="/app/reports" element={<Reports />} />
                <Route path="/app/notifications" element={<Notifications />} />
                <Route path="/app/support" element={<Support />} />
                <Route path="/app/support/:id" element={<Ticket />} />
                <Route path="/app/fields" element={<RecordFields />} />
                <Route path="/app/business" element={<BusinessProfile />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
