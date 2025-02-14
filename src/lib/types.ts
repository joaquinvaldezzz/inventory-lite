export interface LoginResponse {
  success: boolean
  message: string
  data: {
    token: string
    user: {
      id: string
      name: string
      email: string
      level: string
      branches: [
        {
          id: string
          branch: string
        },
      ]
    }
  }
}

export interface Branch {
  id: string | number
  branch: string
}

export interface DeliveryResponse {
  success: boolean
  message: string
  data: {
    id: number
    po_no: string
    dr_no: string
    branch_id: number
    branch: string
    supplier_id: number
    supplier_name: string
    date_request: string
    date_order: string
    date_delivered: string
    remarks: string
    status_id: number
    status: string
    count: number
    total_amount: number
  }
}

export type DeliveryItem = DeliveryResponse['data']

export interface AddDeliveryItem {
  supplier: number
  date_request: string
  date_order: string
  date_delivered: string
  date_received: string
  grand_total: number
  remarks: string
  status: number
  items: Array<{
    item: number
    quantity_po: number
    quantity_actual: number
    unit_po: string
    quantity_dr: number
    unit_dr: string
    price: number
    total_amount: number
  }>
}

export interface DeliveryRecord {
  id: number
  po_no: string
  dr_no: string
  branch_id: number
  branch: string
  supplier_id: number
  supplier_name: string
  date_request: string
  date_order: string
  date_delivered: string
  remarks: string
  status_id: number
  status: string
  count: number
  total_amount: number
  items: Array<{
    id: number
    purchase_id: number
    date_request: string
    date_order: string
    date_delivered: string
    date_received: string
    branch_id: number
    branch: string
    supplier_id: number
    supplier_name: string
    item_id: number
    barcode: string
    raw_material: string
    raw_material_type_id: number
    raw_material_type: string
    sku: string
    packaging: string
    quantity_po: number
    quantity_actual: number
    unit_po: string
    quantity_dr: number
    unit_dr: string
    quantity: number
    unit: string
    price: number
    total_amount: number
    remarks: string
    status: number
  }>
}

/** Represents a supplier response. */
export interface SupplierResponse {
  /** Indicates if the request was successful. */
  success: boolean

  /** Message associated with the response. */
  message: string

  /** Array of supplier data. */
  data: Array<{
    /** Unique identifier for the supplier. */
    id: number

    /** Name of the supplier. */
    supplier_name: string

    /** Last name of the supplier. */
    lastname: string

    /** First name of the supplier. */
    firstname: string

    /** Middle name of the supplier. */
    middlename: string

    /** Address of the supplier. */
    address: string

    /** Mobile phone number of the supplier. */
    mobile: string

    /** Landline phone number of the supplier. */
    landline: string

    /** Email address of the supplier. */
    email: string

    /** Tax Identification Number of the supplier. */
    tin: string

    /**
     * VAT type of the supplier.
     *
     * @default 'NON-VAT'
     */
    vat_type: 'NON-VAT'

    /**
     * Currency used by the supplier.
     *
     * @default 'PHP'
     */
    currency: 'PHP'
  }>
}

/**
 * Represents a Supplier type which is derived from the 'data' property of the SupplierResponse
 * type.
 */
export type Supplier = SupplierResponse['data']

export interface ItemsResponse {
  success: boolean
  message: string
  data: Array<{
    id: number
    barcode: string
    raw_material: string
    raw_material_type: number
    sku: string
    unit: string
    packaging: string
    raw_material_location: string
    delivery_lead_time: string
    minimum_stock_level: number
    maximum_stock_level: number
    initial_stock_level: number
  }>
}

export type Items = ItemsResponse['data']

export interface DailyCountResponse {
  success: boolean
  message: string
  data: {
    id: number
    branch_id: number
    branch: string
    branch_name: string
    raw_material_type_id: number
    raw_material_type: string
    date: string
    timestamp: string
  }
}

export type DailyCountData = DailyCountResponse['data']

export interface CategoriesResponse {
  success: boolean
  message: string
  data: {
    id: number
    raw_material_type: string
  }
}

export type Categories = CategoriesResponse['data']

export interface IngredientsResponse {
  success: boolean
  message: string
  data: {
    id: number
    barcode: string
    raw_material: string
    raw_material_type: number
    sku: string
    unit: string
    packaging: string
    raw_material_location: string
    delivery_lead_time: string
    minimum_stock_level: number
    maximum_stock_level: number
    initial_stock_level: number
  }
}

export type Ingredients = IngredientsResponse['data']
