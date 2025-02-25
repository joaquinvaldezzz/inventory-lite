import axios from 'axios'
import { format } from 'date-fns'

import { getCurrentUser, getUserSelectedBranch } from './dal'
import { env } from './env'
import type {
  EditDeliveryFormSchema,
  NewDailyCountFormSchema,
  NewDeliveryFormSchema,
} from './form-schema'
import { saveToStorage } from './storage'
import type {
  Categories,
  CategoriesResponse,
  DailyCountData,
  DailyCountRecord,
  DailyCountRecordResponse,
  DailyCountResponse,
  DeliveryItem,
  DeliveryRecord,
  DeliveryResponse,
  Ingredients,
  IngredientsResponse,
  Items,
  ItemsResponse,
  LoginResponse,
  Supplier,
  SupplierResponse,
  WasteData,
  WasteResponse,
} from './types'

if (env.VITE_DELIVERY_API_URL.length === 0) {
  throw new Error('API URL is not defined')
}

/** Represents a user session containing authentication details. */
interface UserSession {
  userId: string
  token: string
  branch: number
}

/** Configuration object for API requests. */
interface ApiRequestConfig {
  url: string
  action?: string
  additionalData?: Record<string, unknown>
}

/**
 * Retrieves the current user session (user ID, token, branch).
 *
 * @returns {Promise<UserSession>} A promise that resolves to user session details.
 * @throws {Error} If the user or branch is not found.
 */
async function getUserSession(): Promise<UserSession> {
  const [user, branch] = await Promise.allSettled([getCurrentUser(), getUserSelectedBranch()])

  if (user.status !== 'fulfilled' || branch.status !== 'fulfilled') {
    throw new Error('User not found or branch not selected')
  }

  if (user.value === null || branch.value === null) {
    throw new Error('User or branch not found')
  }

  return {
    userId: user.value.data.user.id,
    token: user.value.data.token,
    branch: branch.value,
  }
}

/**
 * Sends an API request with the given configuration.
 *
 * @template T The expected response type.
 * @param {ApiRequestConfig} config - The API request configuration.
 * @returns {Promise<T>} A promise that resolves to the response data.
 * @throws {Error} If the API request fails.
 */
async function apiRequest<T>({ url, action, additionalData = {} }: ApiRequestConfig): Promise<T> {
  const { userId, token, branch } = await getUserSession()

  const requestData = {
    user_id: userId,
    token,
    branch,
    action,
    ...additionalData,
  }

  try {
    const response = await axios.post<T>(url, requestData)
    return response.data
  } catch (error) {
    console.error(`API request failed (${action}):`, error)
    throw new Error(`Failed to ${action} data`)
  }
}

/**
 * Authenticates a user by sending their credentials to the login API.
 *
 * @param {string} username - The username of the user attempting to log in.
 * @param {string} password - The user's password.
 * @returns {Promise<LoginResponse>} A promise that resolves to the login response data if
 *   successful.
 * @throws {Error} If the authentication request fails.
 */
export async function authenticateUser(username: string, password: string): Promise<LoginResponse> {
  try {
    const authenticatedUser = await axios.post<LoginResponse>(env.VITE_LOGIN_API_URL, {
      username,
      password,
    })
    return authenticatedUser.data
  } catch (error) {
    console.error('Failed to authenticate user:', error)
    throw new Error('Failed to authenticate user')
  }
}

/**
 * Creates a new delivery entry.
 *
 * @param {NewDeliveryFormSchema} delivery - The delivery details.
 * @returns {Promise<void>} Resolves when the delivery entry is created.
 */
export async function createDeliveryEntry(delivery: NewDeliveryFormSchema): Promise<void> {
  await apiRequest({
    url: env.VITE_DELIVERY_API_URL,
    action: 'add',
    additionalData: {
      supplier: Number(delivery.supplier),
      date_request: format(delivery.date_request, 'yyyy-MM-dd'),
      date_order: format(delivery.date_request, 'yyyy-MM-dd'),
      date_delivered: format(delivery.date_request, 'yyyy-MM-dd'),
      date_received: format(delivery.date_request, 'yyyy-MM-dd'),
      grand_total: 0,
      remarks: delivery.remarks,
      status: 2,
      items: delivery.items,
    },
  })
}

