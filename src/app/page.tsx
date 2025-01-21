import type { Metadata } from 'next'

import { Login } from './page.client'

export const metadata: Metadata = {
  title: 'Log in',
}
export default function Page() {
  return <Login />
}
