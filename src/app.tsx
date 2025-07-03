import { IonApp, setupIonicReact } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";

import { AppRoutes } from "@/components/app-routes";
import { Providers } from "@/components/providers";

import "@/styles/main.css";

setupIonicReact({
  toastDuration: 3000,
});

/**
 * App component serves as the root of the application, setting up routing and context providers.
 *
 * This component:
 *
 * - Wraps the application in all necessary context providers (theme, auth, query, etc.)
 * - Configures and renders the main application routes
 * - Handles global layout and initialization logic
 *
 * The component ensures that all pages and features have access to required providers and that
 * routing is consistently applied throughout the app.
 *
 * @returns JSX element representing the fully configured application
 */
export default function App() {
  return (
    <Providers>
      <IonApp>
        <IonReactRouter>
          <AppRoutes />
        </IonReactRouter>
      </IonApp>
    </Providers>
  );
}
