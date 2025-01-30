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

export interface DeliveryItem {
  id: number
  branch_id: number
  branch: string
  date_request: string
  date_order: string
  date_delivered: string
  date_received: string
  grand_total: number
  remarks: string
  status: number
  count: number
  total_amount: number
}
