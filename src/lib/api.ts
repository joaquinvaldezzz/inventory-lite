import axios from "axios";
import { format } from "date-fns";

import { getCurrentUser, getUserSelectedBranch } from "./dal";
import { env } from "./env";
import type {
  EditDeliveryFormSchema,
  NewDailyCountFormSchema,
  NewDeliveryFormSchema,
  NewWasteFormSchema,
} from "./form-schema";
import { saveToStorage } from "./storage";
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
  EmployeeData,
  EmployeesResponse,
  ExpensesRecordsResponse,
  Ingredients,
  IngredientsResponse,
  Items,
  ItemsResponse,
  LoginResponse,
  Supplier,
  SupplierResponse,
  WasteData,
  WasteRecordData,
  WasteRecordResponse,
  WasteResponse,
} from "./types";

if (env.VITE_DELIVERY_API_URL.length === 0) {
  throw new Error("API URL is not defined");
}

/** Represents a user session containing authentication details. */
interface UserSession {
  userId: string;
  token: string;
  branch: number;
}

/** Configuration object for API requests. */
interface ApiRequestConfig {
  url: string;
  action?: string;
  additionalData?: Record<string, unknown>;
}

/**
 * Retrieves the current user session (user ID, token, branch).
 *
 * @returns A promise that resolves to user session details.
 * @throws {Error} If the user or branch is not found.
 */
async function getUserSession(): Promise<UserSession> {
  const [user, branch] = await Promise.allSettled([getCurrentUser(), getUserSelectedBranch()]);

  if (user.status !== "fulfilled" || branch.status !== "fulfilled") {
    throw new Error("User not found or branch not selected");
  }

  if (user.value === null || branch.value === null) {
    throw new Error("User or branch not found");
  }

  return {
    userId: user.value.data.user.id,
    token: user.value.data.token,
    branch: branch.value,
  };
}

/**
 * Sends an API request with the given configuration.
 *
 * @template T The expected response type.
 * @param config The API request configuration.
 * @param config.url The URL of the API endpoint.
 * @param config.action The action to perform.
 * @param config.additionalData Additional data to include in the request.
 * @returns A promise that resolves to the response data.
 * @throws {Error} If the API request fails.
 */
async function apiRequest<T>({ url, action, additionalData = {} }: ApiRequestConfig): Promise<T> {
  const { userId, token, branch } = await getUserSession();

  const requestData = {
    user_id: userId,
    token,
    branch,
    action,
    ...additionalData,
  };

  try {
    const response = await axios.post<T>(url, requestData);
    return response.data;
  } catch (error) {
    // console.error(`API request failed (${action}):`, error);
    throw new Error(`Failed to ${action} data`);
  }
}

/**
 * Authenticates a user by sending their credentials to the login API.
 *
 * @param username The username of the user attempting to log in.
 * @param password The user's password.
 * @returns A promise that resolves to the login response data if successful.
 * @throws {Error} If the authentication request fails.
 */
export async function authenticateUser(username: string, password: string): Promise<LoginResponse> {
  try {
    const authenticatedUser = await axios.post<LoginResponse>(env.VITE_LOGIN_API_URL, {
      username,
      password,
    });
    return authenticatedUser.data;
  } catch (error) {
    // console.error("Failed to authenticate user:", error);
    throw new Error("Failed to authenticate user");
  }
}

/**
 * Checks if the user token is valid by making an API request to the delivery API.
 *
 * @returns A promise that resolves to `true` if the token is valid, otherwise `false`.
 * @throws An error if the API request fails.
 */
export async function checkIfUserTokenIsValid(): Promise<boolean> {
  try {
    const request = await apiRequest<DeliveryResponse>({
      url: env.VITE_DELIVERY_API_URL,
      action: "fetch",
    });

    if (request.success) {
      return true;
    }
  } catch (error) {
    throw new Error("Failed to check if user token is valid");
  }

  return false;
}

/**
 * Creates a new delivery entry.
 *
 * @param delivery The delivery details.
 * @returns Resolves when the delivery entry is created.
 */
export async function createDeliveryEntry(delivery: NewDeliveryFormSchema): Promise<void> {
  await apiRequest({
    url: env.VITE_DELIVERY_API_URL,
    action: "add",
    additionalData: {
      supplier: Number(delivery.supplier),
      date_request: format(delivery.date_request, "yyyy-MM-dd"),
      date_order: format(delivery.date_request, "yyyy-MM-dd"),
      date_delivered: format(delivery.date_request, "yyyy-MM-dd"),
      date_received: format(delivery.date_request, "yyyy-MM-dd"),
      payment_type: Number(delivery.payment_type),
      remarks: delivery.remarks,
      status: 2,
      items: delivery.items,
    },
  });
}

/**
 * Creates a new daily count entry.
 *
 * @param dailyCount The daily count details.
 * @returns Resolves when the entry is created.
 */
