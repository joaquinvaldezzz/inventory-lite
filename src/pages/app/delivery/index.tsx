/* eslint-disable max-lines -- This page has complex logic that is necessary for its functionality */
import { startTransition, useEffect, useRef, useState, type FormEvent } from 'react'
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonModal,
  IonPage,
  IonProgressBar,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { add } from 'ionicons/icons'
import { CalendarIcon, Container, Plus, Trash2 } from 'lucide-react'
import { useFieldArray, useForm } from 'react-hook-form'

import { createDeliveryEntry, getDeliveryEntries, getItems, getSuppliers } from '@/lib/api'
import { newDeliveryFormSchema, type NewDeliveryFormSchema } from '@/lib/form-schema'
import type { Items, Supplier } from '@/lib/types'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { DataTable } from '@/components/ui/data-table'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

import { columns } from './columns'

// TODO: Separate the form into a separate component

// eslint-disable-next-line complexity -- This page has complex logic that is necessary for its functionality
export default function Delivery() {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const modalRef = useRef<HTMLIonModalElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const [suppliers, setSuppliers] = useState<Supplier>([])
  const [items, setItems] = useState<Items>([])
  const form = useForm<NewDeliveryFormSchema>({
    defaultValues: {
      supplier: '',
      date_request: new Date(),
      remarks: '',
      items: [
        {
          ingredient: '',
          quantity: 5,
          unit: '',
          unit_price: 50.0,
          total_amount: 50.0,
        },
      ],
    },
    resolver: zodResolver(newDeliveryFormSchema),
  })
  const [isLoading, setIsLoading] = useState<boolean>(false)
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

      async function submitForm() {
        try {
          await createDeliveryEntry(formValues)
        } catch (error) {
          console.error('Form submission failed:', error)
        } finally {
          setIsLoading(false)
          setIsOpen(false)
          toast({
            description: 'Delivery entry created successfully',
          })
        }
      }

      startTransition(() => {
        void submitForm()
      })
    })(event)
  }

  function openModal() {
    setIsOpen(true)
  }

  function closeModal() {
    setIsOpen(false)
  }

  const { fields, append, remove } = useFieldArray({
    name: 'items',
    control: form.control,
  })

  function handleClick() {
    append({
      ingredient: '',
      quantity: 5,
      unit: '',
      unit_price: 50.0,
      total_amount: 50.0,
    })
  }

  function handleRemove(index: number) {
    remove(index)
  }

  const { isFetching, isPending, error, data } = useQuery({
    queryKey: ['delivery-entries', isLoading],
    queryFn: async () => await getDeliveryEntries(),
  })

  if (error != null) console.error(error)

  useEffect(() => {
    // TODO: Save these suppliers locally
    async function fetchSuppliers() {
      try {
        const request = await getSuppliers()
        setSuppliers(request)
      } catch (error) {
        console.error('Error fetching suppliers:', error)
      }
    }

    startTransition(() => {
      void fetchSuppliers()
    })
  }, [])

  useEffect(() => {
    // TODO: Save these items locally
    async function fetchItems() {
      try {
        const request = await getItems()
        setItems(request)
      } catch (error) {
        console.error('Error fetching items:', error)
      }
    }

    startTransition(() => {
      void fetchItems()
    })
  }, [])

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Delivery</IonTitle>
          <IonButtons slot="end" collapse>
            <IonButton onClick={openModal}>
              <IonIcon icon={add} />
            </IonButton>
          </IonButtons>
          {isFetching && !isPending && <IonProgressBar type="indeterminate" />}
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Delivery</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={openModal}>
                <IonIcon icon={add} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <div className="ion-padding">
          {isPending ? (
            <div className="flex h-96 items-center justify-center">
              <IonSpinner />
            </div>
          ) : (
            <DataTable columns={columns} data={data ?? []} withPagination withSearch />
          )}
        </div>

        <IonModal isOpen={isOpen} ref={modalRef}>
          <IonHeader>
            <IonToolbar>
              <IonButtons slot="start">
                <IonButton onClick={closeModal}>Cancel</IonButton>
              </IonButtons>
              <IonTitle className="text-center">New delivery</IonTitle>
              <IonButtons slot="end">
                <IonButton>Submit</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>

          <IonContent className="ion-padding">
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
                  name="date_request"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
                          <CalendarIcon aria-hidden="true" strokeWidth={2} size={16} />
                        </div>
                        <Popover modal>
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
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                              disabled={(date) =>
                                date > new Date() || date < new Date('1900-01-01')
                              }
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
                        <Textarea
                          className="min-h-24"
                          placeholder="Enter your remarks"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 border-y whitespace-nowrap">
                  <div className="relative w-full overflow-auto">
                    <div className="table w-full caption-bottom pb-2 text-sm" aria-label="table">
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
                            Quantity
                          </div>
                          <div className="table-cell h-12 px-3 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:w-px [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-0.5">
                            Unit
                          </div>
                          <div className="table-cell h-12 px-3 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:w-px [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-0.5">
                            Unit Price
                          </div>
                          <div className="table-cell h-12 px-3 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:w-px [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-0.5">
                            Total
                          </div>
                          <div className="table-cell h-12 px-3 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:w-px [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-0.5" />
                        </div>
                      </div>

                      <div
                        className="table-row-group **:aria-[label=td]:px-1 **:aria-[label=td]:py-1"
                        aria-label="tbody"
                      >
                        {fields.map((_, index) => (
                          <div
                            className="table-row border-b border-border transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                            aria-label="tr"
                            key={index}
                          >
                            <div
                              className="table-cell align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-0.5"
                              aria-label="td"
                            >
                              <FormField
                                name={`items.${index}.ingredient`}
                                control={form.control}
                                render={({ field }) => (
                                  <FormItem className="space-y-0">
                                    <FormControl>
                                      <Select
                                        name={field.name}
                                        defaultValue={field.value}
                                        onValueChange={field.onChange}
                                      >
                                        <SelectTrigger className="min-w-48" id={field.name}>
                                          <SelectValue placeholder="Select an item" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {items.map((item) => (
                                            <SelectItem value={item.id.toString()} key={item.id}>
                                              {item.raw_material}
                                            </SelectItem>
                                          ))}
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
                                name={`items.${index}.unit`}
                                control={form.control}
                                render={({ field }) => (
                                  <FormItem className="space-y-0">
                                    <FormControl>
                                      <Select
                                        name={field.name}
                                        defaultValue={field.value}
                                        onValueChange={field.onChange}
                                      >
                                        <SelectTrigger className="min-w-48" id={field.name}>
                                          <SelectValue placeholder="Select a unit" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="1">Supplier 1</SelectItem>
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
                              <Button
                                className="text-destructive"
                                type="button"
                                size="icon"
                                variant="ghost"
                                onClick={() => {
                                  handleRemove(index)
                                }}
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Make these buttons sticky at the bottom */}
                <div className="mt-1 flex flex-col gap-3">
                  <Button type="button" variant="ghost" onClick={handleClick}>
                    <span>Add more ingredients</span>
                    <Plus className="ms-2 -me-1" aria-hidden="true" strokeWidth={2} size={16} />
                  </Button>

                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Submitting...' : 'Submit'}
                  </Button>
                  <Button type="button" disabled={isLoading} variant="ghost" onClick={closeModal}>
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  )
}
