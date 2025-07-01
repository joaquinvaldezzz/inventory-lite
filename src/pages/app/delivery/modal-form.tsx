/* eslint-disable max-lines -- This page has complex logic that is necessary for its functionality */
import { useCallback, useEffect, useState, type FormEvent } from "react";
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
import { CalendarIcon, CheckIcon, ChevronDownIcon, Container, Plus, Trash2 } from "lucide-react";
import { Input as ReactInput, NumberField as ReactNumberField } from "react-aria-components";
import { useFieldArray, useForm } from "react-hook-form";

import { createDeliveryEntry, getItems, getSuppliers } from "@/lib/api";
import { newDeliveryFormSchema, type NewDeliveryFormSchema } from "@/lib/form-schema";
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
import { Textarea } from "@/components/ui/textarea";

interface DeliveryModalActions {
  dismiss: (data?: string | number | null, role?: string) => void;
}

/**
 * NewDeliveryModal component renders a modal form for creating new delivery entries.
 *
 * This modal provides a comprehensive form interface that includes:
 *
 * - Supplier selection for identifying the delivery source
 * - Date picker for setting the delivery date
 * - Remarks field for additional delivery notes
 * - Dynamic item management with add/remove functionality
 * - Form validation using Zod schema to ensure data integrity
 * - Submit handling to create new delivery records
 *
 * The component integrates with the parent component through a dismiss callback that handles modal
 * closure and triggers data refresh when a new entry is created.
 *
 * @param props Component configuration and callbacks
 * @param props.dismiss Function called to close the modal and handle form submission
 * @returns JSX element representing the delivery creation modal
 */
export function DeliveryFormModal({ dismiss }: DeliveryModalActions) {
  const [suppliersQuery, itemsQuery] = useQueries({
    queries: [
      {
        queryKey: ["suppliers"],
        queryFn: getSuppliers,
      },
      {
        queryKey: ["items"],
        queryFn: getItems,
      },
    ],
  });
  const createDeliveryEntryMutation = useMutation({
    mutationFn: async (formData: NewDeliveryFormSchema) => {
      await createDeliveryEntry(formData);
    },
    onError: async () => {
      await presentToast({
        color: "danger",
        icon: alertCircleOutline,
        message: "Failed to create delivery entry. Please try again.",
        swipeGesture: "vertical",
      });
    },
    onSuccess: async () => {
      await presentToast({
        icon: checkmarkCircleOutline,
        message: "Delivery entry created successfully",
        swipeGesture: "vertical",
      });
      dismiss(null, "confirm");
    },
  });

  const suppliers = suppliersQuery.data ?? [];
  const items = itemsQuery.data ?? [];

  const [isFormDirty, setIsFormDirty] = useState<boolean>(false);
  const [isSupplierOpen, setIsSupplierOpen] = useState<boolean>(false);
  const [isDateOpen, setIsDateOpen] = useState<boolean>(false);
  const [isItemPopoverOpen, setIsItemPopoverOpen] = useState<Record<number, boolean>>({});

  const [presentAlert] = useIonAlert();
  const [presentToast] = useIonToast();

  const form = useForm<NewDeliveryFormSchema>({
    defaultValues: {
      supplier: "",
      date_request: new Date(),
      payment_type: "",
      remarks: "",
      items: [
        {
          item: "",
          quantity_dr: 0,
          unit_dr: "",
          price: 0,
          total_amount: 0,
        },
      ],
    },
    resolver: zodResolver(newDeliveryFormSchema),
  });
  const { fields, append, remove } = useFieldArray({
    name: "items",
    control: form.control,
  });

  const handleAdd = useCallback(() => {
    append({
      item: "",
      quantity_dr: 0,
      unit_dr: "",
      price: 0,
      total_amount: 0,
    });
  }, [append]);

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      void form.handleSubmit(async (formValues) => {
        const parsedValues = newDeliveryFormSchema.safeParse(formValues);

        if (!parsedValues.success) {
          throw new Error("Form data is invalid:", parsedValues.error);
        }

        await createDeliveryEntryMutation.mutateAsync(parsedValues.data);
      })(event);
    },
    [createDeliveryEntryMutation.mutateAsync, form.handleSubmit],
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
          <IonTitle className="text-center">New delivery</IonTitle>
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
                          className="w-full max-w-(--radix-popper-anchor-width) min-w-(--radix-popper-anchor-width) border-input p-0"
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
                                    <span className="truncate">{supplier.supplier_name}</span>
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
                          autoFocus
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
                  <FormLabel>Payment type</FormLabel>
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

            <DivTable>
              <DivTableHeader>
                <DivTableRow>
                  <DivTableHead>Items</DivTableHead>
                  <DivTableHead>Quantity</DivTableHead>
                  <DivTableHead>Unit</DivTableHead>
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
                                            form.setValue(
                                              `items.${index}.unit_dr`,
                                              selectedItem != null ? selectedItem.unit : "",
                                            );
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
                                    items[index].quantity_dr * items[index].price,
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
                                    items[index].quantity_dr * items[index].price,
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
                          remove(index);
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

              <Button type="submit" disabled={createDeliveryEntryMutation.isPending}>
                {createDeliveryEntryMutation.isPending ? "Submitting..." : "Submit"}
              </Button>
              <Button
                type="button"
                disabled={createDeliveryEntryMutation.isPending}
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
