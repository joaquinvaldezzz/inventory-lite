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
import { CalendarIcon, CheckIcon, ChevronDownIcon, Container, Plus, Trash2 } from "lucide-react";
import { Input as ReactInput, NumberField as ReactNumberField } from "react-aria-components";
import { useFieldArray, useForm } from "react-hook-form";

import { createDeliveryEntry, getItems, getSuppliers } from "@/lib/api";
import { newDeliveryFormSchema, type NewDeliveryFormSchema } from "@/lib/form-schema";
import { getFromStorage } from "@/lib/storage";
import type { Items, Supplier } from "@/lib/types";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input, inputVariants } from "@/components/ui/input";
import { NumberInput } from "@/components/ui/number-input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";

interface ExpensesModalActions {
  dismiss: (data?: string | number | null, role?: string) => void;
}

/**
 * The `NewDeliveryModal` renders a modal for creating a new delivery entry. It includes a form with
 * fields for supplier, date, remarks, and a list of items. The form data is validated with a Zod
 * schema and submitted to create a new entry.
 *
 * @param {ExpensesModalActions} props - The props for the component.
 * @param {Function} props.dismiss - Function to dismiss the modal.
 */
export function NewExpensesModal({ dismiss }: ExpensesModalActions) {
  /** Initializes the state variables for suppliers, items, and loading status. */
  const [suppliers, setSuppliers] = useState<Supplier>([]);
  const [items, setItems] = useState<Items>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  /** Initializes the default form state using the `useForm` hook with the Zod resolver. */
  const form = useForm<NewDeliveryFormSchema>({
    defaultValues: {
      supplier: "",
      date_request: new Date(),
      remarks: "",
      items: [
        {
          item: "",
          quantity_dr: 0,
          unit_dr: "",
          unit_price: 0,
          total_amount: 0,
        },
      ],
    },
    resolver: zodResolver(newDeliveryFormSchema),
  });

  /** Initializes the `useFieldArray` hook to manage the list of delivery items. */
  const { fields, append, remove } = useFieldArray({
    name: "items",
    control: form.control,
  });

  /** Initializes the `useToast` hook for displaying toast messages. */
  const { toast } = useToast();

  useEffect(() => {
    // TODO: Save these suppliers locally
    /**
     * Fetches suppliers from an external source and updates the state with the retrieved suppliers.
     *
     * This function performs the following steps:
     *
     * 1. Calls the `getSuppliers` function to fetch suppliers.
     * 2. Retrieves the saved suppliers from storage using the `getFromStorage` function.
     * 3. Parses the retrieved suppliers and updates the state if the data is valid.
     *
     * If the suppliers data is invalid or not found in storage, appropriate error messages are
     * logged.
     *
     * @throws Will log an error message if there is an issue fetching suppliers or parsing the
     *   data.
     */
    async function fetchSuppliers() {
      try {
        await getSuppliers();

        const savedSuppliers = await getFromStorage("suppliers");

        if (savedSuppliers != null) {
          const parsedSuppliers = JSON.parse(savedSuppliers) as unknown;

          if (Array.isArray(parsedSuppliers)) {
            setSuppliers(parsedSuppliers);
          } else {
            console.error("Suppliers data is invalid:", parsedSuppliers);
          }
        } else {
          console.error("No suppliers found in storage");
        }
      } catch (error) {
        console.error("Error fetching suppliers:", error);
      }
    }

    startTransition(() => {
      void fetchSuppliers();
    });
  }, []);

  useEffect(() => {
    // TODO: Save these items locally
    /**
     * Fetches items from the server and updates the state with the retrieved items.
     *
     * This function makes an asynchronous call to `getItems` to retrieve the items. If the request
     * is successful, it updates the state with the retrieved items using the `setItems` function.
     * If an error occurs during the request, it logs the error to the console.
     */
    async function fetchItems() {
      try {
        const request = await getItems();
        setItems(request);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    }

    startTransition(() => {
      void fetchItems();
    });
  }, []);

  /** Adds a new row to the list of delivery items. */
  function handleAdd() {
    append({
      item: "",
      quantity_dr: 0,
      unit_dr: "",
      unit_price: 0,
      total_amount: 0,
    });
  }

  /**
   * Handles the removal of a row from the list of delivery items by removing the item at the
   * specified index.
   *
   * @param {number} index - The index of the item to be removed.
   */
  function handleRemove(index: number) {
    remove(index);
  }

  /**
   * Handles the form submission event.
   *
   * @param {FormEvent<HTMLFormElement>} event - The form submission event.
   */
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    /** Prevents the default form submission behavior. */
    event.preventDefault();

    /** Submits the form data to create a new delivery entry. */
    void form.handleSubmit(() => {
      /** Retrieves the form values. */
      const formValues = form.getValues();

      /** Validates the form data using the Zod schema. */
      const parsedValues = newDeliveryFormSchema.safeParse(formValues);

      /** Logs an error if the form data is invalid. */
      if (!parsedValues.success) {
        console.error("Form data is invalid:", parsedValues.error);
        return;
      }

      /** Sets the loading state to `true`. */
      setIsLoading(true);

      /**
       * Submits the delivery form by creating a new delivery entry.
       *
       * This function handles the form submission process. It attempts to create a new delivery
       * entry using the provided form values. If the creation is successful, it displays a success
       * message and dismisses the modal. If an error occurs during the process, it logs the error
       * to the console.
       */
      async function submitForm() {
        try {
          await createDeliveryEntry(formValues);
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
          <IonTitle className="text-center">New expenses</IonTitle>
          <IonButtons slot="end">
            <IonButton
              onClick={() => {
                dismiss(null, "confirm");
              }}
            >
              Confirm
            </IonButton>
          </IonButtons>
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
                                  suppliers.length === 0 && "text-muted-foreground",
                                )}
                              >
                                {suppliers.length > 0
                                  ? suppliers.find(
                                      (supplier) => supplier.id.toString() === field.value,
                                    )?.supplier_name
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
              name="remarks"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks</FormLabel>
                  <FormControl>
                    <Textarea className="min-h-24" placeholder="Enter your remarks" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="-mx-4 border-y whitespace-nowrap">
              <div className="relative w-full overflow-auto">
                <div className="table w-full caption-bottom pb-2 text-sm" role="table">
                  <div className="table-header-group" role="thead">
                    <div
                      className="table-row border-b border-border transition-colors *:first:pl-4 *:last:pr-4 hover:bg-muted/50 data-[state=selected]:bg-muted"
                      role="tr"
                    >
                      <div
                        className="table-cell h-12 px-3 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:w-px [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-0.5"
                        role="th"
                      >
                        Ingredients
                      </div>
                      <div className="table-cell h-12 px-3 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:w-px [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-0.5">
                        Quantity
                      </div>
                      <div className="table-cell h-12 px-3 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:w-px [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-0.5">
                        Unit
                      </div>
                      <div className="table-cell h-12 px-3 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:w-px [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-0.5">
                        Unit Price
                      </div>
                      <div className="table-cell h-12 px-3 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:w-px [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-0.5">
                        Total
                      </div>
                      <div className="table-cell h-12 px-3 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:w-px [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-0.5" />
                    </div>
                  </div>

                  <div
                    className="table-row-group **:[[role=td]]:px-1 **:[[role=td]]:py-1 **:[[role=td]]:first:pl-4 **:[[role=td]]:last:pr-4"
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
                                            items.length === 0 && "text-muted-foreground",
                                          )}
                                        >
                                          {items.length > 0
                                            ? items.find(
                                                (item) => item.id.toString() === field.value,
                                              )?.raw_material
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
                                              value={item.raw_material}
                                              key={item.id}
                                              onSelect={(value) => {
                                                const selectedItem = items.find(
                                                  (item) => item.raw_material === value,
                                                );
                                                field.onChange(selectedItem?.id.toString());
                                                form.setValue(
                                                  `items.${index}.unit_dr`,
                                                  selectedItem != null ? selectedItem.unit : "",
                                                );
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
                        </div>

                        <div
                          className="table-cell align-top [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-0.5"
                          role="td"
                        >
                          <FormField
                            name={`items.${index}.quantity_dr`}
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
                                        items[index].quantity_dr * items[index].unit_price,
                                      );
                                    }}
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
                          <FormField
                            name={`items.${index}.unit_dr`}
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
                        </div>

                        <div
                          className="table-cell align-top [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-0.5"
                          role="td"
                        >
                          <FormField
                            name={`items.${index}.unit_price`}
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
                                        items[index].quantity_dr * items[index].unit_price,
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
                        </div>

                        <div
                          className="table-cell align-top [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-0.5"
                          role="td"
                        >
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
                              handleRemove(index);
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

            {/* Make these buttons sticky at the bottom */}
            <div className="mt-1 flex flex-col gap-3">
              <Button type="button" variant="ghost" onClick={handleAdd}>
                <span>Add more ingredients</span>
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
