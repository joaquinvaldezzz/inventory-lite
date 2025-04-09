/* eslint-disable max-lines -- Safe to disable for this file */
import { Fragment, startTransition, useEffect, useRef, useState, type FormEvent } from "react";
import { useIonRouter, useIonToast } from "@ionic/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { alertCircleOutline, checkmarkCircleOutline } from "ionicons/icons";
import { CalendarIcon, CheckIcon, ChevronDownIcon, Container, Wallet } from "lucide-react";
import { Input as ReactInput, NumberField as ReactNumberField } from "react-aria-components";
import { useForm } from "react-hook-form";

import { deleteExpensesRecordById, getItems, updateExpensesRecord } from "@/lib/api";
import { editExpensesFormSchema, type EditExpensesFormSchema } from "@/lib/form-schema";
import { getFromStorage } from "@/lib/storage";
import type { ExpensesRecordData, Items, Supplier } from "@/lib/types";
import { cn, formatAsCurrency } from "@/lib/utils";
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
} from "@/components/ui/alert-dialog";
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
import { Input, inputVariants } from "@/components/ui/input";
import { NumberInput } from "@/components/ui/number-input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ExpenseRecordFormProps {
  data: ExpensesRecordData;
}

/**
 * DeliveryRecordForm component renders a form for editing or deleting a delivery record. It
 * initializes the form with default values from the provided data and handles form submission and
 * deletion.
 *
 * @param props The props for the DeliveryRecordForm component.
 * @param props.data The data for the delivery record.
 * @returns The rendered DeliveryRecordForm component.
 */
