/* eslint-disable max-lines -- This page has complex logic that is necessary for its functionality */
import { startTransition, useEffect, useState, type FormEvent } from "react";
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
import { CalendarIcon, CheckIcon, ChevronDownIcon, Container, Plus, Trash2 } from "lucide-react";
import { Input as ReactInput, NumberField as ReactNumberField } from "react-aria-components";
import { useFieldArray, useForm } from "react-hook-form";

import { createExpensesEntry, getItemsBySupplierId, getSuppliers } from "@/lib/api";
import { newExpensesFormSchema, type NewExpensesFormSchema } from "@/lib/form-schema";
import { getFromStorage } from "@/lib/storage";
import type { Items, Supplier } from "@/lib/types";
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
import { inputVariants } from "@/components/ui/input-variants";
import { NumberInput } from "@/components/ui/number-input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ExpensesModalActions {
  dismiss: (data?: string | number | null, role?: string) => void;
}

/**
 * The `NewExpensesModal` renders a modal for creating a new expenses entry. It includes a form with
 * various fields such as supplier, date, payment type, and items.
 *
 * @param props The props for the component.
 * @param props.dismiss Function to dismiss the modal.
 * @returns The rendered component.
 */
export function NewExpensesModal({ dismiss }: ExpensesModalActions) {
  const [suppliers, setSuppliers] = useState<Supplier>([]);
  const [items, setItems] = useState<Items>([]);
  const [isFormDirty, setIsFormDirty] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSupplierOpen, setIsSupplierOpen] = useState<boolean>(false);
  const [isDateOpen, setIsDateOpen] = useState<boolean>(false);
  const [isItemPopoverOpen, setIsItemPopoverOpen] = useState<Record<number, boolean>>({});
  const [presentAlert] = useIonAlert();
  const [presentToast] = useIonToast();
  const form = useForm<NewExpensesFormSchema>({
    defaultValues: {
      supplier: "",
      date: new Date(),
      payment_type: "",
      items: [
        {
          item: "",
          quantity: 0,
          price: 0,
          total_amount: 0,
        },
      ],
    },
    resolver: zodResolver(newExpensesFormSchema),
  });
  const { fields, append, remove } = useFieldArray({
    name: "items",
    control: form.control,
  });

  useEffect(() => {
    // TODO: Save these suppliers locally

    /**
     * Fetches suppliers from an external source and updates the state with the retrieved suppliers.
     *
     * @throws An error message if there is an issue fetching suppliers or parsing the data.
     */
    async function fetchSuppliers() {
      try {
        await getSuppliers();

        const savedSuppliers = await getFromStorage("suppliers");

        if (savedSuppliers != null) {
          const parsedSuppliers = JSON.parse(savedSuppliers);

          if (Array.isArray(parsedSuppliers)) {
            setSuppliers(parsedSuppliers);
          } else {
            throw new Error("Invalid suppliers data");
          }
        } else {
          throw new Error("No suppliers found in storage");
        }
      } catch (error) {
        throw new Error("Error fetching suppliers");
      }
    }

    startTransition(() => {
      void fetchSuppliers();
    });
  }, []);

  useEffect(() => {
    /**
     * Fetches items from the server and updates the state with the retrieved items.
     *
     * @todo Save these items locally
     */
    async function fetchItems() {
      try {
        const supplierId = form.getValues("supplier");

        if (supplierId.length > 0) {
          const request = await getItemsBySupplierId(supplierId);
          setItems(request);
        }
      } catch (error) {
        throw new Error("Error fetching items");
      }
    }

    void fetchItems();
  }, [form.watch("supplier")]);

  /** Adds a new row to the list of delivery items. */
  function handleAdd() {
    append({
      item: "",
      quantity: 0,
      price: 0,
      total_amount: 0,
    });
  }

  /**
   * Handles the removal of a row from the list of delivery items by removing the item at the
   * specified index.
   *
   * @param index The index of the item to be removed.
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
    /** Prevents the default form submission behavior. */
    event.preventDefault();

    /** Submits the form data to create a new delivery entry. */
    void form.handleSubmit(() => {
      const formValues = form.getValues();
      const parsedValues = newExpensesFormSchema.safeParse(formValues);

      if (!parsedValues.success) {
        throw new Error("Form data is invalid");
      }

      setIsLoading(true);

      /** Submits the delivery form by creating a new delivery entry. */
      async function submitForm() {
        try {
          await createExpensesEntry(formValues);
        } catch (error) {
          void presentToast({
            color: "danger",
            icon: alertCircleOutline,
            message: "Failed to create expenses entry. Please try again.",
            swipeGesture: "vertical",
          });
          throw new Error("Form submission failed");
        } finally {
          setIsLoading(false);
          void presentToast({
            duration: 1500,
            icon: checkmarkCircleOutline,
            message: "Expenses entry created successfully",
            swipeGesture: "vertical",
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
          <IonTitle className="text-center">New expenses</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding space-y-4">
        <Form {...form}>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <FormField
              name="supplier"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supplier</FormLabel>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
                      <Container aria-hidden="true" strokeWidth={2} size={16} />
                    </div>
                    <FormControl>
                      <Popover open={isSupplierOpen} onOpenChange={setIsSupplierOpen} modal>
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
                                {suppliers.length > 0
                                  ? (suppliers.find(
                                      (supplier) => supplier.id.toString() === field.value,
                                    )?.supplier_name ?? "Select a supplier")
                                  : "Select a supplier"}
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
                                {suppliers.map((supplier) => (
                                  <CommandItem
                                    value={supplier.supplier_name}
                                    key={supplier.id}
                                    onSelect={(value) => {
                                      const selectedSupplier = suppliers.find(
                                        (supplier) => supplier.supplier_name === value,
                                      );
                                      field.onChange(selectedSupplier?.id.toString());
                                      setIsSupplierOpen(false);
                                    }}
                                  >
                                    {supplier.supplier_name}
                                    {supplier.id.toString() === field.value && (
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
              name="payment_type"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mode of payment</FormLabel>
                  <Select
                    name={field.name}
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a payment type" />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      <SelectItem value="1">Cash</SelectItem>
                      <SelectItem value="0">Non-cash</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DivTable>
              <DivTableHeader>
                <DivTableRow>
                  <DivTableHead>Items</DivTableHead>
                  <DivTableHead>Quantity</DivTableHead>
                  <DivTableHead>Unit price</DivTableHead>
                  <DivTableHead>Total</DivTableHead>
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
                                      {items.length > 0
                                        ? (items.find((item) => item.id.toString() === field.value)
                                            ?.raw_material ?? "Select an item")
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
                                      {items.map((item) => (
                                        <CommandItem
                                          value={item.raw_material.trim()}
                                          key={item.id}
                                          onSelect={(value) => {
                                            const selectedItem = items.find(
                                              (item) => item.raw_material.trim() === value,
                                            );
                                            field.onChange(selectedItem?.id.toString());
                                            setIsItemPopoverOpen((prev) => ({
                                              ...prev,
                                              [index]: false,
                                            }));
                                          }}
                                        >
                                          {item.raw_material}
                                          {item.id.toString() === field.value && (
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
                        name={`items.${index}.quantity`}
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
                                  const { items } = form.getValues();
                                  form.setValue(
                                    `items.${index}.total_amount`,
                                    items[index].quantity * items[index].price,
                                  );
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
                        name={`items.${index}.price`}
                        control={form.control}
                        render={({ field }) => (
                          <FormItem className="flex flex-col gap-2 space-y-0">
                            <FormControl>
                              <ReactNumberField
                                formatOptions={{
                                  style: "currency",
                                  currency: "PHP",
                                  currencySign: "accounting",
                                }}
                                aria-label="Unit Price"
                                defaultValue={field.value}
                                onChange={(event) => {
                                  field.onChange(event);
                                  const { items } = form.getValues();
                                  form.setValue(
                                    `items.${index}.total_amount`,
                                    items[index].quantity * items[index].price,
                                  );
                                }}
                              >
                                <ReactInput
                                  className={cn(
                                    inputVariants(),
                                    "min-w-32 text-right tabular-nums read-only:bg-muted",
                                  )}
                                />
                              </ReactNumberField>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </DivTableCell>

                    <DivTableCell>
                      <FormField
                        name={`items.${index}.total_amount`}
                        control={form.control}
                        render={({ field }) => (
                          <FormItem className="flex flex-col gap-2 space-y-0">
                            <FormControl>
                              <ReactNumberField
                                formatOptions={{
                                  style: "currency",
                                  currency: "PHP",
                                  currencySign: "accounting",
                                }}
                                value={field.value}
                                aria-label="Total"
                                onChange={field.onChange}
                              >
                                <ReactInput
                                  className={cn(
                                    inputVariants(),
                                    "min-w-40 text-right tabular-nums read-only:bg-muted",
                                  )}
                                  readOnly
                                />
                              </ReactNumberField>
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
