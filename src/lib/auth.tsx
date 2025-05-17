import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useIonRouter } from "@ionic/react";

import { authenticateUser } from "./api";
import { AuthContext, loginResponseSchema, type LoginResponse } from "./auth-context";
import { getFromStorage, saveToStorage } from "./storage";

/**
 * The `AuthProvider` component provides authentication context to its children. It manages the
 * authentication state and user information, and provides methods for logging in and logging out.
 *
 * @param props The component props.
 * @param props.children The child components to render.
 * @returns The rendered component.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<LoginResponse | null>(null);
  const router = useIonRouter();

  // Check for token on mount
  useEffect(() => {
    /**
     * Checks for an existing user token in storage and updates the authentication state
     * accordingly.
     */
    async function checkToken() {
      const currentUser = await getFromStorage("currentUser");
      if (typeof currentUser === "string" && currentUser.length > 0) {
        try {
          const parsedUser = JSON.parse(currentUser);
          const result = loginResponseSchema.safeParse(parsedUser);
          if (result.success) {
            setIsAuthenticated(true);
            setUser(result.data);
          } else {
            setIsAuthenticated(false);
            setUser(null);
          }
        } catch {
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    }
    void checkToken();
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const authenticatedUser = await authenticateUser(email, password);

      if (authenticatedUser.success) {
        await saveToStorage("currentUser", JSON.stringify(authenticatedUser));
        setIsAuthenticated(true);
        setUser(authenticatedUser);

        router.push("/create-pin");
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    },
    [router],
  );

  const logout = useCallback(() => {
    sessionStorage.removeItem("token");
    setIsAuthenticated(false);
    setUser(null);
    router.push("/login");
  }, [router]);

  const value = useMemo(
    () => ({
      isAuthenticated,
      user,
      login,
      logout,
    }),
    [isAuthenticated, user, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
