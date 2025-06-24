import { useRef, useState, type FormEvent } from "react";
import { IonContent, IonPage, useIonRouter, useIonToast } from "@ionic/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkmarkCircleOutline } from "ionicons/icons";
import { Store } from "lucide-react";
import { useForm } from "react-hook-form";

import { fetchUserBranches, getCurrentUser } from "@/lib/dal";
import { branchSelectorFormSchema, type BranchSelectorFormSchema } from "@/lib/form-schema";
import { saveToStorage } from "@/lib/storage";
import type { Branch } from "@/lib/types/login";
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
 * The `BranchSelector` component allows the user to select a branch from a list of branches. It
 * fetches the current user's name and branches associated with the user on component mount. The
 * user can select a branch from a dropdown and submit the form to proceed.
 *
 * @returns The rendered branch selector component.
 */
export default function BranchSelector() {
  const formRef = useRef<HTMLFormElement>(null);
  const [username, setUsername] = useState<string>("");
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const form = useForm<BranchSelectorFormSchema>({
    defaultValues: {
      branch: "",
    },
    resolver: zodResolver(branchSelectorFormSchema),
  });
  const router = useIonRouter();
  const [presentToast] = useIonToast();

  void (async () => {
    const username = await getCurrentUser();
    const userBranches = await fetchUserBranches();

    if (username != null) {
      setUsername(username.data?.user.name ?? "");
    }

    setBranches(userBranches);
  })();

  /**
   * Handles the form submission event.
   *
   * @param event The form submission event.
   */
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      void form.handleSubmit(async () => {
        if (formRef.current == null) {
          throw new Error("Form reference is not available");
        }

        const formData = Object.fromEntries(new FormData(formRef.current));
        const parsedData = branchSelectorFormSchema.safeParse(formData);

        if (!parsedData.success) {
          throw new Error("Form data is invalid:", parsedData.error);
        }

        setIsLoading(true);

        try {
          await saveToStorage("currentBranch", JSON.stringify(formData));
          void presentToast({
            duration: 1500,
            icon: checkmarkCircleOutline,
            message: "Branch selected successfully!",
            swipeGesture: "vertical",
          });
          router.push("/app/delivery", "forward", "pop");
        } catch (error) {
          form.setError("branch", {
            message: "Failed to select branch. Please try again.",
          });
          throw new Error("Form submission failed");
        } finally {
          setIsLoading(false);
        }
      })(event);
    } catch (error) {
      throw new Error("Form submission failed");
    }
  }

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
              <form className="space-y-5" ref={formRef} onSubmit={handleSubmit}>
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
                            disabled={isLoading}
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
                  <Button type="submit">{isLoading ? "Proceeding..." : "Proceed"}</Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}
