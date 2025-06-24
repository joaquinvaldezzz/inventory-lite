import type { APIResponse, Prettify } from "./utils";

/** Represents a branch the user has access to. */
export interface Branch {
  id: number;
  branch: string;
}

/** Represents the data returned from a successful login request. */
export interface LoginData {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    level: string;
    access: Array<{
      module_name: string;
      read: number | null;
      write: number | null;
      edit: number | null;
      delete: number | null;
    }>;
    branches: Branch[];
  };
}

/** API response type when a user successfully logs in. */
export type LoginResponse = Prettify<APIResponse<LoginData>>;
