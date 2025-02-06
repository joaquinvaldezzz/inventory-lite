export interface LoginResult {
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

export interface Delivery {
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

export type DeliveryItem = Delivery['data']

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
