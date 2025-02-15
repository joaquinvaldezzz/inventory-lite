import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  server: {
    JWT_SECRET: z.string(),
  },

  clientPrefix: 'VITE_',
  client: {
    VITE_LOGIN_API_URL: z.string().url(),
    VITE_DELIVERY_API_URL: z.string().url(),
    VITE_SUPPLIERS_API_URL: z.string().url(),
    VITE_INGREDIENTS_API_URL: z.string().url(),
    VITE_DAILY_COUNT_API_URL: z.string().url(),
    VITE_CATEGORIES_API_URL: z.string().url(),
    VITE_WASTE_API_URL: z.string().url(),
  },

  runtimeEnv: import.meta.env,
})
