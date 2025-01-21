import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    JWT_SECRET: z.string(),
    LOGIN_API_URL: z.string().url(),
  },
  experimental__runtimeEnv: process.env,
})
