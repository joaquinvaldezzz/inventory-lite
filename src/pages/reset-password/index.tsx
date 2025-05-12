import { useRef, type FormEvent } from "react";
import { IonContent, IonImg, IonPage, useIonRouter } from "@ionic/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const resetPasswordFormItems = [
  {
    value: "username",
    label: "I forgot my username",
  },
  {
    value: "password",
    label: "I forgot my password",
  },
];

const resetPasswordFormSchema = z.object({
  items: z.array(z.string()).refine((value) => value.some((item) => item !== ""), {
    message: "You have to select at least one item.",
  }),
});

type ResetPasswordFormSchema = z.infer<typeof resetPasswordFormSchema>;

/**
 * Page component for resetting user password.
 *
 * @returns The reset password form page
 */
export default function ResetPassword() {
  const formRef = useRef<HTMLFormElement>(null);
  const form = useForm<ResetPasswordFormSchema>({
    defaultValues: {
      items: [],
    },
    resolver: zodResolver(resetPasswordFormSchema),
  });
  const router = useIonRouter();

  /**
   * Handles the form submission event for the reset password form.
   *
   * @param event The form submission event
   */
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    void form.handleSubmit((data) => {
      if (formRef.current == null) {
        throw new Error("Form reference is not available");
      }

      const parsedData = resetPasswordFormSchema.safeParse(data);

      if (!parsedData.success) {
        throw new Error("Form data is invalid:", parsedData.error);
      }

      if (
        parsedData.data.items.includes("username") &&
        parsedData.data.items.includes("password")
      ) {
        router.push("/reset-password/username-password");
      } else if (parsedData.data.items.includes("username")) {
        router.push("/reset-password/username");
      } else if (parsedData.data.items.includes("password")) {
        router.push("/reset-password/password");
      }
    })(event);
  }

  return (
    <IonPage>
      <IonContent>
        <div className="mt-safe py-12 text-pretty">
          <div className="space-y-8 px-4">
            <div className="space-y-6">
              <IonImg
                className="mx-auto h-24 w-40 object-contain"
                src="/images/escobar-steakhouse-logo.png"
                alt="Escobar's Steakhouse"
              />
              <div className="space-y-2 text-center">
                <h1 className="text-2xl font-semibold">Having trouble signing in?</h1>
                <p className="text-muted-foreground">
                  Select which option applies to you to reset your password.
                </p>
              </div>
            </div>

            <Form {...form}>
              <form className="space-y-5" ref={formRef} onSubmit={handleSubmit}>
                <FormField
                  name="items"
                  control={form.control}
                  render={() => (
                    <FormItem className="flex flex-col gap-2">
                      {resetPasswordFormItems.map((item) => (
                        <FormField
                          name="items"
                          control={form.control}
                          key={item.value}
                          render={({ field }) => (
                            <FormItem className="flex items-center gap-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value.includes(item.value)}
                                  onCheckedChange={(checked) => {
                                    if (checked === true) {
                                      field.onChange([...field.value, item.value]);
                                    } else {
                                      field.onChange(
                                        field.value.filter((value) => value !== item.value),
                                      );
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormLabel>{item.label}</FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex flex-col gap-3 pt-1">
                  <Button type="submit">Proceed</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      router.goBack();
                    }}
                  >
                    Cancel
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
