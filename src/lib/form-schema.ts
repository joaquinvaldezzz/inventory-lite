import { z } from 'zod'

export const loginFormSchema = z.object({
  username: z
    .string()
    .min(4, { message: 'Username must be at least 4 characters long.' })
    .max(64, { message: 'Username cannot exceed 64 characters.' })
    .trim(),
  password: z
    .string()
    .min(4, { message: 'Password must be at least 4 characters long.' })
    .max(64, { message: 'Password cannot exceed 64 characters.' })
    .trim(),
})

export type LoginFormSchema = z.infer<typeof loginFormSchema>

export const branchSelectorFormSchema = z.object({
  branch: z.string().min(1, { message: 'Please select a branch from the list.' }).trim(),
})

export type BranchSelectorFormSchema = z.infer<typeof branchSelectorFormSchema>

export const newDeliveryFormSchema = z.object({
  supplier: z.string().min(1, { message: 'Please select a supplier from the list.' }).trim(),
  date_request: z.coerce.date({ message: 'Please select a date.' }),
  remarks: z
    .string()
    .max(256, { message: 'Remarks must not exceed 256 characters.' })
    .trim()
    .optional(),
  items: z.array(
    z.object({
      ingredient: z
        .string()
        .min(1, { message: 'Please select an ingredient from the list.' })
        .trim(),
      quantity: z.coerce.number().min(0.01, { message: 'Quantity must be greater than zero.' }),
      unit: z.string().min(1, { message: 'Please select a unit from the list.' }).trim(),
      unit_price: z.coerce.number().min(0.01, { message: 'Unit price must be greater than zero.' }),
      total_amount: z.coerce
        .number()
        .min(0.01, { message: 'Total amount must be greater than zero.' }),
    }),
  ),
})

export type NewDeliveryFormSchema = z.infer<typeof newDeliveryFormSchema>
