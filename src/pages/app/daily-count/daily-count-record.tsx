import { startTransition, useEffect, useState, type FormEvent } from 'react'
import { useIonRouter } from '@ionic/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { CalendarIcon, Container } from 'lucide-react'
import { useForm } from 'react-hook-form'

import { deleteDailyCountRecordById, updateDailyCountRecord } from '@/lib/api'
import { newDailyCountFormSchema, type NewDailyCountFormSchema } from '@/lib/form-schema'
import { getFromStorage } from '@/lib/storage'
import type { Categories, DailyCountRecord } from '@/lib/types'
import { cn } from '@/lib/utils'
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
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface DailyCountRecordFormProps {
  data: DailyCountRecord
}

export function DailyCountRecordForm({ data }: DailyCountRecordFormProps) {
  const [categories, setCategories] = useState<Categories[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const form = useForm<NewDailyCountFormSchema>({
    defaultValues: {
      date: new Date(data.date),
      raw_material_type: data.raw_material_type_id.toString(),
      items: data.items.map((item) => ({
        item: item.item_id.toString(),
        count: item.count,
        unit: item.unit,
      })),
    },
    resolver: zodResolver(newDailyCountFormSchema),
  })
  const router = useIonRouter()
  const { toast } = useToast()

  useEffect(() => {
    async function fetchCategories() {
      try {
        const savedCategories = await getFromStorage('categories')

        if (savedCategories != null) {
          const parsedCategories = JSON.parse(savedCategories) as unknown

          if (Array.isArray(parsedCategories)) {
            setCategories(parsedCategories)
          } else {
            console.error('Categories data is invalid:', parsedCategories)
          }
        } else {
          console.error('No categories found in storage')
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }

    startTransition(() => {
      void fetchCategories()
    })
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

      async function submitForm() {
        try {
          await updateDailyCountRecord(data.id, formValues)
        } catch (error) {
          console.error('Form submission failed:', error)
        } finally {
          setIsLoading(false)
          router.goBack()
          toast({ description: 'Successfully updated daily count record' })
        }
      }

      startTransition(() => {
        void submitForm()
      })
    })(event)
  }

  async function handleDelete() {
    try {
      await deleteDailyCountRecordById(data.id)
    } catch (error) {
      console.error('Error deleting daily count record:', error)
      toast({
        description: 'An error occurred while deleting the daily count record. Please try again.',
        variant: 'destructive',
      })
    } finally {
      router.goBack()
      toast({ description: 'Daily count record deleted' })
    }
  }

  return (
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
          name="raw_material_type"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor={field.name}>Category</FormLabel>
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
                </FormControl>
              </div>
              <FormMessage id={field.name} />
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
                    Inventory count
                  </div>
                  <div
                    className="table-cell h-12 px-3 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:w-px [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-0.5"
                    role="th"
                  >
                    Unit
                  </div>
                  <div
                    className="table-cell h-12 px-3 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:w-px [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-0.5"
                    role="th"
                  />
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
                        {item.item}
                      </div>

                      <div
                        className="table-cell align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-0.5"
                        role="td"
                      >
                        <FormField
                          name={`items.${index}.count`}
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
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

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
                  This action cannot be undone. This will permanently delete the daily count record.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    void handleDelete()
                  }}
                  asChild
                >
                  <Button type="button" variant="destructive">
                    Confirm
                  </Button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </form>
    </Form>
  )
}
