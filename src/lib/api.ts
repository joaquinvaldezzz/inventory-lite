/* eslint-disable complexity -- Safe to disable for this file */
import axios from 'axios'
import { format } from 'date-fns'

import { getCurrentUser, getUserSelectedBranch } from './dal'
import { env } from './env'
import type { EditDeliveryFormSchema, NewDeliveryFormSchema } from './form-schema'
import { saveToStorage } from './storage'
import type {
  Categories,
  CategoriesResponse,
  DailyCountData,
  DailyCountResponse,
  DeliveryItem,
  DeliveryRecord,
  DeliveryResponse,
  Items,
  ItemsResponse,
  Supplier,
  SupplierResponse,
} from './types'

if (env.VITE_DELIVERY_API_URL.length === 0) {
  throw new Error('API URL is not defined')
}

/**
 * Creates a new delivery entry.
 *
 * This function sends a POST request to the delivery API to create a new delivery entry with the
 * provided delivery details. It requires the current user and the selected branch to be available.
 * If either is not found, an error is thrown.
 *
 * @param {NewDeliveryFormSchema} delivery - The delivery item details to be added.
 * @returns {Promise<void>} A promise that resolves when the delivery entry is successfully created.
 * @throws {Error} If the user is not found or the branch is not selected, or if there is an error
 *   creating the delivery entry.
 */
export async function createDeliveryEntry(delivery: NewDeliveryFormSchema): Promise<void> {
  const [user, branch] = await Promise.allSettled([getCurrentUser(), getUserSelectedBranch()])

  if (user.status !== 'fulfilled' || branch.status !== 'fulfilled') {
    throw new Error('User not found or branch not selected')
  } else if (user.value == null || branch.value == null) {
    throw new Error('User or branch not found')
  }

  const deliveryEntryDetails = JSON.stringify({
    user_id: user.value.data.user.id,
    token: user.value.data.token,
    branch: branch.value,
    action: 'add',
    supplier: Number(delivery.supplier),
    date_request: format(delivery.date_request, 'yyyy-MM-dd'),
    date_order: format(delivery.date_request, 'yyyy-MM-dd'),
    date_delivered: format(delivery.date_request, 'yyyy-MM-dd'),
    date_received: format(delivery.date_request, 'yyyy-MM-dd'),
    grand_total: 0,
    remarks: delivery.remarks,
    status: 2,
    items: [...delivery.items],
  })

  try {
    await axios.post<NewDeliveryFormSchema>(env.VITE_DELIVERY_API_URL, deliveryEntryDetails)
  } catch (error) {
    console.error('Error creating delivery entry:', error)
    throw new Error('Error creating delivery entry')
  }
}

/**
 * Fetches delivery entries from the API.
 *
 * @returns {Promise<DeliveryItem[]>} A promise that resolves to an array of delivery items. If the
 *   fetch fails or no items are found, it resolves to an empty array.
 * @throws {Error} Throws an error if the API URL is not defined or if the request fails.
 */
export async function getDeliveryEntries(): Promise<DeliveryItem[]> {
  const [user, branch] = await Promise.allSettled([getCurrentUser(), getUserSelectedBranch()])

  if (user.status !== 'fulfilled' || branch.status !== 'fulfilled') {
    throw new Error('User not found or branch not selected')
  } else if (user.value == null || branch.value == null) {
    throw new Error('User or branch not found')
  }

  // TODO: Move this type of data to the dal.tsx file
  const data = JSON.stringify({
    user_id: user.value.data.user.id,
    token: user.value.data.token,
    branch: branch.value,
    action: 'fetch',
  })

  try {
    const request = await axios.post<DeliveryResponse>(env.VITE_DELIVERY_API_URL, data)
    return Array.isArray(request.data.data) ? request.data.data : []
  } catch (error) {
    console.error('Error fetching delivery entries:', error)
    throw new Error('Error fetching delivery entries')
  }
}

/**
 * Fetches the list of suppliers for the current user and selected branch.
 *
 * This function retrieves the current user and the selected branch concurrently. If either the user
 * or the branch is not found or not selected, it throws an error. It then sends a POST request to
 * the suppliers API with the user ID and token. If the request is successful, it returns the list
 * of suppliers. If the request fails, it logs the error and throws an error.
 *
 * @returns {Promise<Supplier>} A promise that resolves to the list of suppliers.
 * @throws {Error} If the user or branch is not found or not selected.
 * @throws {Error} If there is an error fetching the suppliers.
 */
