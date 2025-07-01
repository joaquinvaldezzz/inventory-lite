import { useCallback, type FormEvent } from "react";
import { IonContent, IonPage, useIonRouter, useIonToast } from "@ionic/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueries } from "@tanstack/react-query";
import { checkmarkCircleOutline } from "ionicons/icons";
import { Store } from "lucide-react";
import { useForm } from "react-hook-form";

import { fetchUserBranches, getCurrentUser } from "@/lib/dal";
import { branchSelectorFormSchema, type BranchSelectorFormSchema } from "@/lib/form-schema";
import { saveToStorage } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * BranchSelector component displays a form for selecting a branch from a list of available
 * branches.
 *
 * This component:
 *
 * - Fetches the current user's name and associated branches on mount
 * - Displays a dropdown menu for branch selection
 * - Handles form submission to proceed with the selected branch
 * - Provides feedback for loading and error states
 *
 * The component ensures that only branches associated with the current user are shown, and updates
 * the application state based on the user's selection.
 *
 * @returns JSX element representing the branch selector form
 */
export default function BranchSelector() {
  const [presentToast] = useIonToast();
  const router = useIonRouter();
  const [usernameQuery, branchesQuery] = useQueries({
    queries: [
      {
        queryKey: ["username"],
        queryFn: getCurrentUser,
      },
      {
        queryKey: ["branches"],
        queryFn: fetchUserBranches,
      },
    ],
  });

  const username = usernameQuery.data?.data?.user.name ?? "user";
  const branches = branchesQuery.data ?? [];

  const saveBranchMutation = useMutation({
    mutationFn: async (branch: BranchSelectorFormSchema) => {
      await saveToStorage("currentBranch", JSON.stringify(branch));
    },
    onError: () => {
      form.setError("branch", {
        message: "Failed to select branch. Please try again.",
      });
    },
    onSuccess: async () => {
      await presentToast({
        icon: checkmarkCircleOutline,
        message: "Branch selected successfully!",
        swipeGesture: "vertical",
      });
      router.push("/app/delivery", "forward", "pop");
    },
  });

  const form = useForm<BranchSelectorFormSchema>({
    defaultValues: {
      branch: "",
    },
    resolver: zodResolver(branchSelectorFormSchema),
  });

  /**
   * Handles the form submission event.
   *
   * @param event The form submission event.
   */
  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      void form.handleSubmit(async (formValues) => {
        const parsedData = branchSelectorFormSchema.safeParse(formValues);

        if (!parsedData.success) {
          throw new Error("Form data is invalid:", parsedData.error);
        }

        await saveBranchMutation.mutateAsync(parsedData.data);
      })(event);
    },
    [form.handleSubmit, saveBranchMutation.mutateAsync],
  );

  return (
    <IonPage>
      <IonContent>
        <div className="mt-safe py-12">
          <div className="space-y-8 px-4">
            <div className="space-y-6">
              <img
                className="mx-auto h-24 w-40 object-contain"
                src="/images/escobar-steakhouse-logo.png"
                alt="Escobar's Steakhouse"
              />
              <div className="space-y-2 text-center">
                <h1 className="text-2xl font-semibold">Hello, {username}!</h1>
                <p className="text-muted-foreground">Please select a branch to proceed.</p>
              </div>
            </div>

            <Form {...form}>
              <form className="space-y-5" onSubmit={handleSubmit}>
                <FormField
                  name="branch"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor={field.name}>Branch</FormLabel>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
                          <Store aria-hidden="true" strokeWidth={2} size={16} />
                        </div>
                        <FormControl>
                          <Select
                            name="branch"
                            defaultValue={field.value}
                            disabled={saveBranchMutation.isPending}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger className="ps-9" id={field.name}>
                              <SelectValue placeholder="Select a branch" />
                            </SelectTrigger>
                            <SelectContent>
                              {branches.length > 0 ? (
                                branches.map((branch) => (
                                  <SelectItem
                                    value={String(branch.id)}
                                    aria-label={branch.branch}
                                    key={branch.id}
                                  >
                                    {branch.branch}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="0" aria-disabled="true" disabled>
                                  No branches available
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex flex-col pt-1">
                  <Button
                    type="submit"
                    disabled={saveBranchMutation.isPending || !form.formState.isDirty}
                  >
                    {saveBranchMutation.isPending ? "Proceeding..." : "Proceed"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}
