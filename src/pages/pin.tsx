import { IonContent, IonImg, IonPage } from '@ionic/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { pinFormSchema, type PinFormSchema } from '@/lib/form-schema'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { InputPIN, InputPINGroup, InputPINSlot } from '@/components/ui/input-pin'

export default function PIN() {
  const form = useForm<PinFormSchema>({
    defaultValues: {
      pin: '',
    },
    resolver: zodResolver(pinFormSchema),
  })

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
              <form className="space-y-5">
                <FormField
                  name="pin"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="sr-only">Username</FormLabel>
                      <FormControl>
                        <InputPIN
                          maxLength={6}
                          pushPasswordManagerStrategy="none"
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>

            <div className="space-y-3 text-center text-sm">
              <p className="text-muted-foreground">Never share your PIN with anyone.</p>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  )
}
