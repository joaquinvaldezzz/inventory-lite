/* eslint-disable @typescript-eslint/no-unsafe-return -- Safe to ignore */
import { Storage } from '@ionic/storage'

import { getFromStorage } from './storage'
import type { Branch, LoginResult } from './types'

const storage = new Storage()

await storage.create()

/**
 * Retrieves the current user from storage.
 *
 * @returns {Promise<LoginResult | null>} A promise that resolves to the current user's login result
 *   if found, or null if the user is not found or an error occurs while parsing the user data.
 */
export async function getCurrentUser(): Promise<LoginResult | null> {
  const currentUser = await getFromStorage('currentUser')

  if (currentUser != null) {
    try {
      return JSON.parse(currentUser)
    } catch (error) {
      console.error('Failed to parse `currentUser`:', error)
      return null
    }
  }

  return null
}

/**
 * Retrieves the branches associated with the current user.
 *
 * @returns {Promise<Branch[] | null>} A promise that resolves to an array of branches if the user
 *   is found, or null if the user is not found or an error occurs while accessing the branches.
 */
export async function getUserBranches(): Promise<Branch[] | null> {
  const currentUser = await getCurrentUser()

  if (currentUser != null) {
    try {
      return currentUser.data.user.branches
    } catch (error) {
      console.error('Failed to access branches from `currentUser`:', error)
      return null
    }
  }

  return null
}