export async function createDailyCountEntry(dailyCount: NewDailyCountFormSchema): Promise<void> {
  await apiRequest({
    url: env.VITE_DAILY_COUNT_API_URL,
    action: "add",
    additionalData: {
      raw_material_type: dailyCount.raw_material_type,
      date: format(dailyCount.date, "yyyy-MM-dd"),
      items: dailyCount.items,
    },
  });
}

/**
 * Creates a new waste entry by sending a request to the waste API.
 *
 * @param waste The waste data to be submitted.
 * @returns A promise that resolves when the waste entry is successfully created.
 * @throws {Error} Throws an error if the API request fails.
 */
export async function createWasteEntry(waste: NewWasteFormSchema): Promise<void> {
  await apiRequest({
    url: env.VITE_WASTE_API_URL,
    action: "add",
    additionalData: {
      raw_material_type: waste.raw_material_type,
      waste_type: waste.waste_type,
      date: format(waste.date, "yyyy-MM-dd"),
      items: waste.items,
    },
  });
}

/**
 * Fetches all delivery entries.
 *
 * @returns A promise that resolves to an array of delivery items.
 */
export async function fetchDeliveryEntries(): Promise<DeliveryItem[]> {
  const data = await apiRequest<DeliveryResponse>({
    url: env.VITE_DELIVERY_API_URL,
    action: "fetch",
  });
  return Array.isArray(data.data) ? data.data : [];
}

/**
 * Fetches the list of suppliers.
 *
 * @returns A promise that resolves to an array of suppliers.
 */
export async function getSuppliers(): Promise<Supplier> {
  const data = await apiRequest<SupplierResponse>({
    url: env.VITE_SUPPLIERS_API_URL,
    action: "fetch",
  });
  await saveToStorage("suppliers", JSON.stringify(data.data));
  return Array.isArray(data.data) ? data.data : [];
}

/**
 * Fetches all available items.
 *
 * @returns A promise that resolves to an array of items.
 */
export async function getItems(): Promise<Items> {
  const data = await apiRequest<ItemsResponse>({
    url: env.VITE_INGREDIENTS_API_URL,
    action: "fetch",
  });
  return Array.isArray(data.data) ? data.data : [];
}

/**
 * Fetches a specific delivery record by its ID.
 *
 * @param id The delivery record ID.
 * @returns A promise that resolves to the delivery record data.
 */
export async function getSpecificDeliveryRecord(id: number): Promise<DeliveryRecord[]> {
  const data = await apiRequest<DeliveryResponse>({
    url: env.VITE_DELIVERY_API_URL,
    action: "fetch",
    additionalData: { id },
  });
  return Array.isArray(data.data) ? data.data : [];
}

/**
 * Fetches daily count entries for the current user and branch.
 *
 * @returns A promise that resolves to an array of daily count entries.
 * @throws {Error} If the API request fails.
 */
export async function fetchDailyCountEntries(): Promise<DailyCountData[]> {
  const data = await apiRequest<DailyCountResponse>({
    url: env.VITE_DAILY_COUNT_API_URL,
    action: "fetch",
  });
  return Array.isArray(data.data) ? data.data : [];
}

/**
 * Fetches waste data entries for the current user and branch.
 *
 * @returns A promise that resolves to an array of waste data entries.
 * @throws {Error} If the API request fails.
 */
export async function fetchWasteEntries(): Promise<WasteData[]> {
  const data = await apiRequest<WasteResponse>({
    url: env.VITE_WASTE_API_URL,
    action: "fetch",
  });
  return Array.isArray(data.data) ? data.data : [];
}

/**
 * Fetches employees from the API endpoint.
 *
 * @returns A promise that resolves to an array of employees.
 * @throws {Error} If the API request fails.
 */
export async function fetchEmployees(): Promise<EmployeeData[]> {
  const data = await apiRequest<EmployeesResponse>({
    url: env.VITE_EMPLOYEES_API_URL,
    action: "fetch",
  });
  return Array.isArray(data.data) ? data.data : [];
}

/**
 * Fetches product categories for the current user and branch.
 *
 * The fetched categories are also saved to local storage for caching purposes.
 *
 * @returns A promise that resolves to an array of category objects.
 * @throws {Error} If the API request fails.
 */
export async function fetchCategories(): Promise<Categories[]> {
  const data = await apiRequest<CategoriesResponse>({
    url: env.VITE_CATEGORIES_API_URL,
    action: "fetch",
  });
  await saveToStorage("categories", JSON.stringify(data.data));
  return Array.isArray(data.data) ? data.data : [];
}

/**
 * Fetches the list of expense records from the API.
 *
 * This function sends a request to the expenses API endpoint and retrieves the data. If the
 * response contains an array of expense records, it returns the array. Otherwise, it returns an
 * empty array.
 *
 * @returns A promise that resolves to an array of expense records. If the response data is not an
 *   array, an empty array is returned.
 * @throws {Error} If the API request fails or encounters an error.
 */
export async function fetchExpenses() {
  const data = await apiRequest<ExpensesRecordsResponse>({
    url: env.VITE_EXPENSES_API_URL,
    action: "fetch",
  });
  return Array.isArray(data.data) ? data.data : [];
}

