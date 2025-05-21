import { useRef, useState, type FormEvent } from "react";
import { IonContent, IonImg, IonPage, useIonRouter, useIonToast } from "@ionic/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkmarkCircleOutline } from "ionicons/icons";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";

import { resetPassword } from "@/lib/api";
import { forgotPasswordFormSchema, type ForgotPasswordFormSchema } from "@/lib/form-schema";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

/**
 * Page component for resetting user password.
 *
 * @returns The reset password form page
 */
export default function ResetPassword() {
  const formRef = useRef<HTMLFormElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<ForgotPasswordFormSchema>({
    defaultValues: {
      email: "",
    },
    resolver: zodResolver(forgotPasswordFormSchema),
  });
  const router = useIonRouter();
  const [presentToast] = useIonToast();

  /**
   * Handles the form submission event for the reset password form.
   *
   * @param event The form submission event
   */
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    void form.handleSubmit(async (data) => {
      if (formRef.current == null) {
        throw new Error("Form reference is not available");
      }

      const parsedData = forgotPasswordFormSchema.safeParse(data);

      if (!parsedData.success) {
        throw new Error("Form data is invalid:", parsedData.error);
      }

      try {
        setIsLoading(true);
        await resetPassword(data.email);
        void presentToast({
          duration: 1500,
          icon: checkmarkCircleOutline,
          message: "Password reset successfully!",
          swipeGesture: "vertical",
        });
      } catch (error) {
        throw new Error("Failed to reset password");
      } finally {
        setIsLoading(false);
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
                  Enter the email address you used when you joined to reset your password.
                </p>
              </div>
            </div>

            <Form {...form}>
              <form className="space-y-5" ref={formRef} onSubmit={handleSubmit}>
                <FormField
                  name="email"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-2">
                      <FormLabel>Email address</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter your email address"
                          autoComplete="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex flex-col gap-3 pt-1">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit"}
                  </Button>
                  <Button
                    type="button"
                    disabled={isLoading}
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
