import { Storage } from "@ionic/storage";

/** Singleton instance of the Storage class. */
const storage = new Storage();

/** Tracks whether the storage has been initialized. */
let isStorageInitialized = false;

/**
 * Ensures the storage is properly initialized before any operation.
 *
 * This function prevents redundant initialization by checking if the storage has already been
 * created.
 *
 * @returns {Promise<void>} Resolves when storage is initialized.
 */
async function ensureStorageInitialized(): Promise<void> {
  if (!isStorageInitialized) {
    await storage.create();
    isStorageInitialized = true;
  }
}

/**
 * Saves a value to local storage under a specified key.
 *
 * @param {string} key - The key under which the value will be stored.
 * @param {string} value - The value to be stored.
 * @returns {Promise<void>} Resolves when the value is successfully saved.
 */
export async function saveToStorage(key: string, value: string): Promise<void> {
  await ensureStorageInitialized();
  await storage.set(key, value);
}

/**
 * Retrieves a stored value by key.
 *
 * @param {string} key - The key associated with the stored value.
 * @returns {Promise<string | null>} Resolves to the stored value if found, otherwise returns
 *   `null`.
 */
export async function getFromStorage(key: string): Promise<string | null> {
  await ensureStorageInitialized();

  const value = (await storage.get(key)) as unknown;

  return typeof value === "string" ? value : null;
}
