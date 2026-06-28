import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Library from './pages/Library';
import Explore from './pages/Explore';
import AdminDashboard from './pages/AdminDashboard';
import Reader from './pages/ReaderPage';

// Protected Route Wrapper
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

// Admin Route Wrapper
function AdminRoute({ children }) {
  const { user, loading, isAdmin } = useAuth();
  
  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!user || !isAdmin) return <Navigate to="/" replace />;
  
  return children;
}

// Layout wrapper to conditionally show Navbar
function Layout({ children, hideNavbar = false }) {
  return (
    <div className="min-h-screen flex flex-col">
      {!hideNavbar && <Navbar />}
      <main className="w-full flex-1">
        {children}
      </main>
    </div>
  );
}

function AppContent() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/explore" element={<Layout><Explore /></Layout>} />
        <Route path="/login" element={<Layout><Login /></Layout>} />
        <Route path="/register" element={<Layout><Register /></Layout>} />
        <Route 
          path="/library" 
          element={
            <ProtectedRoute>
              <Layout>
                <Library />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/reader/:id" 
          element={
            <ProtectedRoute>
              {/* Hide main navbar in reader mode for immersion */}
              <Layout hideNavbar>
                <Reader />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin" 
          element={
            <AdminRoute>
              <Layout>
                <AdminDashboard />
              </Layout>
            </AdminRoute>
          } 
        />
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
