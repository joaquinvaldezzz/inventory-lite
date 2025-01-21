import type { Metadata } from 'next'
import { cookies } from 'next/headers'

import type { Branch } from '@/lib/actions'
import { decrypt } from '@/lib/session'

import { BranchSelector } from './page.client'

export const metadata: Metadata = {
  title: 'Branch Selector',
}

export default async function Page() {
  const cookie = (await cookies()).get('session')?.value
  const session = await decrypt(cookie)

  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- The session object is known to have a userBranches property.
  const { userBranches } = session as { userBranches: Branch[] }

  return <BranchSelector branches={userBranches} />
}
