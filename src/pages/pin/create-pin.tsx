import { useRef, type FormEvent } from "react";
import { IonContent, IonImg, IonPage, useIonRouter, useIonViewDidEnter } from "@ionic/react";
import { zodResolver } from "@hookform/resolvers/zod";
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
 * The `CreatePIN` component provides a form for users to create a PIN, which is then saved to
 * storage. Upon successful submission and saving of the PIN, the user is redirected to a
 * confirmation page.
 *
 * @returns The rendered component.
 */
export default function CreatePIN() {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const form = useForm<PinFormSchema>({
    defaultValues: {
      pin: "",
    },
    resolver: zodResolver(pinFormSchema),
  });
  const router = useIonRouter();

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
       * Asynchronously saves a PIN to storage.
       *
       * This function attempts to save the provided PIN to storage using the `saveToStorage`
       * function. If an error occurs during the save process, it throws an error with a descriptive
       * message.
       *
       * @throws {Error} An error if unable to save the PIN.
       */
      async function savePIN() {
        try {
          await saveToStorage("pin", String(parsedData.data?.pin));
          router.push("/confirm-pin");
        } catch (error) {
          throw new Error(`Unable to save PIN: ${String(error)}`);
        }
      }

      void savePIN();
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