export async function getSuppliers(): Promise<Supplier> {
  const [user, branch] = await Promise.allSettled([getCurrentUser(), getUserSelectedBranch()])

  if (user.status !== 'fulfilled' || branch.status !== 'fulfilled') {
    throw new Error('User not found or branch not selected')
  } else if (user.value == null || branch.value == null) {
    throw new Error('User or branch not found')
  }

  const userSessionData = JSON.stringify({
    user_id: user.value.data.user.id,
    token: user.value.data.token,
  })

  try {
    const request = await axios.post<SupplierResponse>(env.VITE_SUPPLIERS_API_URL, userSessionData)
    await saveToStorage('suppliers', JSON.stringify(request.data.data))
    return Array.isArray(request.data.data) ? request.data.data : []
  } catch (error) {
    console.error('Error fetching suppliers:', error)
    throw new Error('Error fetching suppliers')
  }
}

/**
 * Fetches items from the API.
 *
 * This function retrieves the current user and the user's selected branch concurrently. If either
 * the user or the branch is not found or not selected, it throws an error. If both are found, it
 * constructs a user session data object and sends a POST request to the ingredients API URL to
 * fetch the items.
 *
 * @returns {Promise<Items>} A promise that resolves to an array of items.
 * @throws {Error} If the user is not found, the branch is not selected, or there is an error
 *   fetching items.
 */
export async function getItems(): Promise<Items> {
  const [user, branch] = await Promise.allSettled([getCurrentUser(), getUserSelectedBranch()])

  if (user.status !== 'fulfilled' || branch.status !== 'fulfilled') {
    throw new Error('User not found or branch not selected')
  } else if (user.value == null || branch.value == null) {
    throw new Error('User or branch not found')
  }

  const userSessionData = JSON.stringify({
    user_id: user.value.data.user.id,
    token: user.value.data.token,
  })

  try {
    const request = await axios.post<ItemsResponse>(env.VITE_INGREDIENTS_API_URL, userSessionData)
    return Array.isArray(request.data.data) ? request.data.data : []
  } catch (error) {
    console.error('Error fetching items:', error)
    throw new Error('Error fetching items')
  }
}

/**
 * Fetches a specific delivery record by its ID.
 *
 * This function retrieves the current user and the selected branch concurrently. If either the user
 * or the branch is not found or not selected, it throws an error. It then sends a POST request to
 * the delivery API with the user ID, token, branch, action, and ID. If the request is successful,
 * it returns the delivery records as an array. If the request fails, it logs the error and throws
 * an error.
 *
 * @param {number} id - The ID of the delivery record to fetch.
 * @returns {Promise<DeliveryRecord[]>} - A promise that resolves to an array of delivery records.
 * @throws {Error} - Throws an error if the user or branch is not found or if there is an error
 *   fetching the delivery record.
 */
export async function getSpecificDeliveryRecord(id: number): Promise<DeliveryRecord[]> {
  const [user, branch] = await Promise.allSettled([getCurrentUser(), getUserSelectedBranch()])

  if (user.status !== 'fulfilled' || branch.status !== 'fulfilled') {
    throw new Error('User not found or branch not selected')
  } else if (user.value == null || branch.value == null) {
    throw new Error('User or branch not found')
  }

  const data = JSON.stringify({
    user_id: user.value.data.user.id,
    token: user.value.data.token,
    branch: branch.value,
    action: 'fetch',
    id,
  })

  try {
    const request = await axios.post<DeliveryResponse>(env.VITE_DELIVERY_API_URL, data)
    return Array.isArray(request.data.data) ? request.data.data : []
  } catch (error) {
    console.error('Error fetching delivery record:', error)
    throw new Error('Error fetching delivery record')
  }
}

/**
 * Fetches categories from the API.
 *
 * This function retrieves the current user and the selected branch, then sends a request to the
 * categories API endpoint to fetch the categories. The fetched categories are saved to storage and
 * returned.
 *
 * @returns {Promise<Categories[]>} A promise that resolves to an array of categories.
 * @throws {Error} If the user is not found, the branch is not selected, or there is an error
 *   fetching categories.
 */
export async function getCategories(): Promise<Categories[]> {
  const [user, branch] = await Promise.allSettled([getCurrentUser(), getUserSelectedBranch()])

  if (user.status !== 'fulfilled' || branch.status !== 'fulfilled') {
    throw new Error('User not found or branch not selected')
  } else if (user.value == null || branch.value == null) {
    throw new Error('User or branch not found')
  }

  const userSessionData = JSON.stringify({
    user_id: user.value.data.user.id,
    token: user.value.data.token,
    action: 'fetch',
  })

  try {
    const request = await axios.post<CategoriesResponse>(
      env.VITE_CATEGORIES_API_URL,
      userSessionData,
    )
    await saveToStorage('categories', JSON.stringify(request.data.data))
    return Array.isArray(request.data.data) ? request.data.data : []
  } catch (error) {
    console.error('Error fetching categories:', error)
    throw new Error('Error fetching categories')
  }
}

