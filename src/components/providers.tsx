import { useMemo, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AuthProvider } from "@/lib/auth";

import { ThemeProvider } from "./theme-toggle";

/**
 * Providers component wraps the application with all required context providers.
 *
 * This component:
 *
 * - Supplies global state, theme, authentication, and query management contexts to the app
 * - Configures React Query with custom retry, retry delay, and stale time options
 * - Ensures that all child components have access to necessary providers, including theme and
 *   authentication
 * - Can be extended to include additional providers as the app grows
 *
 * @param props Component configuration and children
 * @param props.children The child components to be wrapped with providers
 * @returns JSX element with the application wrapped in all necessary providers
 */
export function Providers({ children }: { children: ReactNode }) {
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 3,
            retryDelay: 1000,
            staleTime: 1000 * 60 * 5,
          },
        },
      }),
    [],
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>{children}</AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
