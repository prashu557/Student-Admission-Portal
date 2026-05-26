import ApplicationForm from "./pages/ApplicationForm";
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Application from './pages/Application';
import Documents from './pages/Documents';
import Payment from './pages/Payment';
import Notifications from './pages/Notifications';
import Education from './pages/Education';
import Department from './pages/Department';
import Support from "./pages/Support";
import Settings from "./pages/Settings";
import RaiseTicket from "./pages/RaiseTicket";
import Login from './pages/Login';
import Signup from "./pages/Signup";
// Layout wrapper for all pages
function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const { student } = useAuth();
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F8FAFC]">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden relative">
        <Navbar toggleSidebar={toggleSidebar} />
        
        <main
          className={`flex-1 overflow-x-hidden custom-scrollbar ${
            isDashboard ? 'overflow-hidden p-0' : 'overflow-y-auto p-4 sm:p-6 lg:p-8'
          }`}
        >
          <Outlet context={{ student }} />
        </main>
      </div>
    </div>
  );
}

// Protected Route Component
function ProtectedRoute({ children }) {
  const { student } = useAuth();
  
  if (!student) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/application" element={<Application />} />
            <Route path="/application-form" element={<ApplicationForm />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/education" element={<Education />} />
            <Route path="/department" element={<Department />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/payments" element={<Payment />} />
            <Route path="/support" element={<Support />} />
            <Route path="/raise-ticket" element={<RaiseTicket />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
