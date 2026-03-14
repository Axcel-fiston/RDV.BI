import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Layout from './Layout';

// Page imports
import Home from './pages/Home';
import Institutions from './pages/Institutions';
import PublicBooking from './pages/PublicBooking';
import MyAppointments from './pages/MyAppointments';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';
import Appointments from './pages/Appointments';
import QueueManagement from './pages/QueueManagement';
import Analytics from './pages/Analytics';
import Schedule from './pages/Schedule';
import Services from './pages/Services';
import AdminSettings from './pages/AdminSettings';
import QueueMonitor from './pages/QueueMonitor';
import AppointmentAction from './pages/AppointmentAction';
import JoinPlatform from './pages/JoinPlatform';
import InstitutionApplications from './pages/InstitutionApplications';
import OnboardingWizard from './pages/OnboardingWizard';
import Docs from './pages/Docs';

const LayoutWrapper = ({ children }) => <Layout>{children}</Layout>;

const LoadingScreen = () => (
  <div className="fixed inset-0 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
  </div>
);

const RequireAuth = ({ children }) => {
  const location = useLocation();
  const { user, isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/AdminLogin" replace state={{ from: location.pathname }} />;
  }

  return children;
};

const RequireRole = ({ roles, children }) => {
  const user = useAuth().user;

  if (!user) {
    return children;
  }

  if (!roles.includes(user.role)) {
    const fallback = user.role === 'PLATFORM_ADMIN' ? '/InstitutionApplications' : '/Dashboard';
    return <Navigate to={fallback} replace />;
  }

  return children;
};

const PUBLIC_PATHS = new Set([
  '/',
  '/Home',
  '/Institutions',
  '/PublicBooking',
  '/MyAppointments',
  '/AdminLogin',
  '/JoinPlatform',
  '/InstitutionRegister',
  '/Docs',
]);

const AuthenticatedApp = () => {
  const location = useLocation();
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
  const isPublicRoute =
    PUBLIC_PATHS.has(location.pathname) ||
    location.pathname.startsWith('/institutions/');

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return <LoadingScreen />;
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required' && !isPublicRoute) {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/Home" replace />} />
      <Route path="/Home" element={<LayoutWrapper><Home /></LayoutWrapper>} />
      <Route path="/Institutions" element={<LayoutWrapper><Institutions /></LayoutWrapper>} />
      <Route path="/PublicBooking" element={<LayoutWrapper><PublicBooking /></LayoutWrapper>} />
      <Route path="/institutions/:slug" element={<LayoutWrapper><PublicBooking /></LayoutWrapper>} />
      <Route path="/MyAppointments" element={<LayoutWrapper><MyAppointments /></LayoutWrapper>} />
      <Route path="/AdminLogin" element={<LayoutWrapper><AdminLogin /></LayoutWrapper>} />
      <Route path="/Dashboard" element={<RequireAuth><RequireRole roles={['ADMIN','STAFF']}><LayoutWrapper><Dashboard /></LayoutWrapper></RequireRole></RequireAuth>} />
      <Route path="/Appointments" element={<RequireAuth><RequireRole roles={['ADMIN','STAFF']}><LayoutWrapper><Appointments /></LayoutWrapper></RequireRole></RequireAuth>} />
      <Route path="/QueueManagement" element={<RequireAuth><RequireRole roles={['ADMIN','STAFF']}><LayoutWrapper><QueueManagement /></LayoutWrapper></RequireRole></RequireAuth>} />
      <Route path="/Analytics" element={<RequireAuth><RequireRole roles={['ADMIN']}><LayoutWrapper><Analytics /></LayoutWrapper></RequireRole></RequireAuth>} />
      <Route path="/Schedule" element={<RequireAuth><RequireRole roles={['ADMIN','STAFF']}><LayoutWrapper><Schedule /></LayoutWrapper></RequireRole></RequireAuth>} />
      <Route path="/Services" element={<RequireAuth><RequireRole roles={['ADMIN','STAFF']}><LayoutWrapper><Services /></LayoutWrapper></RequireRole></RequireAuth>} />
      <Route path="/AdminSettings" element={<RequireAuth><RequireRole roles={['ADMIN']}><LayoutWrapper><AdminSettings /></LayoutWrapper></RequireRole></RequireAuth>} />
      <Route path="/QueueMonitor" element={<LayoutWrapper><QueueMonitor /></LayoutWrapper>} />
      <Route path="/AppointmentAction" element={<LayoutWrapper><AppointmentAction /></LayoutWrapper>} />
      <Route path="/JoinPlatform" element={<LayoutWrapper><JoinPlatform /></LayoutWrapper>} />
      <Route path="/InstitutionRegister" element={<LayoutWrapper><JoinPlatform /></LayoutWrapper>} />
      <Route path="/Docs" element={<Docs />} />
      <Route path="/InstitutionApplications" element={<RequireAuth><RequireRole roles={['PLATFORM_ADMIN']}><LayoutWrapper><InstitutionApplications /></LayoutWrapper></RequireRole></RequireAuth>} />
      <Route path="/OnboardingWizard" element={<RequireAuth><RequireRole roles={['ADMIN']}><LayoutWrapper><OnboardingWizard /></LayoutWrapper></RequireRole></RequireAuth>} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
