/* eslint-disable max-lines -- Safe to disable for this file */
import { Fragment, startTransition, useEffect, useRef, useState, type FormEvent } from "react";
import { useIonRouter } from "@ionic/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, CheckIcon, ChevronDownIcon, Container } from "lucide-react";
import { Input as ReactInput, NumberField as ReactNumberField } from "react-aria-components";
import { useForm } from "react-hook-form";

import { deleteDeliveryRecord, updateDeliveryRecord } from "@/lib/api";
import { editDeliveryFormSchema, type EditDeliveryFormSchema } from "@/lib/form-schema";
import { getFromStorage } from "@/lib/storage";
import type { DeliveryRecord, Supplier } from "@/lib/types";
import { cn, formatAsCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
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
import { Textarea } from "@/components/ui/textarea";

interface DeliveryRecordFormProps {
  data: DeliveryRecord;
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
export default function DeliveryRecordForm({ data }: DeliveryRecordFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [suppliers, setSuppliers] = useState<Supplier>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const form = useForm<EditDeliveryFormSchema>({
    defaultValues: {
      supplier: data.supplier_id.toString(),
      po_number: data.po_no,
      date_request: new Date(data.date_request),
      payment_type: data.payment_type_id.toString(),
      remarks: data.remarks,
      items: data.items.map((item) => ({
        item: item.item_id,
        quantity_actual: item.quantity_actual,
        quantity_dr: item.quantity_dr,
        unit_dr: item.unit,
        unit_price: item.price,
        total_amount: item.total_amount,
      })),
    },
    resolver: zodResolver(editDeliveryFormSchema),
  });
  const router = useIonRouter();
  const { toast } = useToast();

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

  /**
   * Handles the form submission event.
   *
   * @param event The form submission event.
   */
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    void form.handleSubmit(() => {
      const formValues = form.getValues();
      const parsedValues = editDeliveryFormSchema.safeParse(formValues);

      if (!parsedValues.success) {
        console.error("Form data is invalid:", parsedValues.error);
        return;
      }

      setIsLoading(true);

      /** Submits the form data to update the delivery record. */
      async function submitForm() {
        try {
          if (parsedValues.data != null) await updateDeliveryRecord(data.id, parsedValues.data);
        } catch (error) {
          toast({
            description: "An error occurred while saving changes. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
          toast({ description: "Successfully saved changes" });
          // router.goBack();
        }
      }

      startTransition(() => {
        void submitForm();
      });
    })(event);
  }

  /** Handles the deletion of a delivery record. */
  async function handleDelete() {
    try {
      await deleteDeliveryRecord(data.id);
    } catch (error) {
      console.error("Error deleting delivery record:", error);
      toast({
        description: "An error occurred while deleting the delivery record. Please try again.",
        variant: "destructive",
      });
    } finally {
      toast({ description: "Delivery record deleted" });
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
            name="po_number"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>PO no.</FormLabel>
                <FormControl>
                  <Input
                    className="read-only:bg-muted"
                    type="text"
                    readOnly
                    {...field}
                    value={data.po_no}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="date_request"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date delivered</FormLabel>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
                    <CalendarIcon aria-hidden="true" strokeWidth={2} size={16} />
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
                <Select name={field.name} defaultValue={field.value} onValueChange={field.onChange}>
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
                <DivTableHead>Ingredients</DivTableHead>
                <DivTableHead>Actual quantity</DivTableHead>
                <DivTableHead>Purchase order</DivTableHead>
                <DivTableHead>Delivery quantity</DivTableHead>
                <DivTableHead>Delivery unit</DivTableHead>
                <DivTableHead>Unit price</DivTableHead>
                <DivTableHead>Total amount</DivTableHead>
              </DivTableRow>
            </DivTableHeader>

            <DivTableBody>
              {data.items.map((item, index) => (
                <DivTableRow key={index}>
                  <DivTableCell>{item.raw_material}</DivTableCell>

                  <DivTableCell>
                    <FormField
                      name={`items.${index}.quantity_actual`}
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <NumberInput
                              value={field.value}
                              aria-label="Actual Quantity"
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

                  <DivTableCell>{item.unit_dr}</DivTableCell>

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
                              aria-label="DR Quantity"
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
                      name={`items.${index}.unit_dr`}
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

          {/* Make these buttons sticky at the bottom */}
          <div className="sticky inset-x-0 -bottom-4 -mx-4 mt-1 flex flex-col gap-4 border-t bg-background p-4">
            <div className="flex items-center justify-between">
              <div className="font-bold">Total</div>
              <div className="font-bold tabular-nums">{formatAsCurrency(data.total_amount)}</div>
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
                      This action cannot be undone. This will permanently delete the delivery
                      record.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        void handleDelete();
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
