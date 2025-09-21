import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useAppStore } from "./store";
import Home from "./pages/home/page";
import Login from "./pages/auth/login";
import SignUp from "./pages/auth/sign-up";
import Verification from "./pages/auth/verification";
import { Leaf } from "lucide-react";
import Search from "./pages/search/page";
import Profile from "./pages/profile/page";
import Notifications from "./pages/notifications/page";
import Post from "./pages/post/page";
import NotFoundPage from "./pages/page-not-found/page";
import Chat from "./pages/chat/page";

const LoadingScreen = () => (
  <div className="fixed inset-0 z-50 w-full h-screen flex items-center justify-center bg-background backdrop-blur-sm">
    <div className="flex flex-col items-center gap-4 p-6 rounded-2xl shadow-xl bg-white/80 dark:bg-zinc-900/80">
      <div className="flex flex-col items-center justify-center gap-2">
        <Leaf className="h-10 w-10 text-primary animate-pulse" />
      </div>
      <p className="text-base font-medium text-muted-foreground animate-pulse">
        Initializing secure session...
      </p>
    </div>
  </div>
);

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { userInfo, loading } = useAppStore();

  if (loading) {
    return <LoadingScreen />;
  }
  if (!userInfo) return <Navigate to="/auth/login" replace />;

  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { userInfo, loading } = useAppStore();
  const lastroute = sessionStorage.getItem("lastRoute");

  if (loading) return <LoadingScreen />;
  return userInfo ? (
    <Navigate to={lastroute || "/"} replace />
  ) : (
    <>{children}</>
  );
};

const App = () => {
  const { getUserInfo, getNotifications, userInfo } = useAppStore();
  const { pathname } = useLocation();

  useEffect(() => {
    if (!pathname.startsWith("/auth") && !userInfo) {
      sessionStorage.setItem("lastRoute", pathname);
    }
  }, []);

  useEffect(() => {
    getUserInfo();
    getNotifications();
  }, []);

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile/:username"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/post/:id"
          element={
            <PrivateRoute>
              <Post />
            </PrivateRoute>
          }
        />
        <Route
          path="/search"
          element={
            <PrivateRoute>
              <Search />
            </PrivateRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <PrivateRoute>
              <Notifications />
            </PrivateRoute>
          }
        />
        <Route
          path="/direct"
          element={
            <PrivateRoute>
              <Chat />
            </PrivateRoute>
          }
        />

        <Route path="/auth">
          <Route
            path="login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="sign-up"
            element={
              <PublicRoute>
                <SignUp />
              </PublicRoute>
            }
          />
          <Route
            path="verification"
            element={
              <PublicRoute>
                <Verification />
              </PublicRoute>
            }
          />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
};

export default App;
