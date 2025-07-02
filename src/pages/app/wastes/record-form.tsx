/* eslint-disable max-lines -- This is a large file */
import { useCallback, useMemo, useState, type FormEvent } from "react";
import { useIonRouter, useIonToast } from "@ionic/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { alertCircleOutline, checkmarkCircleOutline } from "ionicons/icons";
import { CalendarIcon, CheckIcon, ChevronDownIcon, Container, Trash2 } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";

import {
  deleteWasteRecordById,
  fetchCategories,
  fetchEmployees,
  updateWasteRecord,
} from "@/lib/api";
import { newWasteFormSchema, type NewWasteFormSchema } from "@/lib/form-schema";
import type { WasteFormData } from "@/lib/types/wastes";
import { cn } from "@/lib/utils";
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

interface WastesRecordFormProps {
  data: WasteFormData;
}

/**
 * WastesRecordForm component renders a form for viewing and editing waste records.
 *
 * This component displays a comprehensive form that shows:
 *
 * - Date and category information for the waste entry
 * - A detailed list of waste items with quantities and units
 * - Employee assignment for tracking responsibility
 * - Form validation to ensure data accuracy
 * - Submit handling for updating existing waste records
 * - Delete functionality for removing waste entries
 *
 * The form is pre-populated with existing waste data and allows users to modify dates, categories,
 * item quantities, and employee assignments as needed.
 *
 * @param props Component configuration and data
 * @param props.data The waste record data to display and edit
 * @returns JSX element representing the waste record editing form
 */
export function WastesRecordForm({ data }: WastesRecordFormProps) {
  const queryClient = useQueryClient();
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

  const router = useIonRouter();
  const [presentToast] = useIonToast();

  const updateWasteRecordMutation = useMutation({
    mutationFn: async (formData: NewWasteFormSchema) => {
      await updateWasteRecord(data.id, formData);
    },
    onError: async () => {
      await presentToast({
        color: "danger",
        icon: alertCircleOutline,
        message: "An error occurred while updating the waste record. Please try again.",
        swipeGesture: "vertical",
      });
    },
    onSuccess: async () => {
      await presentToast({
        icon: checkmarkCircleOutline,
        message: "Waste record updated!",
        swipeGesture: "vertical",
      });
      await queryClient.invalidateQueries({ queryKey: ["waste-entry", data.id.toString()] });
      await queryClient.invalidateQueries({ queryKey: ["wastes-entries"] });
      router.goBack();
    },
  });

  const deleteWasteRecordMutation = useMutation({
    mutationFn: async () => {
      await deleteWasteRecordById(data.id);
    },
    onError: async () => {
      await presentToast({
        color: "danger",
        icon: alertCircleOutline,
        message: "An error occurred while deleting the waste record. Please try again.",
        swipeGesture: "vertical",
      });
    },
    onSuccess: async () => {
      await presentToast({
        icon: checkmarkCircleOutline,
        message: "Waste record deleted!",
        swipeGesture: "vertical",
      });
      await queryClient.invalidateQueries({ queryKey: ["wastes-entries"] });
      router.goBack();
    },
  });

  const categories = categoriesQuery.data ?? [];
  const employees = useMemo(() => {
    if (employeesQuery.data == null) return [];
    return employeesQuery.data.map((employee) => ({
      value: employee.EmployeeID,
      label: employee.FirstName + " " + employee.LastName,
    }));
  }, [employeesQuery.data]);

  const [isCategoryOpen, setIsCategoryOpen] = useState<boolean>(false);
  const [isDateOpen, setIsDateOpen] = useState<boolean>(false);

  const defaultValues = useMemo(() => {
    const employeeString = data.items.map((item) => item.employee)[0];
    const parsed = JSON.parse(employeeString);
    if (
      !Array.isArray(parsed) ||
      !parsed.every((item): item is string => typeof item === "string")
    ) {
      throw new Error("Invalid employee data format");
    }
    const employeeArray = parsed;

    return {
      date: new Date(data.date),
      raw_material_type: data.raw_material_type_id.toString(),
      waste_type: data.waste_type,
      items: data.items.map((item) => ({
        item: item.raw_material_type,
        waste: item.waste,
        unit: item.unit ?? "pieces",
        reason: item.reason,
        employee: employeeArray,
      })),
    };
  }, [data]);

  const form = useForm<NewWasteFormSchema>({
    defaultValues,
    resolver: zodResolver(newWasteFormSchema),
  });
  const { fields, remove } = useFieldArray({
    name: "items",
    control: form.control,
  });

  const handleRemove = useCallback(
    (index: number) => {
      remove(index);
    },
    [remove],
  );

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      void form.handleSubmit(async (formData) => {
        const parsedValues = newWasteFormSchema.safeParse(formData);

        if (!parsedValues.success) {
          throw new Error("Form data is invalid:", parsedValues.error);
        }

        await updateWasteRecordMutation.mutateAsync(parsedValues.data);
      })(event);
    },
    [form.handleSubmit, updateWasteRecordMutation.mutateAsync],
  );

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
                <Popover open={isDateOpen} onOpenChange={setIsDateOpen}>
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
                  <Popover open={isCategoryOpen} onOpenChange={setIsCategoryOpen}>
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
              <DivTableHead>Items</DivTableHead>
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
                  <DivTableCell>
                    <div className="flex h-9 w-full items-center">{item.item}</div>
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
              );
            })}
          </DivTableBody>
        </DivTable>

        <div className="mt-1 flex flex-col gap-3">
          <Button type="submit" disabled={updateWasteRecordMutation.isPending}>
            {updateWasteRecordMutation.isPending ? "Saving..." : "Save"}
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
                    void deleteWasteRecordMutation.mutateAsync();
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
  );
}
