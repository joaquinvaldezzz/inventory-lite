import { IonApp, IonRouterOutlet, setupIonicReact } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Redirect, Route } from "react-router-dom";

import { Toaster } from "@/components/ui/toaster";
import ProtectedRoute from "@/components/protected-route";

import Tabs from "./pages/app/tabs";
import BranchSelector from "./pages/branch-selector";
import Login from "./pages/login";
import PIN from "./pages/pin";
import ConfirmPIN from "./pages/pin/confirm-pin";
import CreatePIN from "./pages/pin/create-pin";
import ResetPassword from "./pages/reset-password";
import ResetPasswordPassword from "./pages/reset-password/password";
import ResetPasswordUsername from "./pages/reset-password/username";
import SignUp from "./pages/sign-up";

import "./styles/main.css";

setupIonicReact();

const queryClient = new QueryClient();

/**
 * The main application component that sets up the routing and context providers.
 *
 * @returns The rendered component.
 */
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <IonApp>
        <IonReactRouter>
          <IonRouterOutlet>
            <Route path="/login" exact>
              <Login />
            </Route>

            <Route path="/sign-up" exact>
              <SignUp />
            </Route>

            <Route path="/reset-password" exact>
              <ResetPassword />
            </Route>

            <Route path="/reset-password/username" exact>
              <ResetPasswordUsername />
            </Route>

            <Route path="/reset-password/password" exact>
              <ResetPasswordPassword />
            </Route>

            <ProtectedRoute component={CreatePIN} path="/create-pin" exact />
            <ProtectedRoute component={ConfirmPIN} path="/confirm-pin" exact />
            <ProtectedRoute component={PIN} path="/pin" exact />
            <ProtectedRoute component={BranchSelector} path="/branch-selector" exact />
            <ProtectedRoute component={Tabs} path="/app/*" />

            <Route path="/" exact>
              <Redirect to="/login" />
            </Route>
          </IonRouterOutlet>
        </IonReactRouter>
        <Toaster />
      </IonApp>
    </QueryClientProvider>
  );
}
