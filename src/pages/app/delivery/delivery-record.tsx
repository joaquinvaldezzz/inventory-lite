import { startTransition, useRef, useState, type FormEvent } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { CalendarIcon, Container } from 'lucide-react'
import { Input as ReactInput, NumberField as ReactNumberField } from 'react-aria-components'
import { useForm } from 'react-hook-form'

import { newDeliveryFormSchema, type NewDeliveryFormSchema } from '@/lib/form-schema'
import type { DeliveryRecord } from '@/lib/types'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
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
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const form = useForm<NewDeliveryFormSchema>({
    defaultValues: {
      supplier: data.supplier_name,
      date_request: new Date(data.date_request),
      remarks: data.remarks,
      items: data.items.map((item) => ({
        ingredient: item.raw_material,
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- Safe to use optional chaining
        quantity: item.quantity ?? '',
        unit: item.unit,
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- Safe to use optional chaining
        unit_price: item.price ?? '',
        total_amount: item.total_amount,
      })),
    },
    resolver: zodResolver(newDeliveryFormSchema),
  })
  const { toast } = useToast()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    void form.handleSubmit(() => {
      const formValues = form.getValues()
      const parsedValues = newDeliveryFormSchema.safeParse(formValues)

      if (!parsedValues.success) {
        console.error('Form data is invalid:', parsedValues.error)
        return
      }

      setIsLoading(true)

      function submitForm() {
        try {
          // await createDeliveryEntry(formValues)
          console.log('Form submitted:', formValues)
        } catch (error) {
          console.error('Form submission failed:', error)
        } finally {
          setIsLoading(false)
        }
      }

      startTransition(() => {
        submitForm()
      })
    })(event)
  }

  function handleDelete() {
    toast({
      description: 'Oops! Deleting a delivery record is not yet implemented. :(',
      variant: 'destructive',
    })
  }

  return (
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
                      <SelectItem value="0" disabled>
                        No suppliers available
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
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
              <FormLabel>Date</FormLabel>
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
            <div className="table w-full caption-bottom text-sm" aria-label="table">
              <div className="table-header-group" aria-label="thead">
                <div
                  className="table-row border-b border-border transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                  aria-label="tr"
                >
                  <div
                    className="table-cell h-12 px-3 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:w-px [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-0.5"
                    aria-label="th"
                  >
                    Ingredients
                  </div>
                  <div className="table-cell h-12 px-3 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:w-px [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-0.5">
                    Actual Quantity
                  </div>
                  <div className="table-cell h-12 px-3 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:w-px [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-0.5">
                    PO
                  </div>
                  <div className="table-cell h-12 px-3 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:w-px [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-0.5">
                    DR Quantity
                  </div>
                  <div className="table-cell h-12 px-3 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:w-px [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-0.5">
                    DR unit
                  </div>
                  <div className="table-cell h-12 px-3 text-right align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:w-px [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-0.5">
                    Unit Price
                  </div>
                  <div className="table-cell h-12 px-3 text-right align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:w-px [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-0.5">
                    Total
                  </div>
                </div>
              </div>

              <div className="table-row-group **:aria-[label=td]:px-3" aria-label="tbody">
                {data.items.map((item, index) => (
                  <div
                    className="table-row border-b border-border transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                    aria-label="tr"
                    key={item.id}
                  >
                    <div
                      className="table-cell h-12 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-0.5"
                      aria-label="td"
                    >
                      {item.raw_material}
                    </div>

                    <div
                      className="table-cell align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-0.5"
                      aria-label="td"
                    >
                      <FormField
                        name={`items.${index}.quantity`}
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
                      aria-label="td"
                    >
                      {item.quantity_po}
                    </div>

                    <div
                      className="table-cell align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-0.5"
                      aria-label="td"
                    >
                      <FormField
                        name={`items.${index}.quantity`}
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
                      aria-label="td"
                    >
                      <FormField
                        name={`items.${index}.unit_price`}
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                className="min-w-40 text-right"
                                type="number"
                                disabled
                                {...field}
                              />
                            </FormControl>

                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div
                      className="table-cell align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-0.5"
                      aria-label="td"
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
                      aria-label="td"
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
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Make these buttons sticky at the bottom */}
        <div className="mt-1 flex flex-col gap-3">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
          <Button type="button" variant="ghost" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </form>
    </Form>
  )
}
