import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {},

  clientPrefix: "VITE_",
  client: {
    VITE_JWT_SECRET: z.string(),
    VITE_LOGIN_API_URL: z.string().url(),
    VITE_FORGOT_PASSWORD_API_URL: z.string().url(),
    VITE_DELIVERY_API_URL: z.string().url(),
    VITE_SUPPLIERS_API_URL: z.string().url(),
    VITE_INGREDIENTS_API_URL: z.string().url(),
    VITE_DAILY_COUNT_API_URL: z.string().url(),
    VITE_CATEGORIES_API_URL: z.string().url(),
    VITE_WASTE_API_URL: z.string().url(),
    VITE_EMPLOYEES_API_URL: z.string().url(),
    VITE_EXPENSES_API_URL: z.string().url(),
    VITE_LOGOUT_API_URL: z.string().url(),
  },

  runtimeEnv: import.meta.env,
});
