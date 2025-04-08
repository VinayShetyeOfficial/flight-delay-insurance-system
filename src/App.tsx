import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";
import Auth from "./pages/Auth";
import Chat from "./pages/Chat";
import NotFound from "./pages/NotFound";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ChatProvider } from "./contexts/ChatContext";
import { SettingsProvider } from "./contexts/SettingsContext";

// Protected route component that doesn't use useAuth directly
function ProtectedRoute({ children }: { children: JSX.Element }) {
  return <AuthConsumer>{children}</AuthConsumer>;
}

// Consumer component that uses useAuth inside Router context
function AuthConsumer({ children }: { children: JSX.Element }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin w-10 h-10 border-4 border-chat-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/auth" replace />;
}

function App() {
  return (
    <SettingsProvider>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/chat" replace />} />
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <ChatProvider>
                    <Chat />
                  </ChatProvider>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </Router>
    </SettingsProvider>
  );
}

export default App;
