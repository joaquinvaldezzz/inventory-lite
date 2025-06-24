import type { DeliveryItem } from "./delivery";
import type { APIResponse, Prettify } from "./utils";

/** Represents data for a daily count used in a table. */
export interface DailyCountRecordData {
  id: number;
  branch_id: number;
  branch: string;
  branch_name: string;
  raw_material_type_id: number;
  raw_material_type: string;
  date: string;
  timestamp: string;
}

/** Represents a daily count retrieved by `id` for use in a form. */
export type DailyCountFormData = DailyCountRecordData & {
  items: Array<{
    id: number;
    inventory_count_id: number;
    branch_id: number;
    branch: string;
    branch_name: string;
    date: string;
    raw_material_type_id: number;
    raw_material_type: string;
    item_id: number;
    barcode: string;
    item: string;
    unit: string;
    count: number;
  }>;
};

/** A type that represents a category with its related fields. */
export interface CategoryData {
  id: number;
  raw_material_type: string;
}

/** Represents the API response for a list of daily counts. */
export type DailyCountListResponse = Prettify<APIResponse<DailyCountRecordData[]>>;

/** Represents the API response for a single daily count by ID, used in a form. */
export type DailyCountRecordResponse = Prettify<APIResponse<DailyCountFormData[]>>;

/** Represents the API response for a list of categories. */
export type CategoryListResponse = Prettify<APIResponse<CategoryData[]>>;

/** Represents the API response for a list of items. */
export type ItemListResponse = Prettify<APIResponse<DeliveryItem[]>>;
