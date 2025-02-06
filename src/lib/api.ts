/* eslint-disable complexity -- Safe to disable for this file */
import axios from 'axios'
import { format } from 'date-fns'

import { getCurrentUser, getUserSelectedBranch } from './dal'
import { env } from './env'
import type { NewDeliveryFormSchema } from './form-schema'
import type { Delivery, DeliveryItem, Supplier, SupplierResponse } from './types'

if (env.VITE_DELIVERY_API_URL.length === 0) {
  throw new Error('API URL is not defined')
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

  const data = JSON.stringify({
    user_id: user.value.data.user.id,
    token: user.value.data.token,
    branch,
    action: 'fetch',
  })

  try {
    const request = await axios.post<Delivery>(env.VITE_DELIVERY_API_URL, data)
    return Array.isArray(request.data.data) ? request.data.data : []
  } catch (error) {
    console.error('Error fetching delivery entries:', error)
    throw new Error('Error fetching delivery entries')
  }
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
    branch,
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
    const request = await axios.post<NewDeliveryFormSchema>(
      env.VITE_DELIVERY_API_URL,
      deliveryEntryDetails,
    )
    console.log('Delivery entry created:', request.data)
  } catch (error) {
    console.error('Error creating delivery entry:', error)
    throw new Error('Error creating delivery entry')
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
    return Array.isArray(request.data.data) ? request.data.data : []
  } catch (error) {
    console.error('Error fetching suppliers:', error)
    throw new Error('Error fetching suppliers')
  }
}
