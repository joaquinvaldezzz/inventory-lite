import { useEffect } from "react";
import { IonApp, IonRouterOutlet, setupIonicReact } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Redirect, Route, useHistory } from "react-router-dom";

import { getSessionToken } from "@/lib/session";
import { Toaster } from "@/components/ui/toaster";

import Tabs from "./pages/app/tabs";
import BranchSelector from "./pages/branch-selector";
import Login from "./pages/login";
import PIN from "./pages/pin";
import ConfirmPIN from "./pages/pin/confirm-pin";
import CreatePIN from "./pages/pin/create-pin";

import "./styles/main.css";

setupIonicReact();

const queryClient = new QueryClient();

/**
 * The main application component that sets up the routing and context providers.
 *
 * @returns The rendered component.
 */
export default function App() {
  const history = useHistory();

  useEffect(() => {
    /**
     * Asynchronously checks if the user's session token is valid. If the token is valid, sets the
     * authentication state to true. Logs any errors encountered during the process.
     *
     * @returns A promise that resolves when the session check is complete.
     */
    async function checkAuthentication() {
      const token = await getSessionToken();
      if (token == null) {
        // await clearSessionToken();
        history.push("/login");
      } else {
        console.log("Token is not null");
      }
    }

    void checkAuthentication();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <IonApp>
        <IonReactRouter>
          <IonRouterOutlet>
            <Route path="/login" exact>
              <Login />
            </Route>

            <Route path="/create-pin" exact>
              <CreatePIN />
            </Route>

            <Route path="/confirm-pin" exact>
              <ConfirmPIN />
            </Route>

            <Route path="/pin" exact>
              <PIN />
            </Route>

            <Route path="/branch-selector" exact>
              <BranchSelector />
            </Route>

            <Route path="/app/*">
              <Tabs />
            </Route>

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
