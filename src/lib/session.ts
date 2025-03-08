import { CapacitorCookies } from '@capacitor/core'
import { jwtVerify, SignJWT, type JWTPayload } from 'jose'

import { env } from './env'

const SECRET_KEY = env.VITE_JWT_SECRET
const KEY = new TextEncoder().encode(SECRET_KEY)

export interface SessionPayload extends JWTPayload {
  userId: string | number
  userRole: string
  expiresAt: Date
}

/**
 * Encrypts the given payload using the HS256 algorithm.
 *
 * @param payload The payload to be encrypted.
 * @returns A promise that resolves to the encrypted token.
 */
export async function encrypt(payload: SessionPayload) {
  return await new SignJWT(payload)
    .setExpirationTime('1hour')
    .setIssuedAt()
    .setProtectedHeader({ alg: 'HS256' })
    .sign(KEY)
}

/**
 * Decrypts a session token and returns the payload.
 *
 * @param session The session token to decrypt.
 * @returns The payload of the decrypted session token, or null if decryption fails.
 */
export async function decrypt(session: string | undefined = '') {
  try {
    const { payload } = await jwtVerify(session, KEY, {
      algorithms: ['HS256'],
    })

    return payload
  } catch (error) {
    return null
  }
}

/**
 * Creates a session for the specified user.
 *
 * @param userId The ID of the user.
 * @param userRole The role of the user.
 * @returns A promise that resolves to void.
 */
export async function createSession(userId: string, userRole: string) {
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

  const session = await encrypt({ userId, userRole, expiresAt })

  await CapacitorCookies.setCookie({
    key: 'session',
    value: session,
    path: '/',
    expires: expiresAt.toString(),
  })
}

/**
 * Verifies the session by decrypting the 'session' cookie and checking if the userId is present.
 *
 * @returns A promise that resolves to the userId if the session is valid, or null otherwise.
 */
export async function verifySession(): Promise<{ userId: number } | null> {
  const cookies = await CapacitorCookies.getCookies()
  const sessionCookie = cookies.session
  const decryptedSession = await decrypt(sessionCookie)

  if (decryptedSession?.userId != null) {
    return { userId: Number(decryptedSession.userId) }
  }

  return null
}

/**
 * Deletes the session by removing the 'session' cookie and redirecting to the login page.
 *
 * @returns A promise that resolves to void.
 */
export async function deleteSession() {
  await CapacitorCookies.deleteCookie({
    key: 'session',
  })

  // Redirect to the login page
}
