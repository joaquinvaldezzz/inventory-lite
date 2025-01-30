/* eslint-disable @typescript-eslint/no-unsafe-return -- Safe to ignore */
import { Storage } from '@ionic/storage'

/** Creates an instance of the Storage class. */
const storage = new Storage()

/**
 * Saves a value to storage under the specified key.
 *
 * @param {string} key - The key under which the value will be stored.
 * @param {string} value - The value to be stored.
 * @returns {Promise<void>} A promise that resolves when the value has been successfully saved to
 *   storage.
 */
export async function saveToStorage(key: string, value: string): Promise<void> {
  await storage.create()
  await storage.set(key, value)
}

/**
 * Retrieves a value from storage using the specified key.
 *
 * @param {string} key - The key of the value to be retrieved from storage.
 * @returns {Promise<string | null>} A promise that resolves to the value associated with the
 *   specified key, or null if the key does not exist.
 */
export async function getFromStorage(key: string): Promise<string | null> {
  await storage.create()
  return await storage.get(key)
}
