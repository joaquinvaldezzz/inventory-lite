import type { APIResponse, Prettify } from "./utils";

/** Represents a delivery record used in a table. */
export interface DeliveryRecordData {
  id: number;
  po_no: string;
  dr_no: string | null;
  branch_id: number;
  branch: string;
  supplier_id: number;
  supplier_name: string;
  date_request: string;
  date_order: string;
  date_delivered: string;
  payment_type_id: number;
  payment_type: string;
  remarks: string;
  status_id: number;
  status: string;
  count: number;
  total_amount: number;
}

/** Represents a delivery record retrieved by `id` for use in a form. */
export type DeliveryFormData = DeliveryRecordData & {
  items: Array<{
    id: number;
    purchase_id: number;
    date_request: string;
    date_order: string;
    date_delivered: string;
    date_received: string;
    branch_id: number;
    branch: string;
    supplier_id: number;
    supplier_name: string;
    item_id: number;
    barcode: string;
    raw_material: string;
    raw_material_type_id: number;
    raw_material_type: string;
    sku: string;
    packaging: string;
    quantity_po: number;
    quantity_actual: number;
    unit_po: string;
    quantity_dr: number;
    unit_dr: string;
    quantity: number;
    unit: string;
    price: number;
    total_amount: number;
    remarks: string;
    status: number;
  }>;
};

/** API response type for retrieving a list of delivery records. */
export type DeliveryRecordListResponse = Prettify<APIResponse<DeliveryRecordData[]>>;

/** API response type for retrieving a single delivery record by `id` for use in a form. */
export type DeliveryRecordResponse = Prettify<APIResponse<DeliveryFormData[]>>;

/** API request type for adding a delivery record, used in a form. */
export interface DeliveryFormInput {
  supplier: number;
  date_request: string;
  date_order: string;
  date_delivered: string;
  date_received: string;
  grand_total: number;
  remarks: string;
  status: number;
  items: Array<{
    item: number;
    quantity_po: number;
    quantity_actual: number;
    unit_po: string;
    quantity_dr: number;
    unit_dr: string;
    price: number;
    total_amount: number;
  }>;
}
