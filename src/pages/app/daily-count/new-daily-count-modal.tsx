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
import { CalendarIcon, Plus, Trash2 } from 'lucide-react'
import { useFieldArray, useForm } from 'react-hook-form'

import { createDailyCountEntry, fetchCategories, fetchIngredientsByCategory } from '@/lib/api'
import { newDailyCountFormSchema, type NewDailyCountFormSchema } from '@/lib/form-schema'
import { getFromStorage } from '@/lib/storage'
import type { Categories, Ingredients } from '@/lib/types'
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
import { Input } from '@/components/ui/input'
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
  const [ingredients, setIngredients] = useState<Ingredients[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const form = useForm<NewDailyCountFormSchema>({
    defaultValues: {
      date: new Date(),
      raw_material_type: '',
      items: [],
    },
    resolver: zodResolver(newDailyCountFormSchema),
  })
  const { fields, replace, append, remove } = useFieldArray({
    name: 'items',
    control: form.control,
  })

  function handleAdd() {
    append({
      item: '',
      count: 0,
      unit: '',
    })
  }

  function handleGenerate() {
    replace(
      ingredients.map((ingredient) => ({
        item: ingredient.id.toString(),
        count: 0,
        unit: ingredient.unit,
      })),
    )
  }

  function handleRemove(index: number) {
    remove(index)
  }

  useEffect(() => {
    async function getCategoryItems() {
      await fetchCategories()

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

  useEffect(() => {
    async function getIngredientItems() {
      if (form.getValues('raw_material_type').length === 0) {
        return
      }

      const ingredients = await fetchIngredientsByCategory(form.getValues('raw_material_type'))
      setIngredients(ingredients)
      remove()
    }

    void getIngredientItems()
  }, [form.watch('raw_material_type')])

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
          await createDailyCountEntry(formValues)
        } catch (error) {
          console.error('Form submission failed:', error)
        } finally {
          setIsLoading(false)
        }
      }

      startTransition(() => {
        void submitForm()
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
                            No categories available
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
              <Button type="button" variant="secondary" onClick={handleGenerate}>
                Generate items
              </Button>
            </div>

            <div className="grid grid-cols-1 border-y whitespace-nowrap">
              <div className="relative w-full overflow-auto">
                <div className="table w-full caption-bottom pb-2 text-sm" role="table">
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
                        Quantity
                      </div>

                      <div
                        className="table-cell h-12 px-3 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:w-px [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-0.5"
                        role="th"
                      />
                    </div>
                  </div>

                  <div
                    className="table-row-group **:[[role=td]]:px-1 **:[[role=td]]:py-1"
                    role="tbody"
                  >
                    {fields.map((_, index) => (
                      <div
                        className="table-row border-b border-border transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                        role="tr"
                        key={index}
                      >
                        <div
                          className="table-cell align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-0.5"
                          role="td"
                        >
                          <FormField
                            name={`items.${index}.item`}
                            control={form.control}
                            render={({ field }) => (
                              <FormItem className="space-y-0">
                                <FormControl>
                                  <Select
                                    name={field.name}
                                    defaultValue={field.value}
                                    onValueChange={(event) => {
                                      field.onChange(event)
                                      const selectedItem = ingredients.find(
                                        (ingredient) => ingredient.id === Number(event),
                                      )
                                      form.setValue(
                                        `items.${index}.unit`,
                                        selectedItem != null ? selectedItem.unit : '',
                                      )
                                    }}
                                  >
                                    <SelectTrigger className="min-w-48" id={field.name}>
                                      <SelectValue placeholder="Select an item" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {ingredients.length > 0 ? (
                                        ingredients.map((ingredient) => (
                                          <SelectItem
                                            value={ingredient.id.toString()}
                                            key={ingredient.id}
                                          >
                                            {ingredient.raw_material}
                                          </SelectItem>
                                        ))
                                      ) : (
                                        <SelectItem value="0" aria-disabled disabled>
                                          No items available
                                        </SelectItem>
                                      )}
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormMessage id={field.name} />
                              </FormItem>
                            )}
                          />
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
                                  <Input
                                    className="min-w-40 read-only:bg-muted"
                                    type="text"
                                    readOnly
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
                          role="td"
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

            <div className="flex flex-col gap-3">
              <Button type="button" variant="ghost" onClick={handleAdd}>
                <span>Add another product</span>
                <Plus aria-hidden="true" strokeWidth={2} size={16} />
              </Button>
              <Button type="submit" disabled={isLoading}>
                Submit
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
