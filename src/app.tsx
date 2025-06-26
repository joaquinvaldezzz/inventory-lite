import type { ReactNode } from "react";
import { IonApp, IonRouterOutlet, setupIonicReact } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Redirect, Route } from "react-router-dom";

import { AuthProvider } from "@/lib/auth";
import { useAuth } from "@/hooks/use-auth";
import { ThemeProvider } from "@/components/theme-toggle";
import Tabs from "@/pages/app/tabs";
import BranchSelector from "@/pages/branch-selector";
import Login from "@/pages/login";
import EnterPIN from "@/pages/pin";
import ConfirmPIN from "@/pages/pin/confirm-pin";
import CreatePIN from "@/pages/pin/create-pin";
import ResetPassword from "@/pages/reset-password";

import "@/styles/main.css";

setupIonicReact({
  toastDuration: 3000,
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: 1000,
      staleTime: 1000 * 60 * 5,
    },
  },
});

/**
 * A component that redirects to the app if the user is authenticated.
 *
 * @param props The component props.
 * @param props.children The child components to render.
 * @returns The child components if the user is not authenticated, otherwise a redirect to the app.
 */
function PublicRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isPinSet } = useAuth();

  if (isAuthenticated) {
    return isPinSet ? <Redirect to="/enter-pin" /> : <Redirect to="/create-pin" />;
  }

  return children;
}

/**
 * A component that redirects to the login page if the user is not authenticated.
 *
 * @param props The component props.
 * @param props.children The child components to render.
 * @returns The child components if the user is authenticated, otherwise a redirect to the login
 *   page.
 */
function PrivateRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Redirect to="/login" />;
}

/**
 * The main application component that sets up the routing and context providers.
 *
 * @returns The rendered application.
 */
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <IonApp>
          <IonReactRouter>
            <AuthProvider>
              <IonRouterOutlet>
                {/* Public routes */}
                <Route path="/login" exact>
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                </Route>

                <Route path="/reset-password" exact>
                  <ResetPassword />
                </Route>

                {/* PIN routes */}
                <Route path="/enter-pin" exact>
                  <PrivateRoute>
                    <EnterPIN />
                  </PrivateRoute>
                </Route>
                <Route path="/create-pin" exact>
                  <PrivateRoute>
                    <CreatePIN />
                  </PrivateRoute>
                </Route>
                <Route path="/confirm-pin" exact>
                  <PrivateRoute>
                    <ConfirmPIN />
                  </PrivateRoute>
                </Route>

                {/* Branch selector */}
                <Route path="/branch-selector" exact>
                  <PrivateRoute>
                    <BranchSelector />
                  </PrivateRoute>
                </Route>

                {/* App routes */}
                <Route path="/app/*">
                  <PrivateRoute>
                    <Tabs />
                  </PrivateRoute>
                </Route>

                {/* Default redirect */}
                <Route path="/" exact>
                  <Redirect to="/login" />
                </Route>
              </IonRouterOutlet>
            </AuthProvider>
          </IonReactRouter>
        </IonApp>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
