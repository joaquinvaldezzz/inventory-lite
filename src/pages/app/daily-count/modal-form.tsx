/* eslint-disable max-lines -- Idk */
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
import { useMutation, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { alertCircleOutline, checkmarkCircleOutline } from "ionicons/icons";
import { CalendarIcon, CheckIcon, ChevronDownIcon, Container, Plus, Trash2 } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";

import { createDailyCountEntry, fetchCategories, getIngredientsByCategory } from "@/lib/api";
import { newDailyCountFormSchema, type NewDailyCountFormSchema } from "@/lib/form-schema";
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
import { NumberInput } from "@/components/ui/number-input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DailyCountModalActions {
  dismiss: (data?: string | number | null, role?: string) => void;
}

/**
 * DailyCountModal component renders a modal form for creating new daily count entries.
 *
 * This modal provides a comprehensive form interface that includes:
 *
 * - Date selection for the daily count entry
 * - Category selection for organizing entries
 * - Dynamic item management with add/generate/remove functionality
 * - Form validation to ensure data integrity
 * - Submit handling to create new daily count records
 *
 * The component integrates with the parent component through a dismiss callback that handles modal
 * closure and data refresh.
 *
 * @param props Component configuration and callbacks
 * @param props.dismiss Function called to close the modal and handle form submission
 * @returns JSX element representing the daily count creation modal
 */
export function DailyCountModal({ dismiss }: DailyCountModalActions) {
  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
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
  const createDailyCountEntryMutation = useMutation({
    mutationFn: async (data: NewDailyCountFormSchema) => {
      await createDailyCountEntry(data);
    },
    onError: async () => {
      await presentToast({
        color: "danger",
        icon: alertCircleOutline,
        message: "Failed to create daily count entry. Please try again.",
        swipeGesture: "vertical",
      });
    },
    onSuccess: async () => {
      await presentToast({
        duration: 1500,
        icon: checkmarkCircleOutline,
        message: "Daily count entry created successfully!",
        swipeGesture: "vertical",
      });
      dismiss(null, "confirm");
    },
  });

  const categories = categoriesQuery.data ?? [];
  const ingredients = ingredientsMutation.data ?? [];

  const [isFormDirty, setIsFormDirty] = useState<boolean>(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState<boolean>(false);
  const [isDateOpen, setIsDateOpen] = useState<boolean>(false);
  const [isItemPopoverOpen, setIsItemPopoverOpen] = useState<Record<number, boolean>>({});

  const [presentAlert] = useIonAlert();
  const [presentToast] = useIonToast();

  const form = useForm<NewDailyCountFormSchema>({
    defaultValues: {
      date: new Date(),
      raw_material_type: "",
      items: [{ item: "", count: 0, unit: "" }],
    },
    resolver: zodResolver(newDailyCountFormSchema),
  });
  const { fields, replace, append, remove } = useFieldArray({
    name: "items",
    control: form.control,
  });

  const generateItems = useCallback(() => {
    replace(
      ingredients.map((ingredient) => ({
        item: ingredient.id.toString(),
        count: 0,
        unit: ingredient.unit,
      })),
    );
  }, [ingredientsMutation.isSuccess, replace]);

  useEffect(() => {
    const category = form.getValues("raw_material_type");

    if (category.length === 0) {
      return;
    }

    void ingredientsMutation.mutateAsync(category);
  }, [form.watch("raw_material_type")]);

  useEffect(() => {
    generateItems();
  }, [ingredientsMutation.isSuccess, generateItems]);

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      void form.handleSubmit(async (formValues) => {
        const parsedValues = newDailyCountFormSchema.safeParse(formValues);

        if (!parsedValues.success) {
          throw new Error("Form data is invalid:", parsedValues.error);
        }

        await createDailyCountEntryMutation.mutateAsync(parsedValues.data);
      })(event);
    },
    [createDailyCountEntryMutation.mutateAsync, form.handleSubmit],
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
          <IonTitle className="text-center">New daily count</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
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
                            <CommandInput placeholder="Search category..." />
                            <CommandList>
                              <CommandEmpty>No category found.</CommandEmpty>
                              <CommandGroup>
                                {categories.map((category) => (
                                  <CommandItem
                                    value={category.raw_material_type}
                                    key={category.id}
                                    onSelect={(value) => {
                                      const selectedCategory = categories.find(
                                        (category) => category.raw_material_type === value,
                                      );
                                      field.onChange(selectedCategory?.id.toString());
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

            <DivTable>
              <DivTableHeader>
                <DivTableRow>
                  <DivTableHead>Items</DivTableHead>
                  <DivTableHead>Quantity</DivTableHead>
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
                            <FormControl>
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
                                              (ingredient) =>
                                                ingredient.id.toString() === field.value,
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
                                    <CommandInput placeholder="Search ingredient..." />
                                    <CommandList>
                                      <CommandEmpty>No category found.</CommandEmpty>
                                      <CommandGroup>
                                        {ingredients.map((ingredient) => (
                                          <CommandItem
                                            value={ingredient.raw_material.trim()}
                                            key={ingredient.id}
                                            onSelect={(value) => {
                                              const selectedIngredient = ingredients.find(
                                                (ingredient) =>
                                                  ingredient.raw_material.trim() === value,
                                              );
                                              field.onChange(selectedIngredient?.id.toString());
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
                            </FormControl>
                            <FormMessage id={field.name} />
                          </FormItem>
                        )}
                      />
                    </DivTableCell>

                    <DivTableCell>
                      <FormField
                        name={`items.${index}.count`}
                        control={form.control}
                        render={({ field }) => (
                          <FormItem className="flex flex-col gap-2 space-y-0">
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

            <div className="mt-1 flex flex-col gap-4">
              <Button
                type="button"
                disabled={createDailyCountEntryMutation.isPending}
                variant="ghost"
                onClick={() => {
                  append({ item: "", count: 0, unit: "" });
                }}
              >
                <span>Add another product</span>
                <Plus aria-hidden="true" strokeWidth={2} size={16} />
              </Button>
              <Button type="submit" disabled={createDailyCountEntryMutation.isPending}>
                Submit
              </Button>
              <Button
                type="button"
                disabled={createDailyCountEntryMutation.isPending}
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
