/* eslint-disable max-lines -- This page has complex logic that is necessary for its functionality */
import { useEffect, useState, type FormEvent } from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonAlert,
  useIonToast,
} from "@ionic/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { alertCircleOutline, checkmarkCircleOutline } from "ionicons/icons";
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
import type { Option } from "@/components/ui/multiselect";
import { NumberInput } from "@/components/ui/number-input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import MultiSelect from "./multiselect";

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
  const [isFormDirty, setIsFormDirty] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState<boolean>(false);
  const [isDateOpen, setIsDateOpen] = useState<boolean>(false);
  const [isItemPopoverOpen, setIsItemPopoverOpen] = useState<Record<number, boolean>>({});
  const [presentAlert] = useIonAlert();
  const [presentToast] = useIonToast();
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
        const parsedCategories = JSON.parse(savedCategories);

        if (Array.isArray(parsedCategories)) {
          setCategories(parsedCategories);
        } else {
          throw new Error("Categories data is invalid");
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

    void form.handleSubmit(async (data) => {
      const parsedValues = newWasteFormSchema.safeParse(data);

      if (!parsedValues.success) {
        throw new Error("Form data is invalid:", parsedValues.error);
      }

      setIsLoading(true);

      try {
        await createWasteEntry(parsedValues.data);
      } catch (error) {
        void presentToast({
          color: "danger",
          icon: alertCircleOutline,
          message: "Failed to create wastes entry. Please try again.",
          swipeGesture: "vertical",
        });
        throw new Error("Form submission failed");
      } finally {
        setIsLoading(false);
        void presentToast({
          duration: 1500,
          icon: checkmarkCircleOutline,
          message: "Wastes entry created successfully",
          swipeGesture: "vertical",
        });
        dismiss(null, "confirm");
      }
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

  useEffect(() => {
    if (form.formState.isDirty) {
      setIsFormDirty(true);
    } else {
      setIsFormDirty(false);
    }
  }, [form.formState.isDirty]);

  /**
   * Handles the dismissal of a confirmation dialog. If the form is dirty, it presents an alert
   * asking the user if they want to discard changes. If the user confirms, it dismisses the form
   * with a "confirm" action. If the form is not dirty, it dismisses the form with a "cancel"
   * action.
   */
  function handleDismissConfirmation() {
    if (isFormDirty) {
      void presentAlert({
        header: "Discard changes?",
        message: "Are you sure you want to close this form? Your changes will not be saved.",
        buttons: [
          {
            text: "Cancel",
          },
          {
            text: "Discard",
            handler: () => {
              dismiss(null, "confirm");
            },
          },
        ],
      });
    } else {
      dismiss(null, "cancel");
    }
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle className="text-center">New wastes</IonTitle>
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
                    <Popover open={isDateOpen} onOpenChange={setIsDateOpen} modal>
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
                          onSelect={(date) => {
                            field.onChange(date);
                            setIsDateOpen(false);
                          }}
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
                      <Popover open={isCategoryOpen} onOpenChange={setIsCategoryOpen} modal>
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
                                      setIsCategoryOpen(false);
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
                            <Popover
                              open={isItemPopoverOpen[index] || false}
                              onOpenChange={(open) => {
                                setIsItemPopoverOpen((prev) => ({
                                  ...prev,
                                  [index]: open,
                                }));
                              }}
                              modal
                            >
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
                                          value={ingredient.raw_material.trim()}
                                          key={ingredient.id}
                                          onSelect={(value) => {
                                            const selectedItem = ingredients.find(
                                              (ingredient) =>
                                                ingredient.raw_material.trim() === value,
                                            );
                                            field.onChange(selectedItem?.id.toString());
                                            form.setValue(
                                              `items.${index}.unit`,
                                              selectedItem != null ? selectedItem.unit : "",
                                            );
                                            setIsItemPopoverOpen((prev) => ({
                                              ...prev,
                                              [index]: false,
                                            }));
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
                              <MultiSelect
                                className="min-w-60"
                                placeholder="Select employee(s)"
                                value={field.value}
                                inputPlaceholder="Search employee..."
                                options={employees}
                                onChange={field.onChange}
                                multiple
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

            <div className="mt-1 flex flex-col gap-3">
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
                onClick={handleDismissConfirmation}
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
