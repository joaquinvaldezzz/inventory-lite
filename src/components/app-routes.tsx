import { IonRouterOutlet } from "@ionic/react";
import { Redirect, Route } from "react-router-dom";

import { PrivateRoute, PublicRoute } from "@/components/route-guards";
import Tabs from "@/pages/app/tabs";
import BranchSelector from "@/pages/branch-selector";
import Login from "@/pages/login";
import EnterPIN from "@/pages/pin";
import ConfirmPIN from "@/pages/pin/confirm-pin";
import CreatePIN from "@/pages/pin/create-pin";
import ResetPassword from "@/pages/reset-password";

/**
 * AppRoutes component defines and renders all application routes.
 *
 * This component:
 *
 * - Configures the main routing structure for the application
 * - Integrates route guards for public and private routes
 * - Maps each route to its corresponding page component
 * - Handles redirects and fallback routes as needed
 *
 * The component ensures that navigation and access control are consistently applied throughout the
 * app, and can be extended to support additional routes or guards.
 *
 * @returns JSX element representing the application's route configuration
 */
export function AppRoutes() {
  return (
    <IonRouterOutlet>
      {/* Public routes */}
      <Route path="/login" exact>
        <PublicRoute>
          <Login />
        </PublicRoute>
      </Route>
      <Route path="/reset-password" exact>
        <PublicRoute>
          <ResetPassword />
        </PublicRoute>
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

      {/* Inner app routes */}
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
  );
}
