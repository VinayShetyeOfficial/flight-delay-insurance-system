
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import Auth from "./Auth";
import Chat from "./Chat";

export default function Index() {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-pulse-slow mb-4">
            <div className="h-12 w-12 rounded-full bg-chat-primary mx-auto"></div>
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  return isAuthenticated ? <Chat /> : <Auth />;
}
