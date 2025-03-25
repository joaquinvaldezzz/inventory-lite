/* eslint-disable max-lines -- This page has complex logic that is necessary for its functionality */
import { startTransition, useEffect, useState, type FormEvent } from "react";
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
  CalendarIcon,
  CheckIcon,
  ChevronDownIcon,
  Container,
  PackageSearch,
  Plus,
  Trash2,
} from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";

import {
  createWasteEntry,
  fetchCategories,
  fetchEmployees,
  getIngredientsByCategory,
} from "@/lib/api";
import { newWasteFormSchema, type NewWasteFormSchema } from "@/lib/form-schema";
import { getFromStorage } from "@/lib/storage";
import type { Categories, Ingredients } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DivTable,
  DivTableBody,
  DivTableCell,
  DivTableHead,
  DivTableHeader,
  DivTableRow,
} from "@/components/ui/div-table";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import MultipleSelector, { type Option } from "@/components/ui/multiselect";
import { NumberInput } from "@/components/ui/number-input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WastesModalActions {
  dismiss: (data?: string | number | null, role?: string) => void;
}

/**
 * A modal for creating new waste entries.
 *
 * @param actions Actions to be performed when the modal is dismissed
 * @param actions.dismiss Function to dismiss the modal
 * @returns The rendered component.
 */