/**
 * Creates a new daily count entry.
 *
 * @param {NewDailyCountFormSchema} dailyCount - The daily count details.
 * @returns {Promise<void>} Resolves when the entry is created.
 */
export async function createDailyCountEntry(dailyCount: NewDailyCountFormSchema): Promise<void> {
  await apiRequest({
    url: env.VITE_DAILY_COUNT_API_URL,
    action: 'add',
    additionalData: {
      raw_material_type: dailyCount.raw_material_type,
      date: format(dailyCount.date, 'yyyy-MM-dd'),
      items: dailyCount.items,
    },
  })
}

/**
 * Fetches all delivery entries.
 *
 * @returns {Promise<DeliveryItem[]>} A promise that resolves to an array of delivery items.
 */
export async function fetchDeliveryEntries(): Promise<DeliveryItem[]> {
  const data = await apiRequest<DeliveryResponse>({
    url: env.VITE_DELIVERY_API_URL,
    action: 'fetch',
  })
  return Array.isArray(data.data) ? data.data : []
}

/**
 * Fetches the list of suppliers.
 *
 * @returns {Promise<Supplier>} A promise that resolves to an array of suppliers.
 */
export async function getSuppliers(): Promise<Supplier> {
  const data = await apiRequest<SupplierResponse>({
    url: env.VITE_SUPPLIERS_API_URL,
    action: 'fetch',
  })
  await saveToStorage('suppliers', JSON.stringify(data.data))
  return Array.isArray(data.data) ? data.data : []
}

/**
 * Fetches all available items.
 *
 * @returns {Promise<Items>} A promise that resolves to an array of items.
 */
export async function getItems(): Promise<Items> {
  const data = await apiRequest<ItemsResponse>({
    url: env.VITE_INGREDIENTS_API_URL,
    action: 'fetch',
  })
  return Array.isArray(data.data) ? data.data : []
}

/**
 * Fetches a specific delivery record by its ID.
 *
 * @param {number} id - The delivery record ID.
 * @returns {Promise<DeliveryRecord[]>} A promise that resolves to the delivery record data.
 */
export async function getSpecificDeliveryRecord(id: number): Promise<DeliveryRecord[]> {
  const data = await apiRequest<DeliveryResponse>({
    url: env.VITE_DELIVERY_API_URL,
    action: 'fetch',
    additionalData: { id },
  })
  return Array.isArray(data.data) ? data.data : []
}

/**
 * Fetches daily count entries for the current user and branch.
 *
 * @returns {Promise<DailyCountData[]>} A promise that resolves to an array of daily count entries.
 * @throws {Error} If the API request fails.
 */
export async function fetchDailyCountEntries(): Promise<DailyCountData[]> {
  const data = await apiRequest<DailyCountResponse>({
    url: env.VITE_DAILY_COUNT_API_URL,
    action: 'fetch',
  })
  return Array.isArray(data.data) ? data.data : []
}

/**
 * Fetches waste data entries for the current user and branch.
 *
 * @returns {Promise<WasteData[]>} A promise that resolves to an array of waste data entries.
 * @throws {Error} If the API request fails.
 */
export async function fetchWasteEntries(): Promise<WasteData[]> {
  const data = await apiRequest<WasteResponse>({
    url: env.VITE_WASTE_API_URL,
    action: 'fetch',
  })
  return Array.isArray(data.data) ? data.data : []
}

/**
 * Fetches a specific delivery record by its ID.
 *
 * @param {number} id - The delivery record ID.
 * @returns {Promise<DeliveryRecord[]>} A promise that resolves to the delivery record data.
 */
