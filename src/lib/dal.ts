import { getFromStorage } from "./storage";
import type { Branch, LoginResponse } from "./types";

/**
 * Retrieves the current user from storage.
 *
 * @returns Resolves to the current user's login data if found, otherwise null.
 */
export async function getCurrentUser(): Promise<LoginResponse | null> {
  try {
    const currentUser = await getFromStorage("currentUser");

    if (currentUser == null) return null;

    const parsedCurrentUser = JSON.parse(currentUser) as unknown;

    if (parsedCurrentUser != null && typeof parsedCurrentUser === "object") {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- We know the type is correct
      return parsedCurrentUser as LoginResponse;
    }
  } catch (error) {
    throw new Error("Error parsing `currentUser` from storage");
  }

  return null;
}

/**
 * Retrieves the branches associated with the current user.
 *
 * @returns Resolves to an array of branches, or an empty array if not found.
 */
export async function fetchUserBranches(): Promise<Branch[]> {
  const currentUser = await getCurrentUser();
  return currentUser?.data.user.branches ?? [];
}

/**
 * Retrieves the branch selected by the current user.
 *
 * @returns Resolves to the selected branch ID, or null if not found.
 */
export async function getUserSelectedBranch(): Promise<number | null> {
  try {
    const selectedBranch = await getFromStorage("currentBranch");

    if (selectedBranch == null) return null;

    const branch = JSON.parse(selectedBranch) as unknown;

    if (branch != null && typeof branch === "object") {
      return Number(Object.values(branch)[0]);
    }
  } catch (error) {
    throw new Error("Error parsing `currentBranch` from storage");
  }

  return null;
}