/**
 * Edits a delivery record with the given ID and delivery details.
 *
 * @param id - The ID of the delivery record to edit.
 * @param delivery - The delivery details to update the record with.
 * @returns A promise that resolves when the delivery record is successfully edited.
 * @throws An error if the user is not found, the branch is not selected, or if there is an error
 *   editing the delivery record.
 */
export async function editDeliveryRecord(
  id: number,
  delivery: EditDeliveryFormSchema,
): Promise<void> {
  const [user, branch] = await Promise.allSettled([getCurrentUser(), getUserSelectedBranch()])

  if (user.status !== 'fulfilled' || branch.status !== 'fulfilled') {
    throw new Error('User not found or branch not selected')
  } else if (user.value == null || branch.value == null) {
    throw new Error('User or branch not found')
  }

  const deliveryEntryDetails = JSON.stringify({
    user_id: user.value.data.user.id,
    token: user.value.data.token,
    branch: branch.value,
    action: 'edit',
    id,
    supplier: Number(delivery.supplier),
    date_request: format(delivery.date_request, 'yyyy-MM-dd'),
    date_order: format(delivery.date_request, 'yyyy-MM-dd'),
    date_delivered: format(delivery.date_request, 'yyyy-MM-dd'),
    date_received: format(delivery.date_request, 'yyyy-MM-dd'),
    grand_total: 0,
    remarks: delivery.remarks,
    status: 2,
    items: [...delivery.items],
  })

  try {
    // TODO: Add the response type
    await axios.post(env.VITE_DELIVERY_API_URL, deliveryEntryDetails)
  } catch (error) {
    console.error('Error editing delivery record:', error)
    throw new Error('Error editing delivery record')
  }
}

/**
 * Deletes a delivery record by its ID.
 *
 * @param id - The ID of the delivery record to delete.
 * @returns A promise that resolves when the delivery record is successfully deleted.
 * @throws Will throw an error if the user is not found, the branch is not selected, or if there is
 *   an error deleting the delivery record.
 */
export async function deleteDeliveryRecord(id: number): Promise<void> {
  const [user, branch] = await Promise.allSettled([getCurrentUser(), getUserSelectedBranch()])

  if (user.status !== 'fulfilled' || branch.status !== 'fulfilled') {
    throw new Error('User not found or branch not selected')
  } else if (user.value == null || branch.value == null) {
    throw new Error('User or branch not found')
  }

  const data = JSON.stringify({
    user_id: user.value.data.user.id,
    token: user.value.data.token,
    branch: branch.value,
    action: 'delete',
    id,
  })

  try {
    await axios.post<DeliveryResponse>(env.VITE_DELIVERY_API_URL, data)
  } catch (error) {
    console.error('Error deleting delivery record:', error)
    throw new Error('Error deleting delivery record')
  }
}

/**
 * Retrieves the current user session, including user ID, token, and selected branch.
 *
 * This function concurrently fetches the current user and the selected branch using
 * `Promise.allSettled`. If either the user or the branch fetch fails or returns null, an error is
 * thrown.
 *
 * @returns {Promise<{ userId: string; token: string; branch: number }>} An object containing the
 *   user ID, token, and selected branch.
 * @throws {Error} If the user is not found or the branch is not selected.
 * @throws {Error} If the user or branch is null.
 */
async function getUserSession(): Promise<{ userId: string; token: string; branch: number }> {
  const [user, branch] = await Promise.allSettled([getCurrentUser(), getUserSelectedBranch()])

  if (user.status !== 'fulfilled' || branch.status !== 'fulfilled') {
    throw new Error('User not found or branch not selected')
  }

  if (user.value == null || branch.value == null) {
    throw new Error('User or branch not found')
  }

  return {
    userId: user.value.data.user.id,
    token: user.value.data.token,
    branch: branch.value,
  }
}

/**
 * Fetches the daily count entries for the current user session.
 *
 * This function retrieves the user session details including userId, token, and branch, then sends
 * a POST request to the daily count API to fetch the daily count entries.
 *
 * @returns {Promise<DailyCountData[]>} A promise that resolves to an array of daily count data.
 * @throws {Error} Throws an error if there is an issue fetching the daily count entries.
 */
export async function getDailyCountEntries(): Promise<DailyCountData[]> {
  const { userId, token, branch } = await getUserSession()
  const data = JSON.stringify({
    user_id: userId,
    token,
    branch,
    action: 'fetch',
  })

  try {
    const request = await axios.post<DailyCountResponse>(env.VITE_DAILY_COUNT_API_URL, data)
    return Array.isArray(request.data.data) ? request.data.data : []
  } catch (error) {
    console.error('Error fetching daily count entries:', error)
    throw new Error('Error fetching daily count entries')
  }
}
