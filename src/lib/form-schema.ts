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
  supplier: z.string().min(1, { message: 'Supplier selection is required.' }).trim(),
  branch: z.string().min(1, { message: 'Branch selection is required.' }).trim(),
  date: z.coerce.date({ message: 'Please select a date.' }),
  remarks: z
    .string()
    .max(256, { message: 'Remarks must not exceed 256 characters.' })
    .trim()
    .optional(),
})

export type NewDeliveryFormSchema = z.infer<typeof newDeliveryFormSchema>
