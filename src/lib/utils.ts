import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges multiple class names into a single string.
 *
 * This function takes any number of class name inputs, processes them using `clsx`, and then merges
 * them using `twMerge` to ensure that Tailwind CSS classes are combined correctly.
 *
 * @param {...ClassValue[]} inputs - The class names to merge. These can be strings, arrays, or
 *   objects.
 * @returns {string} The merged class names as a single string.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/**
 * Formats a given number as a currency string in Philippine Peso (PHP).
 *
 * @param int - The number to format as currency.
 * @returns {string} A string representing the formatted currency.
 */
export function formatAsCurrency(int: number): string {
  const PHP = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  })

  return PHP.format(int)
}
