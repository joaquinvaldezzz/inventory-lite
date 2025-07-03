import { useCallback, useRef, type FormEvent } from "react";
import { IonContent, IonImg, IonPage, useIonRouter, useIonViewDidEnter } from "@ionic/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

import { pinFormSchema, type PinFormSchema } from "@/lib/form-schema";
import { getFromStorage } from "@/lib/storage";
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
 * PIN component displays a page for users to enter their PIN to continue.
 *
 * This component:
 *
 * - Renders a form for PIN entry and submission
 * - Uses the useForm hook for form state management and validation with Zod
 * - Validates the entered PIN against stored or expected values
 * - Provides feedback for incorrect PIN entries and loading states
 * - Handles navigation upon successful PIN entry
 *
 * The component ensures secure and user-friendly PIN entry, guiding users through authentication
 * with validation and appropriate feedback.
 *
 * @returns JSX element representing the PIN entry page
 */
export default function EnterPIN() {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const router = useIonRouter();
  const form = useForm<PinFormSchema>({
    defaultValues: {
      pin: "",
    },
    resolver: zodResolver(pinFormSchema),
  });

  const { data: savedPIN } = useQuery({
    queryKey: ["pin"],
    queryFn: async () => await getFromStorage("pin"),
  });

  useIonViewDidEnter(() => {
    form.setFocus("pin");
  });

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      void form.handleSubmit((formValues) => {
        const parsedData = pinFormSchema.safeParse(formValues);

        if (!parsedData.success) {
          throw new Error("Form data is invalid:", parsedData.error);
        }

        if (savedPIN === parsedData.data.pin) {
          router.push("/app/delivery", "forward", "pop");
        } else {
          form.setError("pin", {
            message: "Invalid PIN. Please try again.",
          });
        }
      })(event);
    },
    [form.handleSubmit, form.setError, savedPIN, router],
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
                <p className="text-muted-foreground">Enter your PIN to continue.</p>
              </div>
            </div>

            <Form {...form}>
              <form className="space-y-5" onSubmit={handleSubmit}>
                <FormField
                  name="pin"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="sr-only">PIN</FormLabel>
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

            <div className="space-y-3 text-center text-sm">
              <p className="text-muted-foreground">Never share your PIN with anyone.</p>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}
