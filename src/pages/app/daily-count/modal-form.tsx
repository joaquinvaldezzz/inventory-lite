/* eslint-disable max-lines -- Idk */
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
import { useFieldArray, useForm } from "react-hook-form";

import { createDailyCountEntry, fetchCategories, getIngredientsByCategory } from "@/lib/api";
import { newDailyCountFormSchema, type NewDailyCountFormSchema } from "@/lib/form-schema";
import { getFromStorage } from "@/lib/storage";
import type { Categories, Ingredients } from "@/lib/types";
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
 * The `NewDailyCountModal` component renders a modal for creating a new daily count entry. It
 * provides a form with fields for date, category, and items, allowing users to dynamically add,
 * generate, and remove items. The form data is validated and submitted to create a new daily count
 * entry.
 *
 * @param props The component props.
 * @param props.dismiss The function to dismiss the modal.
 * @returns The rendered component.
 */
export function DailyCountModal({ dismiss }: DailyCountModalActions) {
  const [categories, setCategories] = useState<Categories[]>([]);
  const [ingredients, setIngredients] = useState<Ingredients[]>([]);
  const [isFormDirty, setIsFormDirty] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState<boolean>(false);
  const [isDateOpen, setIsDateOpen] = useState<boolean>(false);
  const [presentAlert] = useIonAlert();
  const [presentToast] = useIonToast();
  const form = useForm<NewDailyCountFormSchema>({
    defaultValues: {
      date: new Date(),
      raw_material_type: "",
      items: [],
    },
    resolver: zodResolver(newDailyCountFormSchema),
  });
  const { fields, replace, append, remove } = useFieldArray({
    name: "items",
    control: form.control,
  });

  /** Adds a new row to the items field array. */
  function handleAdd() {
    append({
      item: "",
      count: 0,
      unit: "",
    });
  }

  /** Generates a new list of ingredients with their counts set to 0 and replaces the current list. */
  function handleGenerate() {
    replace(
      ingredients.map((ingredient) => ({
        item: ingredient.id.toString(),
        count: 0,
        unit: ingredient.unit,
      })),
    );
  }

  /**
   * Handles the removal of a row at the specified index.
   *
   * @param index The index of the item to be removed.
   */
  function handleRemove(index: number) {
    remove(index);
  }

  useEffect(() => {
    /**
     * Fetches categories from the API endpoint and retrieves saved categories from storage.
     *
     * @returns A promise that resolves when the categories are fetched and set.
     */
    async function getCategoryItems() {
      await fetchCategories();

      const savedCategories = await getFromStorage("categories");

      if (savedCategories != null) {
        const parsedCategories = JSON.parse(savedCategories);

        if (Array.isArray(parsedCategories)) {
          setCategories(parsedCategories);
        } else {
          throw new Error("Categories data is invalid");
        }
      }
    }

    void getCategoryItems();
  }, []);

  useEffect(() => {
    /**
     * Fetches ingredient items from the API endpoint based on the selected raw material type from
     * the form. If no raw material type is selected, the function returns early.
     *
     * @returns A promise that resolves when the ingredients are fetched and state is updated.
     */
    async function getIngredientItems() {
      if (form.getValues("raw_material_type").length === 0) {
        return;
      }

      const ingredients = await getIngredientsByCategory(form.getValues("raw_material_type"));
      setIngredients(ingredients);
      remove();
    }

    void getIngredientItems();
  }, [form.watch("raw_material_type")]);

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

      /**
       * Submits the form to create a new daily count entry.
       *
       * @returns A promise that resolves when the form submission process is complete.
       */
      async function submitForm() {
        try {
          await createDailyCountEntry(formValues);
        } catch (error) {
          void presentToast({
            color: "danger",
            icon: alertCircleOutline,
            message: "Failed to create daily count entry. Please try again.",
            swipeGesture: "vertical",
          });
          throw new Error("Form submission failed");
        } finally {
          setIsLoading(false);
          void presentToast({
            duration: 1500,
            icon: checkmarkCircleOutline,
            message: "Daily count entry created successfully!",
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

            <div className="flex flex-col gap-3">
              <Button type="button" variant="secondary" onClick={handleGenerate}>
                Generate items
              </Button>
            </div>

            <DivTable>
              <DivTableHeader>
                <DivTableRow>
                  <DivTableHead>Ingredients</DivTableHead>
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
                                        {ingredients.length > 0
                                          ? (ingredients.find(
                                              (ingredient) =>
                                                ingredient.id.toString() === field.value,
                                            )?.raw_material ?? "Select an ingredient")
                                          : "Select an ingredient"}
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

            <div className="mt-1 flex flex-col gap-4">
              <Button type="button" variant="ghost" onClick={handleAdd}>
                <span>Add another product</span>
                <Plus aria-hidden="true" strokeWidth={2} size={16} />
              </Button>
              <Button type="submit" disabled={isLoading}>
                Submit
              </Button>
              <Button type="button" variant="ghost" onClick={handleDismissConfirmation}>
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </IonContent>
    </IonPage>
  );
}
