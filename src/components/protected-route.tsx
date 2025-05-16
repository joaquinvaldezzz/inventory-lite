import { useContext } from "react";
import type { ComponentType } from "react";
import { Redirect, Route, type RouteProps } from "react-router-dom";

import { AuthContext } from "@/lib/auth";

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
export default function ProtectedRoute({ component: Component, ...rest }: ProtectedRouteProps) {
  const { isAuthenticated } = useContext(AuthContext);

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
