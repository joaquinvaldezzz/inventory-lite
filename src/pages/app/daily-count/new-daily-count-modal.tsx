import { startTransition, useEffect, useState, type FormEvent } from 'react'
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'

import { getCategories } from '@/lib/api'
import { newDailyCountFormSchema, type NewDailyCountFormSchema } from '@/lib/form-schema'
import { getFromStorage } from '@/lib/storage'
import type { Categories } from '@/lib/types'
import { cn } from '@/lib/utils'
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface DailyCountModalActions {
  dismiss: (data?: string | number | null, role?: string) => void
}

export function NewDailyCountModal({ dismiss }: DailyCountModalActions) {
  const [categories, setCategories] = useState<Categories[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const form = useForm<NewDailyCountFormSchema>({
    defaultValues: {
      date: new Date(),
      raw_material_type: '',
    },
    resolver: zodResolver(newDailyCountFormSchema),
  })

  useEffect(() => {
    async function getCategoryItems() {
      await getCategories()

      const savedCategories = await getFromStorage('categories')

      if (savedCategories != null) {
        const parsedCategories = JSON.parse(savedCategories) as unknown

        if (Array.isArray(parsedCategories)) {
          setCategories(parsedCategories)
        } else {
          console.error('Categories data is invalid:', parsedCategories)
        }
      }
    }

    void getCategoryItems()
  }, [])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    void form.handleSubmit(() => {
      const formValues = form.getValues()
      const parsedValues = newDailyCountFormSchema.safeParse(formValues)

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

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton
              onClick={() => {
                dismiss(null, 'cancel')
              }}
            >
              Cancel
            </IonButton>
          </IonButtons>
          <IonTitle className="text-center">New daily count</IonTitle>
          <IonButtons slot="end">
            <IonButton
              onClick={() => {
                dismiss(null, 'confirm')
              }}
            >
              Confirm
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <Form {...form}>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <FormField
              name="date"
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
              name="raw_material_type"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor={field.name}>Category</FormLabel>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
                      <CalendarIcon aria-hidden="true" strokeWidth={2} size={16} />
                    </div>
                    <Select
                      name={field.name}
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="ps-9" id={field.name}>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.length > 0 ? (
                          categories.map((category) => (
                            <SelectItem value={category.id.toString()} key={category.id}>
                              {category.raw_material_type}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="0" aria-disabled="true" disabled>
                            No suppliers available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-3">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Generating...' : 'Generate'}
              </Button>
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </IonContent>
    </IonPage>
  )
}
