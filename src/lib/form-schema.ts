import { z } from "zod";

export const loginFormSchema = z.object({
  username: z
    .string()
    .min(4, { message: "Username must be at least 4 characters long." })
    .max(64, { message: "Username cannot exceed 64 characters." })
    .trim(),
  password: z
    .string()
    .min(4, { message: "Password must be at least 4 characters long." })
    .max(64, { message: "Password cannot exceed 64 characters." })
    .trim(),
});

export type LoginFormSchema = z.infer<typeof loginFormSchema>;

export const pinFormSchema = z.object({
  pin: z.string().min(6, { message: "PIN must be at least 6 characters long." }).trim(),
});

export type PinFormSchema = z.infer<typeof pinFormSchema>;

export const branchSelectorFormSchema = z.object({
  branch: z.string().min(1, { message: "Please select a branch from the list." }).trim(),
});

export type BranchSelectorFormSchema = z.infer<typeof branchSelectorFormSchema>;

export const newDeliveryFormSchema = z.object({
  supplier: z.string().min(1, { message: "Please select a supplier from the list." }).trim(),
  date_request: z.coerce.date({ message: "Please select a date." }),
  payment_type: z.string().min(0, { message: "Please select a payment type." }).trim(),
  remarks: z
    .string()
    .max(256, { message: "Remarks must not exceed 256 characters." })
    .trim()
    .optional(),
  items: z.array(
    z.object({
      item: z.string().min(1, { message: "Please select an item from the list." }).trim(),
      quantity_dr: z.coerce.number().min(0.01, { message: "Quantity must be greater than zero." }),
      unit_dr: z.string().min(1, { message: "Please select a unit from the list." }).trim(),
      unit_price: z.coerce.number().min(0.01, { message: "Unit price must be greater than zero." }),
      total_amount: z.coerce
        .number()
        .min(0.01, { message: "Total amount must be greater than zero." }),
    }),
  ),
});

export type NewDeliveryFormSchema = z.infer<typeof newDeliveryFormSchema>;

export const editDeliveryFormSchema = z.object({
  supplier: z.string().min(1, { message: "Please select a supplier from the list." }).trim(),
  po_number: z.string().trim(),
  date_request: z.coerce.date({ message: "Please select a date." }),
  payment_type: z.string().min(0, { message: "Please select a payment type." }).trim(),
  remarks: z
    .string()
    .max(256, { message: "Remarks must not exceed 256 characters." })
    .trim()
    .optional(),
  items: z.array(
    z.object({
      item: z.coerce.number(),
      quantity_actual: z.coerce
        .number()
        .min(0.01, { message: "Quantity must be greater than zero." }),
      quantity_dr: z.coerce.number(),
      unit_dr: z.string().min(1, { message: "Please select a unit from the list." }).trim(),
      total_amount: z.coerce
        .number()
        .min(0.01, { message: "Total amount must be greater than zero." }),
    }),
  ),
});

export type EditDeliveryFormSchema = z.infer<typeof editDeliveryFormSchema>;

export const newDailyCountFormSchema = z.object({
  date: z.coerce.date({ message: "Please select a date." }),
  raw_material_type: z.string().min(1, { message: "Please select a category." }).trim(),
  items: z.array(
    z.object({
      item: z.string().min(1, { message: "Please select an item from the list." }).trim(),
      count: z.coerce.number().min(0, { message: "Count must be greater than or equal to zero." }),
      unit: z.string().min(1, { message: "Please select a unit from the list." }).trim(),
    }),
  ),
});

export type NewDailyCountFormSchema = z.infer<typeof newDailyCountFormSchema>;

export const newWasteFormSchema = z.object({
  date: z.coerce.date({ message: "Please select a date." }),
  raw_material_type: z.string().min(1, { message: "Please select a category." }).trim(),
  waste_type: z.string().min(1, { message: "Please select a waste type." }).trim(),
  items: z.array(
    z.object({
      item: z.string().min(1, { message: "Please select an item from the list." }).trim(),
      waste: z.coerce.number().min(0, { message: "Count must be greater than or equal to zero." }),
      unit: z.string().min(1, { message: "Please select a unit from the list." }).trim(),
      reason: z.string().min(1, { message: "Please provide a reason." }).trim(),
      employee: z
        .array(
          z.object({
            label: z.string(),
            value: z.string(),
          }),
        )
        .min(1)
        .transform((value) => value.map((employee) => employee.value.toString())),
    }),
  ),
});

export type NewWasteFormSchema = z.infer<typeof newWasteFormSchema>;

export const newExpensesFormSchema = z.object({
  date: z.coerce.date({ message: "Please select a date." }),
  supplier: z.string().min(1, { message: "Please select a category." }).trim(),
  payment_type: z.string().min(1, { message: "Please select a payment type." }).trim(),
  items: z.array(
    z.object({
      item: z.string().min(1, { message: "Please select an item from the list." }).trim(),
      quantity: z.coerce.number().min(0.01, { message: "Quantity must be greater than zero." }),
      price: z.coerce.number().min(0.01, { message: "Unit price must be greater than zero." }),
      total_amount: z.coerce
        .number()
        .min(0.01, { message: "Total amount must be greater than zero." }),
    }),
  ),
});

export type NewExpensesFormSchema = z.infer<typeof newExpensesFormSchema>;

export const editExpensesFormSchema = z.object({
  date: z.coerce.date({ message: "Please select a date." }),
  supplier: z.string().min(1, { message: "Please select a category." }).trim(),
  supplier_tin: z.string().trim(),
  payment_type: z.string().min(1, { message: "Please select a payment type." }).trim(),
  items: z.array(
    z.object({
      item: z.string().min(1, { message: "Please select an item from the list." }).trim(),
      quantity: z.coerce.number().min(0.01, { message: "Quantity must be greater than zero." }),
      price: z.coerce.number().min(0.01, { message: "Unit price must be greater than zero." }),
      total_amount: z.coerce
        .number()
        .min(0.01, { message: "Total amount must be greater than zero." }),
    }),
  ),
});

export type EditExpensesFormSchema = z.infer<typeof editExpensesFormSchema>;
