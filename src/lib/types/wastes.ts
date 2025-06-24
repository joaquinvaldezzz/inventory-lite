import type { DeliveryItem } from "./delivery";
import type { APIResponse, Prettify } from "./utils";

/** Represents a waste record used in a table. */
export interface WasteTableData {
  id: number;
  branch_id: number;
  branch: string;
  branch_name: string;
  waste_type: string;
  raw_material_type_id: number;
  raw_material_type: string;
  date: string;
}

/** Represents a waste record retrieved by `id` for use in a form. */
export type WasteFormData = WasteTableData & {
  items: Array<{
    id: number;
    inventory_waste_id: number;
    branch_id: number;
    branch: string;
    branch_name: string;
    date: string;
    raw_material_type_id: number;
    raw_material_type: string;
    item_id: number;
    barcode: string | null;
    item: string | null;
    unit: string | null;
    waste: number;
    reason: string;
    employee: string;
  }>;
};

/** A type that represents a category with its related fields. */
export interface CategoryData {
  id: number;
  raw_material_type: string;
}

/** Represents a waste item. */
export type WasteItem = DeliveryItem;

/** Represents the API response for a list of waste records. */
export type WasteRecordListResponse = Prettify<APIResponse<WasteTableData[]>>;

/** Represents the API response for a single waste record by ID, used in a form. */
export type WasteRecordResponse = Prettify<APIResponse<WasteFormData[]>>;

/** Represents the API response for a list of waste items. */
export type WasteItemListResponse = Prettify<APIResponse<WasteItem[]>>;
