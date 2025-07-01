/* eslint-disable max-lines -- This page has complex logic that is necessary for its functionality */
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
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
import { useMutation, useQueries } from "@tanstack/react-query";
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
 * WasteModal component renders a modal form for creating new waste entries.
 *
 * This modal provides a comprehensive form interface that includes:
 *
 * - Date selection for the waste entry
 * - Category selection for organizing waste types
 * - Dynamic item management with add/remove functionality
 * - Form validation to ensure data integrity
 * - Submit handling to create new waste records
 *
 * The component integrates with the parent component through a dismiss callback that handles modal
 * closure and triggers data refresh when a new waste entry is created.
 *
 * @param actions Component actions and callbacks
 * @param actions.dismiss Function called to close the modal and handle form submission
 * @returns JSX element representing the waste creation modal
 */
export function WastesFormModal({ dismiss }: WastesModalActions) {
  const [categoriesQuery, employeesQuery] = useQueries({
    queries: [
      {
        queryKey: ["categories"],
        queryFn: fetchCategories,
      },
      {
        queryKey: ["employees"],
        queryFn: fetchEmployees,
      },
    ],
  });
  const ingredientsMutation = useMutation({
    mutationFn: async (category: string) => {
      return await getIngredientsByCategory(category);
    },
    onError: async () => {
      await presentToast({
        color: "danger",
        icon: alertCircleOutline,
        message: "Failed to fetch ingredients. Please try again.",
        swipeGesture: "vertical",
      });
    },
  });
  const createWasteEntryMutation = useMutation({
    mutationFn: async (data: NewWasteFormSchema) => {
      await createWasteEntry(data);
    },
    onError: async () => {
      await presentToast({
        color: "danger",
        icon: alertCircleOutline,
        message: "Failed to create waste entry. Please try again.",
        swipeGesture: "vertical",
      });
    },
    onSuccess: async () => {
      await presentToast({
        duration: 1500,
        icon: checkmarkCircleOutline,
        message: "Wastes entry created successfully",
        swipeGesture: "vertical",
      });
      dismiss(null, "confirm");
    },
  });

  const categories = categoriesQuery.data ?? [];
  const ingredients = ingredientsMutation.data ?? [];
  const employees = useMemo(() => {
    if (employeesQuery.data == null) return [];
    return employeesQuery.data.map((employee) => ({
      value: employee.EmployeeID,
      label: employee.FirstName + " " + employee.LastName,
    }));
  }, [employeesQuery.data]);

  const [isFormDirty, setIsFormDirty] = useState<boolean>(false);
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
    const category = form.getValues("raw_material_type");

    if (category.length === 0) return;

    void ingredientsMutation.mutateAsync(category);
    remove();
  }, [form.getValues("raw_material_type")]);

  const handleAdd = useCallback(() => {
    append({
      item: "",
      waste: 0,
      unit: "",
      reason: "",
      employee: [],
    });
  }, [append]);

  const handleRemove = useCallback(
    (index: number) => {
      remove(index);
    },
    [remove],
  );

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      void form.handleSubmit(async (formValues) => {
        const parsedValues = newWasteFormSchema.safeParse(formValues);

        if (!parsedValues.success) {
          throw new Error("Form data is invalid:", parsedValues.error);
        }

        await createWasteEntryMutation.mutateAsync(parsedValues.data);
      })(event);
    },
    [createWasteEntryMutation.mutateAsync, form.handleSubmit],
  );

  useEffect(() => {
    if (form.formState.isDirty) {
      setIsFormDirty(true);
    } else {
      setIsFormDirty(false);
    }
  }, [form.formState.isDirty]);

  const handleDismissConfirmation = useCallback(() => {
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
  }, [dismiss, isFormDirty, presentAlert]);

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
              <Button type="submit" disabled={createWasteEntryMutation.isPending}>
                {createWasteEntryMutation.isPending ? "Submitting..." : "Submit"}
              </Button>
              <Button
                type="button"
                disabled={createWasteEntryMutation.isPending}
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
