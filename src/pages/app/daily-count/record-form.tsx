import { startTransition, useEffect, useState, type FormEvent } from "react";
import { useIonRouter, useIonToast } from "@ionic/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { alertCircleOutline, checkmarkCircleOutline } from "ionicons/icons";
import { CalendarIcon, CheckIcon, ChevronDownIcon, Container } from "lucide-react";
import { useForm } from "react-hook-form";

import { deleteDailyCountRecordById, updateDailyCountRecord } from "@/lib/api";
import { newDailyCountFormSchema, type NewDailyCountFormSchema } from "@/lib/form-schema";
import { getFromStorage } from "@/lib/storage";
import type { Categories, DailyCountRecord } from "@/lib/types";
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
  data: DailyCountRecord;
}

/**
 * Component for rendering and managing the daily count record form.
 *
 * @param props The props for the component.
 * @param props.data The data for the daily count record.
 * @returns The rendered component.
 */
export function DailyCountRecordForm({ data }: DailyCountRecordFormProps) {
  const [categories, setCategories] = useState<Categories[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const form = useForm<NewDailyCountFormSchema>({
    defaultValues: {
      date: new Date(data.date),
      raw_material_type: data.raw_material_type_id.toString(),
      items: data.items.map((item) => ({
        item: item.item_id.toString(),
        count: item.count,
        unit: item.unit,
      })),
    },
    resolver: zodResolver(newDailyCountFormSchema),
  });
  const router = useIonRouter();
  const [presentToast] = useIonToast();

  useEffect(() => {
    /**
     * Fetches the list of suppliers from storage and updates the state.
     *
     * @returns A promise that resolves when the suppliers have been fetched and the state has been
     *   updated.
     * @throws Will log an error message to the console if there is an issue fetching the suppliers.
     */
    async function fetchCategories() {
      try {
        const savedCategories = await getFromStorage("categories");

        if (savedCategories != null) {
          const parsedCategories = JSON.parse(savedCategories) as unknown;

          if (Array.isArray(parsedCategories)) {
            setCategories(parsedCategories);
          } else {
            throw new Error("Categories data is invalid");
          }
        } else {
          throw new Error("No categories found in storage");
        }
      } catch (error) {
        throw new Error("Error fetching categories");
      }
    }

    startTransition(() => {
      void fetchCategories();
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
      const parsedValues = newDailyCountFormSchema.safeParse(formValues);

      if (!parsedValues.success) {
        throw new Error("Form data is invalid:", parsedValues.error);
      }

      setIsLoading(true);

      /** Submits the form data to update the delivery record. */
      async function submitForm() {
        try {
          await updateDailyCountRecord(data.id, formValues);
        } catch (error) {
          void presentToast({
            color: "danger",
            icon: alertCircleOutline,
            message: "Failed to update daily count record. Please try again.",
            swipeGesture: "vertical",
          });
          throw new Error("Form submission failed");
        } finally {
          setIsLoading(false);
          void presentToast({
            duration: 1500,
            icon: checkmarkCircleOutline,
            message: "Daily count record updated!",
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

  /** Handles the deletion of a delivery record. */
  async function handleDelete() {
    try {
      await deleteDailyCountRecordById(data.id);
    } catch (error) {
      void presentToast({
        color: "danger",
        icon: alertCircleOutline,
        message: "Failed to delete daily count record. Please try again.",
        swipeGesture: "vertical",
      });
      throw new Error("Error deleting daily count record");
    } finally {
      void presentToast({
        duration: 1500,
        icon: checkmarkCircleOutline,
        message: "Daily count record deleted!",
        swipeGesture: "vertical",
      });
      router.goBack();
    }
  }

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
          name="raw_material_type"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor={field.name}>Category</FormLabel>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
                  <Container strokeWidth={2} aria-hidden="true" size={16} />
                </div>
                <FormControl>
                  <Popover>
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
              <DivTableHead>Ingredients</DivTableHead>
              <DivTableHead>Inventory count</DivTableHead>
              <DivTableHead>Unit</DivTableHead>
            </DivTableRow>
          </DivTableHeader>

          <DivTableBody>
            {data.items.map((item, index) => (
              <DivTableRow key={index}>
                <DivTableCell>{item.item}</DivTableCell>
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
                  This action cannot be undone. This will permanently delete the daily count record.
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
      </form>
    </Form>
  );
}
