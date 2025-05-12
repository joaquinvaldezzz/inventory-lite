import { useRef, type FormEvent } from "react";
import { IonContent, IonImg, IonPage, useIonRouter } from "@ionic/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

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

const resetPasswordFormSchema = z.object({
  email: z.string().email({ message: "Email address is required." }).trim(),
});

type ResetPasswordFormSchema = z.infer<typeof resetPasswordFormSchema>;

/**
 * Page component for resetting username.
 *
 * @returns The username reset form page
 */
export default function ResetPasswordUsername() {
  const formRef = useRef<HTMLFormElement>(null);
  const form = useForm<ResetPasswordFormSchema>({
    defaultValues: {
      email: "",
    },
    resolver: zodResolver(resetPasswordFormSchema),
  });
  const router = useIonRouter();

  /**
   * Handles the form submission event.
   *
   * @param event The form submission event
   */
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    void form.handleSubmit(() => {
      // eslint-disable-next-line no-console -- debug
      console.log("Form submitted");
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
                <h1 className="text-2xl font-semibold">I forgot my username</h1>
                <p className="text-muted-foreground">
                  Enter your email address below to reset your username.
                </p>
              </div>
            </div>

            <Form {...form}>
              <form className="space-y-5" ref={formRef} onSubmit={handleSubmit}>
                <FormField
                  name="email"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Enter your email address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex flex-col gap-3 pt-1">
                  <Button type="submit">Submit</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      router.goBack();
                    }}
                  >
                    Back
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
