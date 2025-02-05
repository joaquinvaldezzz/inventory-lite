/* eslint-disable complexity -- Safe to disable for this file */
import axios from 'axios'
import { format } from 'date-fns'

import { getCurrentUser, getUserSelectedBranch } from './dal'
import { env } from './env'
import type { AddDeliveryItem, Delivery, DeliveryItem } from './types'

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
 * @param {AddDeliveryItem} delivery - The delivery item details to be added.
 * @returns {Promise<void>} A promise that resolves when the delivery entry is successfully created.
 * @throws {Error} If the user is not found or the branch is not selected, or if there is an error
 *   creating the delivery entry.
 */
export async function createDeliveryEntry(delivery: AddDeliveryItem): Promise<void> {
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
    action: 'add',

    supplier: Number(delivery.supplier),
    date_request: format(delivery.date_request, 'yyyy-MM-dd'),
    date_order: format(delivery.date_request, 'yyyy-MM-dd'),
    date_delivered: format(delivery.date_request, 'yyyy-MM-dd'),
    date_received: format(delivery.date_request, 'yyyy-MM-dd'),
    grand_total: 0,
    remarks: delivery.remarks,
    status: 2,

    // This is a dummy item for testing purposes
    items: [
      {
        item: 2,
        quantity_po: 1.0,
        quantity_actual: 1.0,
        unit_po: '',
        quantity_dr: 2.0,
        unit_dr: '',
        price: 100.0,
        total_amount: 100.0,
      },
    ],
  })

  try {
    const request = await axios.post<AddDeliveryItem>(env.VITE_DELIVERY_API_URL, data)
    console.log('Delivery entry created:', request.data)
  } catch (error) {
    console.error('Error creating delivery entry:', error)
    throw new Error('Error creating delivery entry')
  }
}
