import type { ReactNode } from "react";
import { Redirect } from "react-router-dom";

import { useAuth } from "@/hooks/use-auth";

/**
 * PublicRoute component restricts access to public routes for authenticated users.
 *
 * This component:
 *
 * - Checks if the user is authenticated using the `useAuth` hook
 * - Redirects authenticated users to the appropriate PIN setup or entry page
 * - Allows unauthenticated users to access the wrapped child components
 *
 * @param props Component configuration and children
 * @param props.children The child components to render if the user is not authenticated
 * @returns The child components if the user is not authenticated, otherwise a redirect to the PIN
 *   setup or entry page
 */
export function PublicRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isPinSet } = useAuth();

  if (isAuthenticated) {
    return isPinSet ? <Redirect to="/enter-pin" /> : <Redirect to="/create-pin" />;
  }

  return children;
}

/**
 * PrivateRoute component restricts access to private routes for unauthenticated users.
 *
 * This component:
 *
 * - Checks if the user is authenticated using the `useAuth` hook
 * - Allows authenticated users to access the wrapped child components
 * - Redirects unauthenticated users to the login page
 *
 * @param props Component configuration and children
 * @param props.children The child components to render if the user is authenticated
 * @returns The child components if the user is authenticated, otherwise a redirect to the login
 *   page
 */
export function PrivateRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Redirect to="/login" />;
}
