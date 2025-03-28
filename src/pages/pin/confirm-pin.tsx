import { useRef, type FormEvent } from "react";
import {
  IonContent,
  IonImg,
  IonPage,
  useIonRouter,
  useIonToast,
  useIonViewDidEnter,
} from "@ionic/react";
import { zodResolver } from "@hookform/resolvers/zod";
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
 * The `ConfirmPIN` component provides a form for users to confirm a PIN. Upon successful submission
 * and validation of the PIN, the user is redirected to the Branch Selector page.
 *
 * @returns The rendered component.
 */
export default function ConfirmPIN() {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const form = useForm<PinFormSchema>({
    defaultValues: {
      pin: "",
    },
    resolver: zodResolver(pinFormSchema),
  });
  const router = useIonRouter();
  const [presentToast] = useIonToast();

  useIonViewDidEnter(() => {
    form.setFocus("pin");
  });

  /**
   * Handles the form submission event.
   *
   * @param event The form submission event.
   */
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    void form.handleSubmit(() => {
      const formValues = form.getValues();
      const parsedData = pinFormSchema.safeParse(formValues);

      if (!parsedData.success) {
        console.error("Form data is invalid:", parsedData.error);
        return;
      }

      /**
       * Asynchronously checks if the stored PIN matches the provided PIN.
       *
       * @returns A promise that resolves when the PIN check is complete.
       */
      async function checkIfPINMatches() {
        const pin = await getFromStorage("pin");

        try {
          if (pin === parsedData.data?.pin) {
            void presentToast({
              duration: 1500,
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
          console.error("PIN does not match:", error);
        }
      }

      void checkIfPINMatches();
    })(event);
  }

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
                          autoFocus
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