/**
 * Fetches a specific daily count record by its ID.
 *
 * @param id The daily count record ID.
 * @returns A promise that resolves to the daily count record data.
 */
export async function getSpecificDailyCountRecordById(id: number): Promise<DailyCountRecord[]> {
  const data = await apiRequest<DailyCountRecordResponse>({
    url: env.VITE_DAILY_COUNT_API_URL,
    action: "fetch",
    additionalData: { id },
  });
  return Array.isArray(data.data) ? data.data : [];
}

/**
 * Fetches a specific waste record by its ID.
 *
 * @param id The waste record ID.
 * @returns A promise that resolves to the waste record data.
 */
export async function getSpecificWastesRecordById(id: number): Promise<WasteRecordData[]> {
  const data = await apiRequest<WasteRecordResponse>({
    url: env.VITE_WASTE_API_URL,
    action: "fetch",
    additionalData: { id },
  });
  return Array.isArray(data.data) ? data.data : [];
}

/**
 * Fetches a list of ingredients filtered by category.
 *
 * @param category The category of ingredients to fetch.
 * @returns A promise that resolves to an array of ingredients.
 * @throws {Error} If the API request fails.
 */
export async function getIngredientsByCategory(category: string): Promise<Ingredients[]> {
  const data = await apiRequest<IngredientsResponse>({
    url: env.VITE_INGREDIENTS_API_URL,
    action: "fetch",
    additionalData: {
      category,
    },
  });
  return Array.isArray(data.data) ? data.data : [];
}

/**
 * Edits an existing delivery record.
 *
 * @param id The ID of the delivery record.
 * @param delivery The updated delivery details.
 * @returns Resolves when the record is updated.
 */
export async function updateDeliveryRecord(
  id: number,
  delivery: EditDeliveryFormSchema,
): Promise<void> {
  await apiRequest({
    url: env.VITE_DELIVERY_API_URL,
    action: "edit",
    additionalData: {
      id,
      supplier: Number(delivery.supplier),
      date_request: format(delivery.date_request, "yyyy-MM-dd"),
      date_order: format(delivery.date_request, "yyyy-MM-dd"),
      date_delivered: format(delivery.date_request, "yyyy-MM-dd"),
      date_received: format(delivery.date_request, "yyyy-MM-dd"),
      payment_type: Number(delivery.payment_type),
      remarks: delivery.remarks,
      status: 2,
      items: delivery.items,
    },
  });
}

/**
 * Updates an existing daily count record in the database.
 *
 * @param id The unique identifier of the daily count record to update.
 * @param dailyCount The updated daily count data.
 * @returns Resolves when the update request is successful.
 * @throws {Error} If the API request fails.
 */
export async function updateDailyCountRecord(
  id: number,
  dailyCount: NewDailyCountFormSchema,
): Promise<void> {
  await apiRequest({
    url: env.VITE_DAILY_COUNT_API_URL,
    action: "edit",
    additionalData: {
      id,
      raw_material_type: dailyCount.raw_material_type,
      date: format(dailyCount.date, "yyyy-MM-dd"),
      items: dailyCount.items,
    },
  });
}

/**
 * Updates an existing waste record in the database.
 *
 * @param id The unique identifier of the waste record to update.
 * @param data The updated waste data.
 * @returns Resolves when the update request is successful.
 * @throws {Error} If the API request fails.
 */
export async function updateWasteRecord(id: number, data: NewWasteFormSchema): Promise<void> {
  await apiRequest({
    url: env.VITE_WASTE_API_URL,
    action: "edit",
    additionalData: {
      id,
      raw_material_type: data.raw_material_type,
      waste_type: data.waste_type,
      date: format(data.date, "yyyy-MM-dd"),
      items: data.items,
    },
  });
}

/**
 * Deletes a delivery record by ID.
 *
 * @param id The ID of the record to delete.
 * @returns Resolves when the record is deleted.
 */
export async function deleteDeliveryRecord(id: number): Promise<void> {
  await apiRequest({ url: env.VITE_DELIVERY_API_URL, action: "delete", additionalData: { id } });
}

/**
 * Deletes a daily count record by ID.
 *
 * @param id The ID of the record to delete.
 * @returns Resolves when the record is deleted.
 */
export async function deleteDailyCountRecordById(id: number): Promise<void> {
  await apiRequest({ url: env.VITE_DAILY_COUNT_API_URL, action: "delete", additionalData: { id } });
}

/**
 * Deletes a waste record by ID.
 *
 * @param id The ID of the record to delete.
 * @returns Resolves when the record is deleted.
 */
export async function deleteWasteRecordById(id: number): Promise<void> {
  await apiRequest({ url: env.VITE_WASTE_API_URL, action: "delete", additionalData: { id } });
}

/**
 * Logs out the current user by sending a POST request to the logout API endpoint.
 *
 * @throws {Error} If the logout request fails.
 */
export async function executeLogout() {
  const { userId, token } = await getUserSession();

  try {
    await axios.post(env.VITE_LOGOUT_API_URL, { user_id: userId, token });
  } catch (error) {
    throw new Error("Failed to log out");
  }
}
