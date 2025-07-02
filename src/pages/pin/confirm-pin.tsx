import { useCallback, useRef, type FormEvent } from "react";
import {
  IonContent,
  IonImg,
  IonPage,
  useIonRouter,
  useIonToast,
  useIonViewDidEnter,
} from "@ionic/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { checkmarkCircleOutline } from "ionicons/icons";
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
 * ConfirmPIN component displays a form for users to confirm their previously created PIN.
 *
 * This component:
 *
 * - Renders a form for PIN entry and confirmation
 * - Validates the entered PIN against the stored PIN
 * - Redirects the user to the Branch Selector page upon successful validation
 * - Provides feedback for incorrect PIN entries and loading states
 *
 * The component ensures that only users who correctly confirm their PIN can proceed, enhancing
 * security and guiding users through the authentication process.
 *
 * @returns JSX element representing the PIN confirmation form
 */
export default function ConfirmPIN() {
  const router = useIonRouter();
  const [presentToast] = useIonToast();
  const form = useForm<PinFormSchema>({
    defaultValues: {
      pin: "",
    },
    resolver: zodResolver(pinFormSchema),
  });
  const buttonRef = useRef<HTMLButtonElement>(null);

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

        try {
          if (savedPIN === parsedData.data.pin) {
            void presentToast({
              icon: checkmarkCircleOutline,
              message: "PIN confirmed!",
              swipeGesture: "vertical",
            });
            router.push("/branch-selector");
          } else {
            form.setError("pin", {
              message: "The PIN does not match.",
            });
          }
        } catch (error) {
          throw new Error("PIN does not match");
        }
      })(event);
    },
    [form.handleSubmit, form.setError, savedPIN, presentToast, router],
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
                <p className="text-muted-foreground">Confirm a PIN to continue.</p>
              </div>
            </div>

            <Form {...form}>
              <form className="space-y-5" onSubmit={handleSubmit}>
                <FormField
                  name="pin"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="sr-only">Confirm PIN</FormLabel>
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