export function WastesFormModal({ dismiss }: WastesModalActions) {
  const [categories, setCategories] = useState<Categories[]>([]);
  const [ingredients, setIngredients] = useState<Ingredients[]>([]);
  const [employees, setEmployees] = useState<Option[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const form = useForm<NewWasteFormSchema>({
    defaultValues: {
      date: new Date(),
      raw_material_type: "",
      waste_type: "",
      items: [
        {
          item: "",
          waste: 0,
          unit: "",
          reason: "",
          employee: [],
        },
      ],
    },
    resolver: zodResolver(newWasteFormSchema),
  });
  const { fields, append, remove } = useFieldArray({
    name: "items",
    control: form.control,
  });
  const { toast } = useToast();

  useEffect(() => {
    /**
     * Fetches categories and retrieves saved categories from storage.
     *
     * @returns A promise that resolves when the operation is complete.
     */
    async function getCategoryItems() {
      await fetchCategories();

      const savedCategories = await getFromStorage("categories");

      if (savedCategories != null) {
        const parsedCategories = JSON.parse(savedCategories) as unknown;

        if (Array.isArray(parsedCategories)) {
          setCategories(parsedCategories);
        } else {
          console.error("Categories data is invalid:", parsedCategories);
        }
      }
    }

    void getCategoryItems();
  }, []);

  useEffect(() => {
    /**
     * Fetches ingredient items based on the selected raw material type from the form. If no raw
     * material type is selected, the function returns early.
     *
     * @returns A promise that resolves when the ingredients are fetched and state is updated.
     */
    async function getIngredientItems() {
      if (form.getValues("raw_material_type").length === 0) {
        return;
      }

      const ingredients = await getIngredientsByCategory(form.getValues("raw_material_type"));
      setIngredients(ingredients);
      remove();
    }

    void getIngredientItems();
  }, [form.watch("raw_material_type")]);

  /** Adds a new row to the form */
  function handleAdd() {
    append({
      item: "",
      waste: 0,
      unit: "",
      reason: "",
      employee: [],
    });
  }

  /**
   * Removes a row from the form
   *
   * @param index The index of the row to be removed
   */
  function handleRemove(index: number) {
    remove(index);
  }

  /**
   * Handles the form submission event.
   *
   * @param event The form submission event.
   */
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    void form.handleSubmit(() => {
      const formValues = form.getValues();
      const parsedValues = newWasteFormSchema.safeParse(formValues);

      if (!parsedValues.success) {
        console.error("Form data is invalid:", parsedValues.error);
        return;
      }

      setIsLoading(true);

      /** Submits the form data */
      async function submitForm() {
        try {
          if (parsedValues.data != null) await createWasteEntry(parsedValues.data);
        } catch (error) {
          console.error("Form submission failed:", error);
        } finally {
          setIsLoading(false);
          toast({
            description: "Delivery entry created successfully",
          });
          dismiss(null, "confirm");
        }
      }

      startTransition(() => {
        void submitForm();
      });
    })(event);
  }

  useEffect(() => {
    /**
     * Fetches the list of employees, maps the data to a specific format, and updates the state with
     * the formatted data.
     *
     * @returns A promise that resolves when the employees have been fetched and the state has been
     *   updated.
     */
    async function getEmployees() {
      const employees = await fetchEmployees();
      const data = employees.map((employee) => {
        return {
          value: employee.EmployeeID,
          label: employee.FirstName + " " + employee.LastName,
        };
      });

      setEmployees(data);
    }

    void getEmployees();
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton
              onClick={() => {
                dismiss(null, "cancel");
              }}
            >
              Cancel
            </IonButton>
          </IonButtons>
          <IonTitle className="text-center">New wastes</IonTitle>
          <IonButtons slot="end">
            <IonButton
              onClick={() => {
                dismiss(null, "confirm");
              }}
            >
              Submit
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding space-y-4">
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
                            className={cn("w-full justify-start ps-9 text-left font-normal")}
                            variant="outline"
                          >
                            {field.value instanceof Date && !isNaN(field.value.getTime()) ? (
                              format(field.value, "PP")
                            ) : (
                              <span>Select a date</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
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
                                  "truncate ps-6",
                                  field.value.length === 0 && "text-muted-foreground",
                                )}
                              >
                                {categories.length > 0
                                  ? (categories.find(
                                      (category) => category.id.toString() === field.value,
                                    )?.raw_material_type ?? "Select a category")
                                  : "Select a category"}
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
                                      const selectedSupplier = categories.find(
                                        (supplier) => supplier.raw_material_type === value,
                                      );
                                      field.onChange(selectedSupplier?.id.toString());
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

            <FormField
              name="waste_type"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
                      <PackageSearch aria-hidden="true" strokeWidth={2} size={16} />
                    </div>
                    <Select
                      name={field.name}
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                    >
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
                  <DivTableHead>Items</DivTableHead>
                  <DivTableHead>Quantity</DivTableHead>
                  <DivTableHead>Unit</DivTableHead>
                  <DivTableHead>Reason</DivTableHead>
                  <DivTableHead>Person(s) in charge</DivTableHead>
                  <DivTableHead />
                </DivTableRow>
              </DivTableHeader>

              <DivTableBody>
                {fields.map((_, index) => (
                  <DivTableRow key={index}>
                    <DivTableCell>
                      <FormField
                        name={`items.${index}.item`}
                        control={form.control}
                        render={({ field }) => (
                          <FormItem className="flex flex-col gap-2 space-y-0">
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
                                        "truncate",
                                        field.value.length === 0 && "text-muted-foreground",
                                      )}
                                    >
                                      {ingredients.length > 0
                                        ? (ingredients.find(
                                            (item) => item.id.toString() === field.value,
                                          )?.raw_material ?? "Select an item")
                                        : "Select an item"}
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
                                  <CommandInput placeholder="Search item..." />
                                  <CommandList>
                                    <CommandEmpty>No item found.</CommandEmpty>
                                    <CommandGroup>
                                      {ingredients.map((ingredient) => (
                                        <CommandItem
                                          value={ingredient.raw_material}
                                          key={ingredient.id}
                                          onSelect={(value) => {
                                            const selectedItem = ingredients.find(
                                              (ingredient) => ingredient.raw_material === value,
                                            );
                                            field.onChange(selectedItem?.id.toString());
                                            form.setValue(
                                              `items.${index}.unit`,
                                              selectedItem != null ? selectedItem.unit : "",
                                            );
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
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </DivTableCell>

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
                                  field.onChange(event);
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
                          <FormItem className="flex flex-col gap-2 space-y-0">
                            <FormControl>
                              <Input
                                className="min-w-32 read-only:bg-muted"
                                type="text"
                                readOnly
                                {...field}
                              />
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
                          <FormItem className="flex flex-col gap-2 space-y-0">
                            <FormControl>
                              <Input className="min-w-40" type="text" {...field} />
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
                          <FormItem className="flex flex-col gap-2 space-y-0">
                            <FormControl>
                              {/* @ts-expect-error -- Types dot not match yet */}
                              <MultipleSelector
                                placeholder="Select employee(s)"
                                options={employees}
                                commandProps={{
                                  label: "Select employee(s)",
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
                          handleRemove(index);
                        }}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </DivTableCell>
                  </DivTableRow>
                ))}
              </DivTableBody>
            </DivTable>

            <div className="sticky inset-x-0 -bottom-4 -mx-4 mt-1 flex flex-col gap-4 border-t bg-background p-4">
              <Button type="button" variant="ghost" onClick={handleAdd}>
                <span>Add more items</span>
                <Plus aria-hidden="true" strokeWidth={2} size={16} />
              </Button>

              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Submitting..." : "Submit"}
              </Button>
              <Button
                type="button"
                disabled={isLoading}
                variant="ghost"
                onClick={() => {
                  dismiss(null, "cancel");
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </IonContent>
    </IonPage>
  );
}
