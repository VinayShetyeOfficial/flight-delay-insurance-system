import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";

// Form validation schemas
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});

const signupSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function Auth() {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();

  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  // Signup form state
  const [signupForm, setSignupForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  // Login form errors
  const [loginErrors, setLoginErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  // Signup form errors
  const [signupErrors, setSignupErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
  }>({});

  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErrors({});

    try {
      // Validate form
      loginSchema.parse(loginForm);

      setLoading(true);
      await login(loginForm.email, loginForm.password, loginForm.rememberMe);
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Handle validation errors
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setLoginErrors(newErrors);
      } else {
        // Error handling without toast
        console.error("Login failed:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupErrors({});

    try {
      // Validate form
      signupSchema.parse(signupForm);

      setLoading(true);
      await signup(signupForm.username, signupForm.email, signupForm.password);
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Handle validation errors
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setSignupErrors(newErrors);
      } else {
        // Error handling without toast
        console.error("Signup failed:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <Card className="w-full max-w-md mx-auto overflow-hidden shadow-xl border-0">
        <CardHeader className="space-y-2 p-6 pb-4 bg-gray-950/30">
          <CardTitle className="text-2xl font-bold text-center text-white">
            Echo Chat
          </CardTitle>
          <CardDescription className="text-center text-gray-300">
            Connect and collaborate in real-time
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-5 pb-8 bg-gray-950/20">
          <Tabs
            defaultValue="login"
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as "login" | "signup")}
            className="w-full"
          >
            <div className="auth-tabs-list">
              <div
                className={`auth-tab ${
                  activeTab === "login"
                    ? "auth-tab-active"
                    : "auth-tab-inactive"
                }`}
                onClick={() => setActiveTab("login")}
              >
                Login
              </div>
              <div
                className={`auth-tab ${
                  activeTab === "signup"
                    ? "auth-tab-active"
                    : "auth-tab-inactive"
                }`}
                onClick={() => setActiveTab("signup")}
              >
                Sign Up
              </div>
            </div>

            <TabsContent value="login" className="">
              <div className="bg-gray-900/70 p-4 rounded-lg">
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-left block text-sm font-medium text-gray-200"
                    >
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={loginForm.email}
                      onChange={(e) =>
                        setLoginForm({ ...loginForm, email: e.target.value })
                      }
                      placeholder="Enter your email address"
                      className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
                    />
                    {loginErrors.email && (
                      <p className="text-xs text-red-400 mt-1">
                        {loginErrors.email}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="text-left block text-sm font-medium text-gray-200"
                    >
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showLoginPassword ? "text" : "password"}
                        value={loginForm.password}
                        onChange={(e) =>
                          setLoginForm({
                            ...loginForm,
                            password: e.target.value,
                          })
                        }
                        className="bg-gray-800/50 border-gray-700 text-white pr-10"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-200"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                      >
                        {showLoginPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {loginErrors.password && (
                      <p className="text-xs text-red-400 mt-1">
                        {loginErrors.password}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember-me"
                      checked={loginForm.rememberMe}
                      onCheckedChange={(checked) =>
                        setLoginForm({
                          ...loginForm,
                          rememberMe: checked === true,
                        })
                      }
                      className="border-gray-600 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label
                      htmlFor="remember-me"
                      className="text-sm font-medium text-gray-300 cursor-pointer"
                    >
                      Remember me
                    </Label>
                  </div>
                  <Button
                    type="submit"
                    className="w-full mt-4 bg-primary hover:bg-primary/90 text-white py-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                        Logging in...
                      </span>
                    ) : (
                      "Login"
                    )}
                  </Button>
                </form>
              </div>
            </TabsContent>
            <TabsContent value="signup" className="pb-6">
              <div className="bg-gray-900/70 p-4 rounded-lg">
                <form onSubmit={handleSignupSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="username"
                      className="text-left block text-sm font-medium text-gray-200"
                    >
                      Username
                    </Label>
                    <Input
                      id="username"
                      type="text"
                      value={signupForm.username}
                      onChange={(e) =>
                        setSignupForm({
                          ...signupForm,
                          username: e.target.value,
                        })
                      }
                      placeholder="Choose a username"
                      className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
                    />
                    {signupErrors.username && (
                      <p className="text-xs text-red-400 mt-1">
                        {signupErrors.username}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="signup-email"
                      className="text-left block text-sm font-medium text-gray-200"
                    >
                      Email
                    </Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={signupForm.email}
                      onChange={(e) =>
                        setSignupForm({ ...signupForm, email: e.target.value })
                      }
                      placeholder="Enter your email address"
                      className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
                    />
                    {signupErrors.email && (
                      <p className="text-xs text-red-400 mt-1">
                        {signupErrors.email}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="signup-password"
                      className="text-left block text-sm font-medium text-gray-200"
                    >
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showSignupPassword ? "text" : "password"}
                        value={signupForm.password}
                        onChange={(e) =>
                          setSignupForm({
                            ...signupForm,
                            password: e.target.value,
                          })
                        }
                        className="bg-gray-800/50 border-gray-700 text-white pr-10"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-200"
                        onClick={() =>
                          setShowSignupPassword(!showSignupPassword)
                        }
                      >
                        {showSignupPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {signupErrors.password && (
                      <p className="text-xs text-red-400 mt-1">
                        {signupErrors.password}
                      </p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    className="w-full mt-4 bg-primary hover:bg-primary/90 text-white py-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                        Signing up...
                      </span>
                    ) : (
                      "Sign Up"
                    )}
                  </Button>
                </form>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-center p-6 pt-4 bg-gray-950/30 border-t border-gray-800">
          <div className="text-center text-sm text-gray-400">
            {activeTab === "login" ? (
              <div>
                Don't have an account?{" "}
                <Button
                  variant="link"
                  className="p-0 text-primary hover:text-primary/90"
                  onClick={() => setActiveTab("signup")}
                >
                  Sign up
                </Button>
              </div>
            ) : (
              <div>
                Already have an account?{" "}
                <Button
                  variant="link"
                  className="p-0 text-primary hover:text-primary/90"
                  onClick={() => setActiveTab("login")}
                >
                  Log in
                </Button>
              </div>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