export async function getSpecificDailyCountRecordById(id: number): Promise<DailyCountRecord[]> {
  const data = await apiRequest<DailyCountRecordResponse>({
    url: env.VITE_DAILY_COUNT_API_URL,
    action: 'fetch',
    additionalData: { id },
  })
  return Array.isArray(data.data) ? data.data : []
}

/**
 * Fetches product categories for the current user and branch.
 *
 * The fetched categories are also saved to local storage for caching purposes.
 *
 * @returns {Promise<Categories[]>} A promise that resolves to an array of category objects.
 * @throws {Error} If the API request fails.
 */
export async function fetchCategories(): Promise<Categories[]> {
  const data = await apiRequest<CategoriesResponse>({
    url: env.VITE_CATEGORIES_API_URL,
    action: 'fetch',
  })
  await saveToStorage('categories', JSON.stringify(data.data))
  return Array.isArray(data.data) ? data.data : []
}

/**
 * Fetches a list of ingredients filtered by category.
 *
 * @param {string} category - The category of ingredients to fetch.
 * @returns {Promise<Ingredients[]>} A promise that resolves to an array of ingredients.
 * @throws {Error} If the API request fails.
 */
export async function getIngredientsByCategory(category: string): Promise<Ingredients[]> {
  const data = await apiRequest<IngredientsResponse>({
    url: env.VITE_INGREDIENTS_API_URL,
    action: 'fetch',
    additionalData: {
      category,
    },
  })
  return Array.isArray(data.data) ? data.data : []
}

/**
 * Edits an existing delivery record.
 *
 * @param {number} id - The ID of the delivery record.
 * @param {EditDeliveryFormSchema} delivery - The updated delivery details.
 * @returns {Promise<void>} Resolves when the record is updated.
 */
export async function updateDeliveryRecord(
  id: number,
  delivery: EditDeliveryFormSchema,
): Promise<void> {
  await apiRequest({
    url: env.VITE_DELIVERY_API_URL,
    action: 'edit',
    additionalData: {
      id,
      supplier: Number(delivery.supplier),
      date_request: format(delivery.date_request, 'yyyy-MM-dd'),
      date_order: format(delivery.date_request, 'yyyy-MM-dd'),
      date_delivered: format(delivery.date_request, 'yyyy-MM-dd'),
      date_received: format(delivery.date_request, 'yyyy-MM-dd'),
      grand_total: 0,
      remarks: delivery.remarks,
      status: 2,
      items: delivery.items,
    },
  })
}

/**
 * Updates an existing daily count record in the database.
 *
 * @param {number} id - The unique identifier of the daily count record to update.
 * @param {NewDailyCountFormSchema} dailyCount - The updated daily count data.
 * @returns {Promise<void>} Resolves when the update request is successful.
 * @throws {Error} If the API request fails.
 */
export async function updateDailyCountRecord(
  id: number,
  dailyCount: NewDailyCountFormSchema,
): Promise<void> {
  await apiRequest({
    url: env.VITE_DAILY_COUNT_API_URL,
    action: 'edit',
    additionalData: {
      id,
      raw_material_type: dailyCount.raw_material_type,
      date: format(dailyCount.date, 'yyyy-MM-dd'),
      items: dailyCount.items,
    },
  })
}

/**
 * Deletes a delivery record by ID.
 *
 * @param {number} id - The ID of the record to delete.
 * @returns {Promise<void>} Resolves when the record is deleted.
 */
export async function deleteDeliveryRecord(id: number): Promise<void> {
  await apiRequest({ url: env.VITE_DELIVERY_API_URL, action: 'delete', additionalData: { id } })
}

/**
 * Deletes a daily count record by ID.
 *
 * @param {number} id - The ID of the record to delete.
 * @returns {Promise<void>} Resolves when the record is deleted.
 */
export async function deleteDailyCountRecordById(id: number): Promise<void> {
  await apiRequest({ url: env.VITE_DAILY_COUNT_API_URL, action: 'delete', additionalData: { id } })
}
