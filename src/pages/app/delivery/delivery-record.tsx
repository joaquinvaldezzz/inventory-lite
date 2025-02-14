/* eslint-disable max-lines -- Safe to disable for this file */
import { startTransition, useEffect, useRef, useState, type FormEvent } from 'react'
import { useIonRouter } from '@ionic/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { CalendarIcon, Container } from 'lucide-react'
import { Input as ReactInput, NumberField as ReactNumberField } from 'react-aria-components'
import { useForm } from 'react-hook-form'

import { deleteDeliveryRecord, updateDeliveryRecord } from '@/lib/api'
import { editDeliveryFormSchema, type EditDeliveryFormSchema } from '@/lib/form-schema'
import { getFromStorage } from '@/lib/storage'
import type { DeliveryRecord, Supplier } from '@/lib/types'
import { cn, formatAsCurrency } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input, inputVariants } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

interface DeliveryRecordFormProps {
  data: DeliveryRecord
}

export default function DeliveryRecordForm({ data }: DeliveryRecordFormProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const [suppliers, setSuppliers] = useState<Supplier>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const form = useForm<EditDeliveryFormSchema>({
    defaultValues: {
      supplier: data.supplier_id.toString(),
      po_number: data.po_no,
      date_request: new Date(data.date_request),
      remarks: data.remarks,
      items: data.items.map((item) => ({
        item: item.item_id,
        quantity_actual: item.quantity_actual,
        quantity_dr: item.quantity_dr,
        unit_dr: item.unit,
        unit_price: item.price,
        total_amount: item.total_amount,
      })),
    },
    resolver: zodResolver(editDeliveryFormSchema),
  })
  const { toast } = useToast()
  const router = useIonRouter()

  useEffect(() => {
    // TODO: Save these suppliers locally
    async function fetchSuppliers() {
      try {
        const savedSuppliers = await getFromStorage('suppliers')

        if (savedSuppliers != null) {
          const parsedSuppliers = JSON.parse(savedSuppliers) as unknown

          if (Array.isArray(parsedSuppliers)) {
            setSuppliers(parsedSuppliers)
          } else {
            console.error('Suppliers data is invalid:', parsedSuppliers)
          }
        } else {
          console.error('No suppliers found in storage')
        }
      } catch (error) {
        console.error('Error fetching suppliers:', error)
      }
    }

    startTransition(() => {
      void fetchSuppliers()
    })
  }, [])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    void form.handleSubmit(() => {
      const formValues = form.getValues()
      const parsedValues = editDeliveryFormSchema.safeParse(formValues)

      if (!parsedValues.success) {
        console.error('Form data is invalid:', parsedValues.error)
        return
      }

      setIsLoading(true)

      async function submitForm() {
        try {
          await updateDeliveryRecord(data.id, formValues)
        } catch (error) {
          toast({
            description: 'An error occurred while saving changes. Please try again.',
            variant: 'destructive',
          })
        } finally {
          setIsLoading(false)
          toast({ description: 'Successfully saved changes' })
          router.goBack()
        }
      }

      startTransition(() => {
        void submitForm()
      })
    })(event)
  }

  async function handleDelete() {
    try {
      await deleteDeliveryRecord(data.id)
    } catch (error) {
      console.error('Error deleting delivery record:', error)
      toast({
        description: 'An error occurred while deleting the delivery record. Please try again.',
        variant: 'destructive',
      })
    } finally {
      toast({ description: 'Delivery record deleted' })
      router.goBack()
    }
  }

  return (
    <>
      <Form {...form}>
        <form className="space-y-5" ref={formRef} onSubmit={handleSubmit}>
          <FormField
            name="supplier"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor={field.name}>Supplier</FormLabel>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
                    <Container aria-hidden="true" strokeWidth={2} size={16} />
                  </div>
                  <FormControl>
                    <Select
                      name={field.name}
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="ps-9" id={field.name}>
                        <SelectValue placeholder="Select a supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.length > 0 ? (
                          suppliers.map((supplier) => (
                            <SelectItem value={supplier.id.toString()} key={supplier.id}>
                              {supplier.supplier_name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="0" aria-disabled="true" disabled>
                            No suppliers available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="po_number"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>PO no.</FormLabel>
                <FormControl>
                  <Input
                    className="read-only:bg-muted"
                    type="text"
                    readOnly
                    {...field}
                    value={data.po_no}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="date_request"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date delivered</FormLabel>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
                    <CalendarIcon aria-hidden="true" strokeWidth={2} size={16} />
                  </div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          className={cn('w-full justify-start ps-9 text-left font-normal')}
                          variant="outline"
                        >
                          {field.value instanceof Date && !isNaN(field.value.getTime()) ? (
                            format(field.value, 'PP')
                          ) : (
                            <span>Select a date</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="remarks"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Remarks</FormLabel>
                <FormControl>
                  <Textarea className="min-h-24" placeholder="Enter your remarks" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 border-y whitespace-nowrap">
            <div className="relative w-full overflow-auto">
              <div className="table w-full caption-bottom text-sm" role="table">
                <div className="table-header-group" role="thead">
                  <div
                    className="table-row border-b border-border transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                    role="tr"
                  >
                    <div
                      className="table-cell h-12 px-3 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:w-px [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-0.5"
                      role="th"
                    >
                      Ingredients
                    </div>
                    <div
                      className="table-cell h-12 px-3 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:w-px [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-0.5"
                      role="th"
                    >
                      Actual Quantity
                    </div>
                    <div
                      className="table-cell h-12 px-3 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:w-px [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-0.5"
                      role="th"
                    >
                      PO
                    </div>
                    <div
                      className="table-cell h-12 px-3 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:w-px [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-0.5"
                      role="th"
                    >
                      DR Quantity
                    </div>
                    <div
                      className="table-cell h-12 px-3 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:w-px [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-0.5"
                      role="th"
                    >
                      DR unit
                    </div>
                    <div
                      className="table-cell h-12 px-3 text-right align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:w-px [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-0.5"
                      role="th"
                    >
                      Unit price
                    </div>
                    <div
                      className="table-cell h-12 px-3 text-right align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:w-px [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-0.5"
                      role="th"
                    >
                      Total amount
                    </div>
                  </div>
                </div>

                <div className="table-row-group **:[[role=td]]:px-3" role="tbody">
                  {data.items.map((item, index) => {
                    return (
                      <div
                        className="table-row border-b border-border transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                        role="tr"
                        key={item.id}
                      >
                        <div
                          className="table-cell h-12 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-0.5"
                          role="td"
                        >
                          {item.raw_material}
                        </div>

                        <div
                          className="table-cell align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-0.5"
                          role="td"
                        >
                          <FormField
                            name={`items.${index}.quantity_actual`}
                            control={form.control}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div
                          className="table-cell h-12 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-0.5"
                          role="td"
                        >
                          {item.unit_dr}
                        </div>

                        <div
                          className="table-cell align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-0.5"
                          role="td"
                        >
                          <FormField
                            name={`items.${index}.quantity_dr`}
                            control={form.control}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div
                          className="table-cell align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-0.5"
                          role="td"
                        >
                          <FormField
                            name={`items.${index}.unit_dr`}
                            control={form.control}
                            render={({ field }) => (
                              <FormItem className="space-y-0">
                                <FormControl>
                                  <Select
                                    name={field.name}
                                    defaultValue={field.value}
                                    onValueChange={field.onChange}
                                  >
                                    <SelectTrigger className="min-w-40">
                                      <SelectValue placeholder="Select a unit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value={field.value}>{field.value}</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div
                          className="table-cell align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-0.5"
                          role="td"
                        >
                          <FormField
                            name={`items.${index}.total_amount`}
                            control={form.control}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <ReactNumberField
                                    formatOptions={{
                                      style: 'currency',
                                      currency: 'PHP',
                                      currencySign: 'accounting',
                                    }}
                                    aria-label="Unit Price"
                                    defaultValue={field.value}
                                  >
                                    <ReactInput
                                      className={cn(
                                        inputVariants(),
                                        'min-w-40 text-right tabular-nums read-only:bg-muted',
                                      )}
                                      readOnly
                                    />
                                  </ReactNumberField>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div
                          className="table-cell align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-0.5"
                          role="td"
                        >
                          <FormField
                            name={`items.${index}.total_amount`}
                            control={form.control}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <ReactNumberField
                                    formatOptions={{
                                      style: 'currency',
                                      currency: 'PHP',
                                      currencySign: 'accounting',
                                    }}
                                    aria-label="Total amount"
                                    defaultValue={field.value}
                                  >
                                    <ReactInput
                                      className={cn(
                                        inputVariants(),
                                        'min-w-40 text-right tabular-nums read-only:bg-muted',
                                      )}
                                      readOnly
                                    />
                                  </ReactNumberField>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Make these buttons sticky at the bottom */}
          <div className="mt-1 flex flex-col gap-3">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="ghost">
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the delivery record.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      void handleDelete()
                    }}
                  >
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </form>
      </Form>

      <hr className="my-4" />
      <div className="flex items-center justify-between">
        <div className="font-bold">Total</div>
        <div className="font-bold tabular-nums">{formatAsCurrency(data.total_amount)}</div>
      </div>
    </>
  )
}
