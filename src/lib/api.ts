import axios from "axios";
import { format } from "date-fns";

import { getCurrentUser, getUserSelectedBranch } from "./dal";
import { env } from "./env";
import type {
  EditDeliveryFormSchema,
  NewDailyCountFormSchema,
  NewDeliveryFormSchema,
  NewExpensesFormSchema,
  NewWasteFormSchema,
} from "./form-schema";
import { saveToStorage } from "./storage";
import type { ForgotPasswordResponse } from "./types";
import type {
  CategoryData,
  CategoryListResponse,
  DailyCountFormData,
  DailyCountListResponse,
  DailyCountRecordData,
  DailyCountRecordResponse,
} from "./types/daily-count";
import type {
  DeliveryFormData,
  DeliveryItem,
  DeliveryItemListResponse,
  DeliveryRecordData,
  DeliveryRecordListResponse,
  DeliveryRecordResponse,
} from "./types/delivery";
import type { EmployeeData, EmployeeListResponse } from "./types/employee";
import type {
  ExpensesItemData,
  ExpensesItemListResponse,
  ExpensesRecordFormData,
  ExpensesRecordListResponse,
  ExpensesRecordResponse,
  ExpensesTableData,
} from "./types/expenses";
import type { LoginResponse } from "./types/login";
import type { SupplierData, SupplierListResponse } from "./types/supplier";
import type {
  WasteFormData,
  WasteItem,
  WasteItemListResponse,
  WasteRecordListResponse,
  WasteRecordResponse,
  WasteTableData,
} from "./types/wastes";

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

  if (user.value?.data == null || branch.value == null) {
    throw new Error("User or branch not found");
  }

  return {
    userId: user.value.data.user.id.toString(),
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
    throw new Error(`Failed to ${action} data`);
  }
}

/**
 * Authenticates a user by sending their credentials to the login API.
 *
 * @param email The email of the user attempting to log in.
 * @param password The user's password.
 * @returns A promise that resolves to the login response data if successful.
 * @throws {Error} If the authentication request fails.
 */
