/**
 * Flattens a TypeScript type for improved readability.
 *
 * TypeScript sometimes displays deeply nested or extended types in a complex way. `Prettify<T>`
 * simplifies and flattens the type, making it easier to read in editor tooltips.
 *
 * @template T - The type to be prettified.
 */
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

/**
 * Generic structure for API responses.
 *
 * @template T - The type of the `data` property in the response.
 */
interface APIResponse<T> {
  /** Indicates whether the API request was successful. */
  success: boolean;

  /** Message describing the result of the API request. */
  message: string;

  /** The actual data returned by the API. */
  data: T;
}

/** API response for a successful forgot password attempt. */
export type ForgotPasswordResponse = Prettify<APIResponse<string>>;
