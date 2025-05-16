import { createContext } from "react";
import { z } from "zod";

const loginResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    token: z.string(),
    user: z.object({
      id: z.number(),
      name: z.string(),
      email: z.string(),
      level: z.string(),
      access: z.array(
        z.object({
          module_name: z.string(),
          read: z.number().or(z.null()),
          write: z.number().or(z.null()),
          edit: z.number().or(z.null()),
          delete: z.number().or(z.null()),
        }),
      ),
      branches: z.array(
        z.object({
          id: z.number(),
          branch: z.string(),
        }),
      ),
    }),
  }),
});

type LoginResponse = z.infer<typeof loginResponseSchema>;

interface AuthContextType {
  isAuthenticated: boolean;
  user: LoginResponse | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const noop = () => {
  throw new Error("AuthContext not initialized");
};

const noopSync = () => {
  throw new Error("AuthContext not initialized");
};

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: noop,
  logout: noopSync,
});

export type { AuthContextType, LoginResponse };
export { loginResponseSchema };