export async function authenticateUser(email: string, password: string): Promise<LoginResponse> {
  try {
    const authenticatedUser = await axios.post<LoginResponse>(env.VITE_LOGIN_API_URL, {
      email,
      password,
    });
    return authenticatedUser.data;
  } catch (error) {
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
    const request = await apiRequest<DeliveryRecordResponse>({
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
 * Sends a request to the forgot password API endpoint.
 *
 * @param email The email of the user to send the forgot password request to.
 * @returns A promise that resolves to the response data.
 * @throws {Error} If the API request fails.
 */
export async function resetPassword(email: string): Promise<ForgotPasswordResponse> {
  try {
    const response = await axios.post<ForgotPasswordResponse>(env.VITE_FORGOT_PASSWORD_API_URL, {
      email,
    });
    return response.data;
  } catch (error) {
    throw new Error("Failed to reset password");
  }
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
 * Creates a new expenses entry by sending a request to the expenses API.
 *
 * @param expenses The expenses data to be submitted.
 * @returns A promise that resolves when the expenses entry is successfully created.
 * @throws {Error} Throws an error if the API request fails.
 */
export async function createExpensesEntry(expenses: NewExpensesFormSchema): Promise<void> {
  await apiRequest({
    url: env.VITE_EXPENSES_API_URL,
    action: "add",
    additionalData: {
      date: format(expenses.date, "yyyy-MM-dd"),
      supplier: Number(expenses.supplier),
      payment_type: Number(expenses.payment_type),
      items: expenses.items,
    },
  });
}

/**
 * Fetches all delivery entries.
 *
 * @returns A promise that resolves to an array of delivery items.
 */
export async function fetchDeliveryEntries(): Promise<DeliveryRecordData[] | null> {
  const response = await apiRequest<DeliveryRecordListResponse>({
    url: env.VITE_DELIVERY_API_URL,
    action: "fetch",
  });
  return response.data;
}

/**
 * Fetches the list of suppliers.
 *
 * @returns A promise that resolves to an array of suppliers.
 */
export async function getSuppliers(): Promise<SupplierData[] | null> {
  const response = await apiRequest<SupplierListResponse>({
    url: env.VITE_SUPPLIERS_API_URL,
    action: "fetch",
  });
  await saveToStorage("suppliers", JSON.stringify(response.data));
  return response.data ?? [];
}

/**
 * Fetches all available items.
 *
 * @returns A promise that resolves to an array of items.
 */
export async function getItems(): Promise<DeliveryItem[] | null> {
  const request = await apiRequest<DeliveryItemListResponse>({
    url: env.VITE_INGREDIENTS_API_URL,
    action: "fetch",
  });
  return request.data ?? null;
}

/**
 * Fetches a specific delivery record by its ID.
 *
 * @param id The delivery record ID.
 * @returns A promise that resolves to the delivery record data or `null` if the request fails.
 */
export async function getSpecificDeliveryRecord(id: number): Promise<DeliveryFormData[] | null> {
  const response = await apiRequest<DeliveryRecordResponse>({
    url: env.VITE_DELIVERY_API_URL,
    action: "fetch",
    additionalData: { id },
  });
  return response.data ?? null;
}

/**
 * Fetches daily count entries for the current user and branch.
 *
 * @returns A promise that resolves to an array of daily count entries or `null` if the request
 *   fails.
 */
export async function fetchDailyCountEntries(): Promise<DailyCountRecordData[] | null> {
  const request = await apiRequest<DailyCountListResponse>({
    url: env.VITE_DAILY_COUNT_API_URL,
    action: "fetch",
  });
  return request.data ?? null;
}

/**
 * Fetches waste data entries for the current user and branch.
 *
 * @returns A promise that resolves to an array of waste data entries or `null` if the request
 *   fails.
 */
export async function fetchWasteEntries(): Promise<WasteTableData[] | null> {
  const request = await apiRequest<WasteRecordListResponse>({
    url: env.VITE_WASTE_API_URL,
    action: "fetch",
  });
  return request.data ?? null;
}

/**
 * Fetches employees from the API endpoint.
 *
 * @returns A promise that resolves to an array of employees.
 * @throws {Error} If the API request fails.
 */
export async function fetchEmployees(): Promise<EmployeeData[] | null> {
  const request = await apiRequest<EmployeeListResponse>({
    url: env.VITE_EMPLOYEES_API_URL,
    action: "fetch",
  });
  return request.data ?? null;
}

/**
 * Fetches product categories for the current user and branch.
 *
 * The fetched categories are also saved to local storage for caching purposes.
 *
 * @returns A promise that resolves to an array of category objects.
 * @throws {Error} If the API request fails.
 */
export async function fetchCategories(): Promise<CategoryData[] | null> {
  const data = await apiRequest<CategoryListResponse>({
    url: env.VITE_CATEGORIES_API_URL,
    action: "fetch",
  });
  await saveToStorage("categories", JSON.stringify(data.data));
  return data.data ?? [];
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
export async function fetchExpenses(): Promise<ExpensesTableData[] | null> {
  const request = await apiRequest<ExpensesRecordListResponse>({
    url: env.VITE_EXPENSES_API_URL,
    action: "fetch",
  });
  return request.data ?? null;
}

/**
 * Fetches a specific daily count record by its ID.
 *
 * @param id The daily count record ID.
 * @returns A promise that resolves to the daily count record data.
 */
export async function getSpecificDailyCountRecordById(
  id: number,
): Promise<DailyCountFormData[] | null> {
  const data = await apiRequest<DailyCountRecordResponse>({
    url: env.VITE_DAILY_COUNT_API_URL,
    action: "fetch",
    additionalData: { id },
  });
  return data.data ?? null;
}

/**
 * Fetches a specific waste record by its ID.
 *
 * @param id The waste record ID.
 * @returns A promise that resolves to the waste record data or `null` if the request fails.
 */
export async function getSpecificWastesRecordById(id: number): Promise<WasteFormData[] | null> {
  const request = await apiRequest<WasteRecordResponse>({
    url: env.VITE_WASTE_API_URL,
    action: "fetch",
    additionalData: { id },
  });
  return request.data ?? null;
}

/**
 * Fetches a list of ingredients filtered by category.
 *
 * @param category The category of ingredients to fetch.
 * @returns A promise that resolves to an array of ingredients or `null` if the request fails.
 */
export async function getIngredientsByCategory(category: string): Promise<WasteItem[] | null> {
  const request = await apiRequest<WasteItemListResponse>({
    url: env.VITE_INGREDIENTS_API_URL,
    action: "fetch",
    additionalData: {
      category,
    },
  });
  return request.data ?? null;
}

/**
 * Fetches a specific waste record by its ID.
 *
 * @param id The waste record ID.
 * @returns A promise that resolves to the waste record data.
 */
export async function getSpecificExpensesRecordById(
  id: number,
): Promise<ExpensesRecordFormData[] | null> {
  const request = await apiRequest<ExpensesRecordResponse>({
    url: env.VITE_EXPENSES_API_URL,
    action: "fetch",
    additionalData: { id },
  });
  return request.data ?? null;
}

/**
 * Fetches a list of items associated with a specific supplier ID.
 *
 * @param supplier The ID of the supplier as a string. It will be converted to a number internally.
 * @returns A promise that resolves to an array of items. If the response data is not an array, an
 *   empty array is returned.
 * @throws An error if the API request fails.
 */
export async function getItemsBySupplierId(supplier: string): Promise<ExpensesItemData[] | null> {
  const request = await apiRequest<ExpensesItemListResponse>({
    url: env.VITE_INGREDIENTS_API_URL,
    action: "fetch",
    additionalData: { supplier: Number(supplier) },
  });
  return request.data ?? null;
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
 * Updates an existing waste record in the database.
 *
 * @param id The unique identifier of the waste record to update.
 * @param data The updated waste data.
 * @returns Resolves when the update request is successful.
 * @throws {Error} If the API request fails.
 */
export async function updateExpensesRecord(id: number, data: NewExpensesFormSchema): Promise<void> {
  await apiRequest({
    url: env.VITE_EXPENSES_API_URL,
    action: "edit",
    additionalData: {
      id,
      supplier: Number(data.supplier),
      date: format(data.date, "yyyy-MM-dd"),
      payment_type: Number(data.payment_type),
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
 * Deletes an expenses record by ID.
 *
 * @param id The ID of the record to delete.
 * @returns Resolves when the record is deleted.
 */
export async function deleteExpensesRecordById(id: number): Promise<void> {
  await apiRequest({ url: env.VITE_EXPENSES_API_URL, action: "delete", additionalData: { id } });
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
