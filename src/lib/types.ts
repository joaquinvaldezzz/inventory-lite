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
