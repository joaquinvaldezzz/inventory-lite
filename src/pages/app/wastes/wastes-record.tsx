/* eslint-disable max-lines -- This is a large file */
import { startTransition, useEffect, useState, type FormEvent } from 'react'
import { useIonRouter } from '@ionic/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { CalendarIcon, CheckIcon, ChevronDownIcon, Container, Trash2 } from 'lucide-react'
import { useFieldArray, useForm } from 'react-hook-form'

import { deleteWasteRecordById, fetchEmployees, updateWasteRecord } from '@/lib/api'
import { newWasteFormSchema, type NewWasteFormSchema } from '@/lib/form-schema'
import { getFromStorage } from '@/lib/storage'
import type { Categories, WasteRecordData } from '@/lib/types'
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  DivTable,
  DivTableBody,
  DivTableCell,
  DivTableHead,
  DivTableHeader,
  DivTableRow,
} from '@/components/ui/div-table'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import MultipleSelector, { type Option } from '@/components/ui/multiselect'
import { NumberInput } from '@/components/ui/number-input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface WastesRecordFormProps {
  data: WasteRecordData
}

/**
 * Component for rendering a form to record waste data.
 *
 * @param props The properties for the WastesRecordForm component.
 * @param props.data The data for the form.
 * @returns The rendered form component.
 */
export function WastesRecordForm({ data }: WastesRecordFormProps) {
  const [categories, setCategories] = useState<Categories[]>([])
  const [employees, setEmployees] = useState<Option[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const form = useForm<NewWasteFormSchema>({
    defaultValues: {
      date: new Date(data.date),
      raw_material_type: data.raw_material_type_id.toString(),
      waste_type: data.waste_type,
      items: data.items.map((item) => ({
        item: item.raw_material_type,
        waste: item.waste,
        unit: item.unit,
        reason: item.reason,
        employee: [],
      })),
    },
    resolver: zodResolver(newWasteFormSchema),
  })
  const { fields, remove } = useFieldArray({
    name: 'items',
    control: form.control,
  })
  const router = useIonRouter()
  const { toast } = useToast()

  useEffect(() => {
    /**
     * Fetches the list of employees, maps the data to a specific format, and updates the state with
     * the formatted data.
     *
     * @returns A promise that resolves when the employees have been fetched and the state has been
     *   updated.
     */
    async function getEmployees() {
      const employees = await fetchEmployees()
      const data = employees.map((employee) => {
        return {
          value: employee.EmployeeID,
          label: employee.FirstName + ' ' + employee.LastName,
        }
      })

      setEmployees(data)
    }

    void getEmployees()
  }, [])

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
     * Fetches categories from storage and updates the state with the retrieved categories.
     *
     * @returns A promise that resolves when the categories have been fetched and the state has been
     *   updated.
     * @throws Will log an error message to the console if there is an issue fetching the
     *   categories.
     */
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

  /**
   * Handles the form submission event.
   *
   * @param event The form submission event.
   */
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    void form.handleSubmit(() => {
      const formValues = form.getValues()
      const parsedValues = newWasteFormSchema.safeParse(formValues)

      if (!parsedValues.success) {
        console.error('Form data is invalid:', parsedValues.error)
        return
      }

      setIsLoading(true)

      /**
       * Submits the form data to update the waste record.
       *
       * @returns A promise that resolves when the form submission is complete.
       * @throws Will log an error message to the console if the form submission fails.
       */
      async function submitForm() {
        try {
          if (parsedValues.data != null) await updateWasteRecord(data.id, parsedValues.data)
        } catch (error) {
          console.error('Form submission failed:', error)
        } finally {
          setIsLoading(false)
          router.goBack()
          toast({ description: 'Successfully updated waste record' })
        }
      }

      void submitForm()
    })(event)
  }

  /**
   * Handles the deletion of a waste record.
   *
   * @returns A promise that resolves when the deletion process is complete.
   */
  async function handleDelete() {
    try {
      await deleteWasteRecordById(data.id)
    } catch (error) {
      console.error('Error deleting waste record:', error)
      toast({
        description: 'An error occurred while deleting the waste record. Please try again.',
        variant: 'destructive',
      })
    } finally {
      router.goBack()
      toast({ description: 'Waste record deleted' })
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
                        <CommandInput placeholder="Search supplier..." />
                        <CommandList>
                          <CommandEmpty>No supplier found.</CommandEmpty>
                          <CommandGroup>
                            {categories.map((category) => (
                              <CommandItem
                                value={category.raw_material_type}
                                key={category.id}
                                onSelect={(value) => {
                                  const selectedSupplier = categories.find(
                                    (supplier) => supplier.raw_material_type === value,
                                  )
                                  field.onChange(selectedSupplier?.id.toString())
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
              <FormMessage id={field.name} />
            </FormItem>
          )}
        />

        <FormField
          name="waste_type"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
                  <Container aria-hidden="true" strokeWidth={2} size={16} />
                </div>
                <Select name={field.name} defaultValue={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="ps-9">
                      <SelectValue placeholder="Select a type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="waste">Waste</SelectItem>
                    <SelectItem value="return">Return</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <DivTable>
          <DivTableHeader>
            <DivTableRow>
              <DivTableHead>Ingredients</DivTableHead>
              <DivTableHead>Inventory count</DivTableHead>
              <DivTableHead>Unit</DivTableHead>
              <DivTableHead>Reason</DivTableHead>
              <DivTableHead>Person(s) in charge</DivTableHead>
              <DivTableHead />
            </DivTableRow>
          </DivTableHeader>

          <DivTableBody>
            {fields.map((item, index) => {
              return (
                <DivTableRow key={item.id}>
                  <DivTableCell>{item.item}</DivTableCell>

                  <DivTableCell>
                    <FormField
                      name={`items.${index}.waste`}
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <NumberInput
                              className="min-w-32"
                              value={field.value}
                              aria-label="Quantity"
                              onChange={(event) => {
                                field.onChange(event)
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </DivTableCell>

                  <DivTableCell>
                    <FormField
                      name={`items.${index}.unit`}
                      control={form.control}
                      render={({ field }) => (
                        <FormItem className="space-y-0">
                          <FormControl>
                            <Input className="min-w-40 read-only:bg-muted" readOnly {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </DivTableCell>

                  <DivTableCell>
                    <FormField
                      name={`items.${index}.reason`}
                      control={form.control}
                      render={({ field }) => (
                        <FormItem className="space-y-0">
                          <FormControl>
                            <Input className="min-w-40" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </DivTableCell>

                  <DivTableCell>
                    <FormField
                      name={`items.${index}.employee`}
                      control={form.control}
                      render={({ field }) => (
                        <FormItem className="space-y-0">
                          <FormControl>
                            {/* @ts-expect-error -- Types dot not match yet */}
                            <MultipleSelector
                              placeholder="Select employee(s)"
                              options={employees}
                              commandProps={{
                                label: 'Select employee(s)',
                              }}
                              emptyIndicator={
                                <p className="text-center text-sm">No employees found.</p>
                              }
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </DivTableCell>

                  <DivTableCell>
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
                  </DivTableCell>
                </DivTableRow>
              )
            })}
          </DivTableBody>
        </DivTable>

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
                  This action cannot be undone. This will permanently delete the waste record.
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