export default function ExpensesRecordForm({ data }: ExpenseRecordFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [suppliers, setSuppliers] = useState<Supplier>([]);
  const [items, setItems] = useState<Items>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const form = useForm<EditExpensesFormSchema>({
    defaultValues: {
      supplier: data.SupplierID.toString(),
      supplier_tin: data.SupplierTIN,
      date: new Date(data.InvoiceDate),
      payment_type: data.PaymentType,
      items: data.items.map((item) => ({
        item: item.Particulars,
        quantity: item.Quantity,
        price: item.Cost,
        total_amount: item.Amount,
      })),
    },
    resolver: zodResolver(editExpensesFormSchema),
  });
  const router = useIonRouter();
  const [presentToast] = useIonToast();

  useEffect(() => {
    // TODO: Save these suppliers locally

    /**
     * Fetches the list of suppliers from storage and updates the state.
     *
     * @returns A promise that resolves when the suppliers have been fetched and the state has been
     *   updated.
     * @throws An error message to the console if there is an issue fetching the suppliers.
     */
    async function fetchSuppliers() {
      try {
        const savedSuppliers = await getFromStorage("suppliers");

        if (savedSuppliers != null) {
          const parsedSuppliers = JSON.parse(savedSuppliers) as unknown;

          if (Array.isArray(parsedSuppliers)) {
            setSuppliers(parsedSuppliers);
          } else {
            throw new Error("Suppliers data is invalid");
          }
        } else {
          throw new Error("No suppliers found in storage");
        }
      } catch (error) {
        throw new Error("Failed to fetch suppliers");
      }
    }

    startTransition(() => {
      void fetchSuppliers();
    });
  }, []);

  useEffect(() => {
    /**
     * Fetches a list of items asynchronously and updates the state with the retrieved items.
     *
     * @throws An error message if the items cannot be fetched.
     */
    async function fetchItems() {
      try {
        const items = await getItems();
        setItems(items);
      } catch (error) {
        throw new Error("Failed to fetch items");
      }
    }

    void fetchItems();
  }, []);

  /**
   * Handles the form submission event.
   *
   * @param event The form submission event.
   */
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    void form.handleSubmit(() => {
      const formValues = form.getValues();
      const parsedValues = editExpensesFormSchema.safeParse(formValues);

      if (!parsedValues.success) {
        throw new Error("Form data is invalid");
      }

      setIsLoading(true);

      /** Submits the form data to update the delivery record. */
      async function submitForm() {
        try {
          if (parsedValues.data != null)
            await updateExpensesRecord(data.PurchaseID, parsedValues.data);
        } catch (error) {
          void presentToast({
            duration: 1500,
            icon: checkmarkCircleOutline,
            message: "An error occurred while saving changes. Please try again.",
            swipeGesture: "vertical",
          });
        } finally {
          setIsLoading(false);
          void presentToast({
            duration: 1500,
            icon: checkmarkCircleOutline,
            message: "Expenses record updated!",
            swipeGesture: "vertical",
          });
          router.goBack();
        }
      }

      startTransition(() => {
        void submitForm();
      });
    })(event);
  }

  /** Handles the deletion of a expenses record. */
  function handleDelete() {
    try {
      // await deleteExpensesRecordById(data.PurchaseID);
    } catch (error) {
      void presentToast({
        color: "danger",
        icon: alertCircleOutline,
        message: "An error occurred while deleting the expenses record. Please try again.",
        swipeGesture: "vertical",
      });
      throw new Error("Failed to delete expenses record");
    } finally {
      void presentToast({
        duration: 1500,
        icon: checkmarkCircleOutline,
        message: "Expenses record deleted!",
        swipeGesture: "vertical",
      });
      router.goBack();
    }
  }

  return (
    <Fragment>
      <Form {...form}>
        <form className="space-y-5" ref={formRef} onSubmit={handleSubmit}>
          <FormField
            name="supplier"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supplier</FormLabel>

                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
                    <Container strokeWidth={2} aria-hidden="true" size={16} />
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
                                  }}
                                >
                                  <span className="truncate"> {supplier.supplier_name}</span>
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
            name="supplier_tin"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supplier TIN</FormLabel>
                <FormControl>
                  <Input className="read-only:bg-muted" type="text" readOnly {...field} />
                </FormControl>
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
                    <CalendarIcon strokeWidth={2} aria-hidden="true" size={16} />
                  </div>
                  <Popover>
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
            name="payment_type"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment type</FormLabel>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
                    <Wallet strokeWidth={2} aria-hidden="true" size={16} />
                  </div>
                  <Select
                    name={field.name}
                    defaultValue={field.value === "Cash" ? "1" : "0"}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger className="ps-9">
                        <SelectValue placeholder="Select a payment type" />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      <SelectItem value="1">Cash</SelectItem>
                      <SelectItem value="0">Non-cash</SelectItem>
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
                <DivTableHead>Item</DivTableHead>
                <DivTableHead>Quantity</DivTableHead>
                <DivTableHead>Unit price</DivTableHead>
                <DivTableHead>Total amount</DivTableHead>
                <DivTableHead />
              </DivTableRow>
            </DivTableHeader>

            <DivTableBody>
              {data.items.map((_, index) => (
                <DivTableRow key={index}>
                  <DivTableCell>
                    <FormField
                      name={`items.${index}.item`}
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
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
                                        "truncate",
                                        field.value.length === 0 && "text-muted-foreground",
                                      )}
                                    >
                                      {items.length > 0
                                        ? (items.find(
                                            (supplier) =>
                                              supplier.raw_material.trim() === field.value.trim(),
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
                                className="w-full max-w-(--radix-popper-anchor-width) min-w-(--radix-popper-anchor-width) border-input p-0"
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
                                            const selectedSupplier = items.find(
                                              (item) => item.raw_material.trim() === value,
                                            );
                                            field.onChange(selectedSupplier?.id.toString());
                                          }}
                                        >
                                          <span className="truncate">{item.raw_material}</span>
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
                          </FormControl>
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
                              className="min-w-40"
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
                      name={`items.${index}.price`}
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <ReactNumberField
                              formatOptions={{
                                style: "currency",
                                currency: "PHP",
                                currencySign: "accounting",
                              }}
                              aria-label="Unit Price"
                              defaultValue={field.value}
                            >
                              <ReactInput
                                className={cn(
                                  inputVariants(),
                                  "min-w-40 text-right tabular-nums read-only:bg-muted",
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
                        <FormItem>
                          <FormControl>
                            <ReactNumberField
                              formatOptions={{
                                style: "currency",
                                currency: "PHP",
                                currencySign: "accounting",
                              }}
                              aria-label="Total amount"
                              defaultValue={field.value}
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
                </DivTableRow>
              ))}
            </DivTableBody>
          </DivTable>

          <div className="mt-1 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="font-bold">Total</div>
              <div className="font-bold tabular-nums">{formatAsCurrency(data.TotalDR)}</div>
            </div>

            <div className="flex flex-col gap-3">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save"}
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
                      This action cannot be undone. This will permanently delete the expenses
                      record.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        handleDelete();
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
          </div>
        </form>
      </Form>
    </Fragment>
  );
}
