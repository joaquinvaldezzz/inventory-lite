// 'use server'

import axios from 'axios'

import { loginFormSchema } from './form-schema'
import { createSession } from './session'

interface PreviousState {
  message: string
}

interface Message extends PreviousState {
  success?: boolean
  fields?: Record<string, string>
  branches?: Array<{
    id: string
    branch: string
  }>
}

export interface Response {
  data: {
    token: string
    user: {
      id: string
      name: string
      email: string
      level: string
      branches: [
        {
          id: string
          branch: string
        },
      ]
    }
  }
}

export type Branch = Response['data']['user']['branches'][0]

export async function login(_previousState: PreviousState, formData: FormData): Promise<Message> {
  const formValues = Object.fromEntries(formData)
  const parsedData = loginFormSchema.safeParse(formValues)

  if (!parsedData.success) {
    return {
      success: false,
      message: 'Invalid form data.',
      fields: parsedData.data,
    }
  }

  const response = await axios.post<Response>(
    'http://trial.integra-payroll.com/api/login.php',
    parsedData.data,
    {
      headers: {
        Accept: '/',
        'X-Requested-With': 'XMLHttpRequest',
      },
    },
  )

  if (!response.status.toString().startsWith('2')) {
    return {
      success: false,
      message: 'An error occurred while logging in.',
    }
  }

  const { data } = response.data
  const userId = data.user.id
  const userLevel = data.user.level
  const userBranches = data.user.branches

  await createSession(userId, userLevel, userBranches)

  return {
    success: true,
    message: 'Successfully logged in.',
  }
}
