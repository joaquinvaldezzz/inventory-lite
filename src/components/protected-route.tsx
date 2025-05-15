import { useEffect, useState, type ComponentType } from "react";
import { Redirect, Route, useLocation, type RouteProps } from "react-router-dom";

import { verifySession } from "@/lib/session";

interface ProtectedRouteProps extends Omit<RouteProps, "component"> {
  component: ComponentType<Record<string, unknown>>;
}

/**
 * A route component that checks for authentication and redirects to login if not authenticated.
 *
 * @param props The route props including the component to render
 * @param props.component The component to render if the user is authenticated
 * @returns The protected route component
 */
export function ProtectedRoute({ component: Component, ...rest }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const location = useLocation();

  /** Checks if the user is authenticated by verifying their session. */
  async function checkAuth() {
    const session = await verifySession();
    setIsAuthenticated(session != null);
  }

  // Check auth on mount and route changes
  useEffect(() => {
    void checkAuth();
  }, [location.pathname]);

  // Periodic auth check every 5 minutes
  useEffect(() => {
    const interval = setInterval(
      () => {
        void checkAuth();
      },
      5 * 60 * 1000,
    );

    return () => {
      clearInterval(interval);
    };
  }, []);

  if (isAuthenticated === null) {
    // Still checking authentication
    return null;
  }

  return (
    <Route
      render={(props) =>
        isAuthenticated ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: "/login",
              state: { from: props.location },
            }}
          />
        )
      }
      {...rest}
    />
  );
}
