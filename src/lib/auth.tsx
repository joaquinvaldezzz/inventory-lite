import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useIonRouter } from "@ionic/react";
import { useQuery } from "@tanstack/react-query";

import { authenticateUser, checkIfUserTokenIsValid, executeLogout } from "./api";
import { AuthContext, loginResponseSchema, type LoginResponse } from "./auth-context";
import { deleteFromStorage, getFromStorage, saveToStorage } from "./storage";

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
  const [isPinSet, setIsPinSet] = useState(false);
  const [user, setUser] = useState<LoginResponse | null>(null);
  const { data } = useQuery({
    queryKey: ["token-validity"],
    queryFn: async () => await checkIfUserTokenIsValid(),
  });
  const router = useIonRouter();

  // Check for token on mount
  useEffect(() => {
    /**
     * Checks for an existing user token in storage and updates the authentication state accordingly
     * and if the token is valid. If the token is invalid, the user is logged out and redirected to
     * the login page.
     */
    async function checkToken() {
      const currentUser = await getFromStorage("currentUser");
      const savedPIN = await getFromStorage("pin");

      if (savedPIN != null) {
        setIsPinSet(true);
      }

      if (typeof currentUser === "string" && currentUser.length > 0) {
        try {
          const parsedUser = JSON.parse(currentUser);
          const result = loginResponseSchema.safeParse(parsedUser);

          if ((data ?? false) && result.success) {
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
  }, [data]);

  /**
   * Logs in a user with the given email and password.
   *
   * @param email The user's email.
   * @param password The user's password.
   * @returns The authenticated user or null if authentication fails.
   */
  const login = useCallback(
    async (email: string, password: string): Promise<LoginResponse | null> => {
      const authenticatedUser = await authenticateUser(email, password);

      if (authenticatedUser.data != null) {
        await saveToStorage("currentUser", JSON.stringify(authenticatedUser));
        setIsAuthenticated(true);
        setUser(authenticatedUser);
        return authenticatedUser;
      } else {
        setIsAuthenticated(false);
        setUser(null);
        return null;
      }
    },
    [router],
  );

  /**
   * Logs out the current user by executing a logout request and deleting the user's session from
   * storage.
   */
  const logout = useCallback(async () => {
    await executeLogout();
    await deleteFromStorage("currentUser");
    setIsAuthenticated(false);
    setUser(null);
    router.push("/login");
  }, [router]);

  /**
   * Creates a memoized value for the authentication context.
   *
   * @returns The memoized value for the authentication context.
   */
  const value = useMemo(
    () => ({
      isAuthenticated,
      isPinSet,
      user,
      login,
      logout,
    }),
    [isAuthenticated, isPinSet, user, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
