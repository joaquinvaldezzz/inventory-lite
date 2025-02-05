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
