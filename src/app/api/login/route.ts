import { NextResponse, type NextRequest } from 'next/server'
import axios from 'axios'

import { env } from '@/lib/env/server'
import { loginFormSchema } from '@/lib/form-schema'
import { createSession } from '@/lib/session'
import type { LoginResponse } from '@/lib/types'

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const parsedData = loginFormSchema.safeParse(Object.fromEntries(formData))

  if (!parsedData.success) {
    return {
      success: false,
      message: 'Invalid form data.',
    }
  }

  const response = await axios.post<LoginResponse>(env.LOGIN_API_URL, parsedData.data)

  // TODO: Handle error responses

  if (!response.status.toString().startsWith('2')) {
    return NextResponse.json({
      success: false,
      message: 'An error occurred while logging in.',
    })
  }

  const { data } = response.data
  const userId = data.user.id
  const userLevel = data.user.level
  const userBranches = data.user.branches

  await createSession(userId, userLevel, userBranches)

  return NextResponse.json({
    success: true,
    message: 'Login successful.',
  })
}
