/* eslint-disable max-lines -- It's okay for this file to be long */
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
import {
  CalendarIcon,
  CheckIcon,
  ChevronDownIcon,
  Container,
  MinusIcon,
  Plus,
  PlusIcon,
  Trash2,
} from 'lucide-react'
import {
  Group,
  NumberField,
  Button as ReactAriaButton,
  Input as ReactInput,
} from 'react-aria-components'
import { useFieldArray, useForm } from 'react-hook-form'

import { createDailyCountEntry, fetchCategories, getIngredientsByCategory } from '@/lib/api'
import { newDailyCountFormSchema, type NewDailyCountFormSchema } from '@/lib/form-schema'
import { getFromStorage } from '@/lib/storage'
import type { Categories, Ingredients } from '@/lib/types'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
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

interface DailyCountModalActions {
  dismiss: (data?: string | number | null, role?: string) => void
}

/**
 * The `NewDailyCountModal` component renders a modal for creating a new daily count entry. It
 * provides a form with fields for date, category, and items, allowing users to dynamically add,
 * generate, and remove items. The form data is validated and submitted to create a new daily count
 * entry.
 *
 * @param props The component props.
 * @param props.dismiss The function to dismiss the modal.
 * @returns The rendered component.
 */
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
  const { toast } = useToast()

  /** Adds a new row to the items field array. */
  function handleAdd() {
    append({
      item: '',
      count: 0,
      unit: '',
    })
  }

  /** Generates a new list of ingredients with their counts set to 0 and replaces the current list. */
  function handleGenerate() {
    replace(
      ingredients.map((ingredient) => ({
        item: ingredient.id.toString(),
        count: 0,
        unit: ingredient.unit,
      })),
    )
  }

  /**
   * Handles the removal of a row at the specified index.
   *
   * @param index The index of the item to be removed.
   */
  function handleRemove(index: number) {
    remove(index)
  }

  useEffect(() => {
    /**
     * Fetches categories from the API endpoint and retrieves saved categories from storage.
     *
     * @returns A promise that resolves when the categories are fetched and set.
     */
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
    /**
     * Fetches ingredient items from the API endpoint based on the selected raw material type from
     * the form. If no raw material type is selected, the function returns early.
     *
     * @returns A promise that resolves when the ingredients are fetched and state is updated.
     */
    async function getIngredientItems() {
      if (form.getValues('raw_material_type').length === 0) {
        return
      }

      const ingredients = await getIngredientsByCategory(form.getValues('raw_material_type'))
      setIngredients(ingredients)
      remove()
    }

    void getIngredientItems()
  }, [form.watch('raw_material_type')])

  /**
   * Handles the form submission event.
   *
   * @param event The form submission event.
   */
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

      /**
       * Submits the form to create a new daily count entry.
       *
       * @returns A promise that resolves when the form submission process is complete.
       */
      async function submitForm() {
        try {
          await createDailyCountEntry(formValues)
        } catch (error) {
          console.error('Form submission failed:', error)
        } finally {
          setIsLoading(false)
          toast({
            description: 'Daily count entry created successfully',
          })
          dismiss(null, 'confirm')
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
                  <FormLabel>Category</FormLabel>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
                      <Container aria-hidden="true" strokeWidth={2} size={16} />
                    </div>
                    <FormControl>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              className="w-full min-w-40 justify-between border-input bg-background px-3 font-normal outline-offset-0 outline-none hover:bg-background focus-visible:outline-3"
                              role="combobox"
                              variant="outline"
                            >
                              <span
                                className={cn(
                                  'truncate ps-6',
                                  field.value.length === 0 && 'text-muted-foreground',
                                )}
                              >
                                {categories.length > 0
                                  ? (categories.find(
                                      (category) => category.id.toString() === field.value,
                                    )?.raw_material_type ?? 'Select a category')
                                  : 'Select a category'}
                              </span>
                              <ChevronDownIcon
                                className="shrink-0 text-muted-foreground/80"
                                aria-hidden="true"
                                size={16}
                              />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>

                        <PopoverContent
                          className="w-full min-w-(--radix-popper-anchor-width) border-input p-0"
                          align="start"
                        >
                          <Command>
                            <CommandInput placeholder="Search category..." />
                            <CommandList>
                              <CommandEmpty>No category found.</CommandEmpty>
                              <CommandGroup>
                                {categories.map((category) => (
                                  <CommandItem
                                    value={category.raw_material_type}
                                    key={category.id}
                                    onSelect={(value) => {
                                      const selectedCategory = categories.find(
                                        (category) => category.raw_material_type === value,
                                      )
                                      field.onChange(selectedCategory?.id.toString())
                                    }}
                                  >
                                    {category.raw_material_type}
                                    {category.id.toString() === field.value && (
                                      <CheckIcon className="ml-auto" size={16} />
                                    )}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </FormControl>
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
                          className="table-cell align-top [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-0.5"
                          role="td"
                        >
                          <FormField
                            name={`items.${index}.item`}
                            control={form.control}
                            render={({ field }) => (
                              <FormItem className="flex flex-col gap-2 space-y-0">
                                <FormControl>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <FormControl>
                                        <Button
                                          className="w-full min-w-40 justify-between border-input bg-background px-3 font-normal outline-offset-0 outline-none hover:bg-background focus-visible:outline-3"
                                          role="combobox"
                                          variant="outline"
                                        >
                                          <span
                                            className={cn(
                                              'truncate',
                                              field.value.length === 0 && 'text-muted-foreground',
                                            )}
                                          >
                                            {ingredients.length > 0
                                              ? (ingredients.find(
                                                  (ingredient) =>
                                                    ingredient.id.toString() === field.value,
                                                )?.raw_material ?? 'Select an ingredient')
                                              : 'Select an ingredient'}
                                          </span>
                                          <ChevronDownIcon
                                            className="shrink-0 text-muted-foreground/80"
                                            aria-hidden="true"
                                            size={16}
                                          />
                                        </Button>
                                      </FormControl>
                                    </PopoverTrigger>

                                    <PopoverContent
                                      className="w-full min-w-(--radix-popper-anchor-width) border-input p-0"
                                      align="start"
                                    >
                                      <Command>
                                        <CommandInput placeholder="Search ingredient..." />
                                        <CommandList>
                                          <CommandEmpty>No category found.</CommandEmpty>
                                          <CommandGroup>
                                            {ingredients.map((ingredient) => (
                                              <CommandItem
                                                value={ingredient.raw_material}
                                                key={ingredient.id}
                                                onSelect={(value) => {
                                                  const selectedIngredient = ingredients.find(
                                                    (ingredient) =>
                                                      ingredient.raw_material === value,
                                                  )
                                                  field.onChange(selectedIngredient?.id.toString())
                                                }}
                                              >
                                                {ingredient.raw_material}
                                                {ingredient.id.toString() === field.value && (
                                                  <CheckIcon className="ml-auto" size={16} />
                                                )}
                                              </CommandItem>
                                            ))}
                                          </CommandGroup>
                                        </CommandList>
                                      </Command>
                                    </PopoverContent>
                                  </Popover>
                                </FormControl>
                                <FormMessage id={field.name} />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div
                          className="table-cell align-top [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-0.5"
                          role="td"
                        >
                          <FormField
                            name={`items.${index}.count`}
                            control={form.control}
                            render={({ field }) => (
                              <FormItem className="flex flex-col gap-2 space-y-0">
                                <FormControl>
                                  <NumberField
                                    className="min-w-40"
                                    aria-label="Quantity"
                                    defaultValue={field.value}
                                    minValue={0}
                                    onChange={field.onChange}
                                  >
                                    <Group className="relative inline-flex h-9 w-full items-center overflow-hidden rounded-md border border-input text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none data-disabled:opacity-50 data-focus-within:border-ring data-focus-within:ring-3 data-focus-within:ring-ring/20 data-focus-within:has-aria-invalid:border-destructive data-focus-within:has-aria-invalid:ring-destructive/20 dark:data-focus-within:has-aria-invalid:ring-destructive/40">
                                      <ReactAriaButton
                                        className="-ms-px flex aspect-square h-[inherit] items-center justify-center rounded-s-md border border-input bg-background text-sm text-muted-foreground/80 transition-[color,box-shadow] hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                                        slot="decrement"
                                      >
                                        <MinusIcon aria-hidden="true" size={16} />
                                      </ReactAriaButton>
                                      <ReactInput className="w-full grow bg-background px-3 py-2 text-center text-foreground tabular-nums" />
                                      <ReactAriaButton
                                        className="-me-px flex aspect-square h-[inherit] items-center justify-center rounded-e-md border border-input bg-background text-sm text-muted-foreground/80 transition-[color,box-shadow] hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                                        slot="increment"
                                      >
                                        <PlusIcon aria-hidden="true" size={16} />
                                      </ReactAriaButton>
                                    </Group>
                                  </NumberField>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div
                          className="table-cell align-top [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-0.5"
                          role="td"
                        >
                          <FormField
                            name={`items.${index}.unit`}
                            control={form.control}
                            render={({ field }) => (
                              <FormItem className="flex flex-col gap-2 space-y-0">
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
                          className="table-cell align-top [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-0.5"
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
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  dismiss(null, 'cancel')
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </IonContent>
    </IonPage>
  )
}
