import { useCallback, useMemo, useState, type FormEvent } from "react";
import { useIonRouter, useIonToast } from "@ionic/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { alertCircleOutline, checkmarkCircleOutline } from "ionicons/icons";
import { CalendarIcon, CheckIcon, ChevronDownIcon, Container } from "lucide-react";
import { useForm } from "react-hook-form";

import { deleteDailyCountRecordById, fetchCategories, updateDailyCountRecord } from "@/lib/api";
import { newDailyCountFormSchema, type NewDailyCountFormSchema } from "@/lib/form-schema";
import type { DailyCountFormData } from "@/lib/types/daily-count";
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

interface DailyCountRecordFormProps {
  data: DailyCountFormData;
}

/**
 * DailyCountRecordForm component renders a form for viewing and editing daily count records.
 *
 * This component displays a comprehensive form that shows:
 *
 * - Date and category information for the daily count entry
 * - A detailed list of items with their counts and units
 * - Form validation to ensure data accuracy
 * - Submit handling for updating existing daily count records
 *
 * The form is pre-populated with existing data and allows users to modify individual item counts
 * and add new items as needed.
 *
 * @param props Component configuration and data
 * @param props.data The daily count record data to display and edit
 * @returns JSX element representing the daily count record editing form
 */
export function DailyCountRecordForm({ data }: DailyCountRecordFormProps) {
  const queryClient = useQueryClient();
  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });
  const updateDailyCountRecordMutation = useMutation({
    mutationFn: async (formData: NewDailyCountFormSchema) => {
      await updateDailyCountRecord(data.id, formData);
    },
    onError: async () => {
      await presentToast({
        color: "danger",
        icon: alertCircleOutline,
        message: "Failed to update daily count record. Please try again.",
        swipeGesture: "vertical",
      });
    },
    onSuccess: async () => {
      await presentToast({
        icon: checkmarkCircleOutline,
        message: "Daily count record updated!",
        swipeGesture: "vertical",
      });
      await queryClient.invalidateQueries({
        queryKey: ["daily-count-record", data.id.toString()],
      });
      await queryClient.invalidateQueries({ queryKey: ["daily-count-entries"] });
      router.goBack();
    },
  });

  const deleteDailyCountRecordMutation = useMutation({
    mutationFn: async () => {
      await deleteDailyCountRecordById(data.id);
    },
    onError: async () => {
      await presentToast({
        color: "danger",
        icon: alertCircleOutline,
        message: "Failed to delete daily count record. Please try again.",
        swipeGesture: "vertical",
      });
    },
    onSuccess: async () => {
      await presentToast({
        duration: 1500,
        icon: checkmarkCircleOutline,
        message: "Daily count record deleted!",
        swipeGesture: "vertical",
      });
      await queryClient.invalidateQueries({ queryKey: ["daily-count-entries"] });
      router.goBack();
    },
  });

  const router = useIonRouter();
  const [presentToast] = useIonToast();

  const categories = categoriesQuery.data ?? [];

  const [isCategoryOpen, setIsCategoryOpen] = useState<boolean>(false);
  const [isDateOpen, setIsDateOpen] = useState<boolean>(false);

  const defaultValues = useMemo(
    () => ({
      date: new Date(data.date),
      raw_material_type: data.raw_material_type_id.toString(),
      items: data.items.map((item) => ({
        item: item.item_id.toString(),
        count: item.count,
        unit: item.unit,
      })),
    }),
    [data],
  );
  const form = useForm<NewDailyCountFormSchema>({
    defaultValues,
    resolver: zodResolver(newDailyCountFormSchema),
  });

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      void form.handleSubmit(async () => {
        const formValues = form.getValues();
        const parsedValues = newDailyCountFormSchema.safeParse(formValues);

        if (!parsedValues.success) {
          throw new Error("Form data is invalid:", parsedValues.error);
        }

        await updateDailyCountRecordMutation.mutateAsync(formValues);
      })(event);
    },
    [form.handleSubmit, updateDailyCountRecordMutation.mutateAsync],
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
              <FormLabel htmlFor={field.name}>Category</FormLabel>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
                  <Container aria-hidden="true" strokeWidth={2} size={16} />
                </div>
                <FormControl>
                  <Popover open={isCategoryOpen} onOpenChange={setIsCategoryOpen}>
                    <PopoverTrigger id={field.name} asChild>
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

        <DivTable>
          <DivTableHeader>
            <DivTableRow>
              <DivTableHead>Items</DivTableHead>
              <DivTableHead>Inventory count</DivTableHead>
              <DivTableHead>Unit</DivTableHead>
            </DivTableRow>
          </DivTableHeader>

          <DivTableBody>
            {data.items.map((item, index) => (
              <DivTableRow key={index}>
                <DivTableCell>
                  <div className="flex h-9 w-full items-center">{item.item}</div>
                </DivTableCell>

                <DivTableCell>
                  <FormField
                    name={`items.${index}.count`}
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <NumberInput
                            className="min-w-32"
                            value={field.value}
                            aria-label="Inventory count"
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
              </DivTableRow>
            ))}
          </DivTableBody>
        </DivTable>

        <div className="mt-1 flex flex-col gap-3">
          <Button type="submit" disabled={updateDailyCountRecordMutation.isPending}>
            {updateDailyCountRecordMutation.isPending ? "Saving..." : "Save"}
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
                  This action cannot be undone. This will permanently delete the daily count record.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    void deleteDailyCountRecordMutation.mutateAsync();
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
