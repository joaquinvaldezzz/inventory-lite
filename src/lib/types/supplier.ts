import type { APIResponse, Prettify } from "./utils";

/** Represents a supplier. */
export interface SupplierData {
  id: number;
  supplier_name: string;
  lastname: string;
  firstname: string;
  middlename: string;
  address: string;
  mobile: string;
  landline: string;
  email: string;
  tin: string;
  vat_type: string;
  currency: string;
}

/** API response for a list of suppliers to be used in a select input. */
export type SupplierListResponse = Prettify<APIResponse<SupplierData[]>>;
