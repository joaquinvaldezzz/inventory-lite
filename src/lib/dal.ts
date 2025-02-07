/* eslint-disable @typescript-eslint/no-unsafe-return -- Safe to ignore */
import { getFromStorage } from './storage'
import type { Branch, LoginResponse } from './types'

/**
 * Retrieves the current user from storage.
 *
 * @returns {Promise<LoginResponse | null>} A promise that resolves to the current user's login
 *   result if found, or null if the user is not found or an error occurs while parsing the user
 *   data.
 */
export async function getCurrentUser(): Promise<LoginResponse | null> {
  const currentUser = await getFromStorage('currentUser')

  if (currentUser != null) {
    try {
      return JSON.parse(currentUser)
    } catch (error) {
      console.error('Failed to access `currentUser`:', error)
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

/**
 * Retrieves the branch selected by the current user.
 *
 * @returns {Promise<number | null>} A promise that resolves to the ID of the selected branch if
 *   found, or null if the branch is not found.
 */
export async function getUserSelectedBranch(): Promise<number | null> {
  const selectedBranch = await getFromStorage('currentBranch')

  if (selectedBranch != null) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Safe to assign
      const branch = JSON.parse(selectedBranch) as Record<string, string>
      const branchId = Object.values(branch)[0]
      return Number(branchId)
    } catch (error) {
      console.error('Failed to access `currentBranch`:', error)
      return null
    }
  }

  return null
}
