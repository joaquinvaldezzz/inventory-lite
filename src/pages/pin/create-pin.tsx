import { useCallback, useRef, type FormEvent } from "react";
import { IonContent, IonImg, IonPage, useIonRouter, useIonViewDidEnter } from "@ionic/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

import { pinFormSchema, type PinFormSchema } from "@/lib/form-schema";
import { saveToStorage } from "@/lib/storage";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { InputPIN, InputPINGroup, InputPINSlot } from "@/components/ui/input-pin";

/**
 * CreatePIN component displays a form for users to create and save a secure PIN.
 *
 * This component:
 *
 * - Renders a form for PIN entry and confirmation
 * - Validates the PIN input for required criteria
 * - Saves the PIN to secure storage upon successful submission
 * - Redirects the user to a confirmation page after saving
 * - Provides feedback for loading and error states
 *
 * The component ensures that the PIN is securely stored and that users are guided through the
 * creation and confirmation process with appropriate validation and navigation.
 *
 * @returns JSX element representing the PIN creation form
 */
export default function CreatePIN() {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const router = useIonRouter();
  const form = useForm<PinFormSchema>({
    defaultValues: {
      pin: "",
    },
    resolver: zodResolver(pinFormSchema),
  });

  const createPinMutation = useMutation({
    mutationFn: async (pin: string) => {
      await saveToStorage("pin", pin);
    },
    onError: () => {
      form.setError("pin", {
        message: "Unable to save PIN. Please try again.",
      });
    },
    onSuccess: () => {
      router.push("/confirm-pin");
    },
  });

  useIonViewDidEnter(() => {
    form.setFocus("pin");
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
        const parsedData = pinFormSchema.safeParse(formValues);

        if (!parsedData.success) {
          throw new Error("Form data is invalid:", parsedData.error);
        }

        await createPinMutation.mutateAsync(parsedData.data.pin);
      })(event);
    },
    [form.handleSubmit, createPinMutation.mutateAsync],
  );

  return (
    <IonPage>
      <IonContent>
        <div className="mt-safe py-12">
          <div className="space-y-8 px-4">
            <div className="space-y-6">
              <IonImg
                className="mx-auto h-24 w-40 object-contain"
                src="/images/escobar-steakhouse-logo.png"
                alt="Escobar's Steakhouse"
              />
              <div className="space-y-2 text-center">
                <h1 className="text-2xl font-semibold">Good day!</h1>
                <p className="text-muted-foreground">Create a PIN to continue.</p>
              </div>
            </div>

            <Form {...form}>
              <form className="space-y-5" onSubmit={handleSubmit}>
                <FormField
                  name="pin"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="sr-only">Create PIN</FormLabel>
                      <FormControl>
                        <InputPIN
                          maxLength={6}
                          pushPasswordManagerStrategy="none"
                          onComplete={() => buttonRef.current?.click()}
                          {...field}
                        >
                          <InputPINGroup className="w-full justify-center">
                            <InputPINSlot index={0} />
                            <InputPINSlot index={1} />
                            <InputPINSlot index={2} />
                            <InputPINSlot index={3} />
                            <InputPINSlot index={4} />
                            <InputPINSlot index={5} />
                          </InputPINGroup>
                        </InputPIN>
                      </FormControl>
                      <FormMessage className="text-center" />
                    </FormItem>
                  )}
                />

                <button className="hidden" type="submit" ref={buttonRef}>
                  Continue
                </button>
              </form>
            </Form>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}
