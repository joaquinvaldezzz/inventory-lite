import { startTransition, useRef, useState, type FormEvent } from 'react'
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonModal,
  IonPage,
  IonProgressBar,
  IonTitle,
  IonToolbar,
} from '@ionic/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { add } from 'ionicons/icons'
import { CalendarIcon, Container } from 'lucide-react'
import { useForm } from 'react-hook-form'

import { createDeliveryEntry, getDeliveryEntries } from '@/lib/api'
import { newDeliveryFormSchema, type NewDeliveryFormSchema } from '@/lib/form-schema'
import { cn } from '@/lib/utils'
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

// eslint-disable-next-line complexity -- This component has complex logic that is necessary for its functionality
export default function Delivery() {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const modalRef = useRef<HTMLIonModalElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const form = useForm<NewDeliveryFormSchema>({
    defaultValues: {
      supplier: '',
      date_request: new Date(),
      remarks: '',
      items: [],
    },
    resolver: zodResolver(newDeliveryFormSchema),
  })
  const [isLoading, setIsLoading] = useState<boolean>(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    void form.handleSubmit(() => {
      const formValues = form.getValues()
      const parsedValues = newDeliveryFormSchema.safeParse(formValues)

      if (!parsedValues.success) {
        console.error('Form data is invalid:', parsedValues.error)
      }

      setIsLoading(true)

      startTransition(() => {
        void (async () => {
          if (formRef.current == null) {
            console.error('Form reference is not available')
            return
          }

          try {
            // TODO: Fix type error
            await createDeliveryEntry(formValues)
          } catch (error) {
            console.error('Form submission failed:', error)
          } finally {
            setIsLoading(false)
            setIsOpen(false)
          }
        })()
      })
    })(event)
  }

  function openModal() {
    setIsOpen(true)
  }

  function closeModal() {
    setIsOpen(false)
  }

  const { isFetching, isPending, error, data } = useQuery({
    queryKey: ['delivery-entries', isLoading],
    queryFn: async () => await getDeliveryEntries(),
  })

  if (error != null) console.error(error)

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
          <DataTable
            columns={columns}
            data={data ?? []}
            isFetching={isPending}
            withPagination
            withSearch
          />
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
                              <SelectItem value="1">Supplier 1</SelectItem>
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

                <div className="mt-1 flex flex-col gap-3">
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
