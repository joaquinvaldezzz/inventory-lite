import axios from 'axios'

import { env } from './env'
import type { Delivery, DeliveryItem } from './types'

/**
 * Fetches delivery entries from the API.
 *
 * @returns {Promise<DeliveryItem[]>} A promise that resolves to an array of delivery items. If the
 *   fetch fails or no items are found, it resolves to an empty array.
 * @throws {Error} Throws an error if the API URL is not defined or if the request fails.
 */
export async function getDeliveryEntries(): Promise<DeliveryItem[]> {
  const data = JSON.stringify({
    user_id: 29,
    token: 'MDQzOWRmMjQxZDY0YjE4ZjZhNzYxZTIxODc4YjcxNzY=',
    branch: 22,
    action: 'fetch',
  })

  if (env.VITE_DELIVERY_API_URL.length === 0) {
    throw new Error('API URL is not defined')
  }

  try {
    const request = await axios.post<Delivery>(env.VITE_DELIVERY_API_URL, data)
    return Array.isArray(request.data.data) ? request.data.data : []
  } catch (error) {
    console.error('Error fetching delivery entries:', error)
    throw new Error('Error fetching delivery entries')
  }
}
