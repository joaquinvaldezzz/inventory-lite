import { useContext } from "react";

import { AuthContext, type AuthContextType } from "../lib/auth-context";

/**
 * Hook to easily access the auth context in any component.
 *
 * @returns The authentication context containing isAuthenticated, user, login, and logout.
 */
export function useAuth(): AuthContextType {
  return useContext(AuthContext);
}
