import { IonContent, IonImg, IonPage } from "@ionic/react";

import { LoginForm } from "@/components/login-form";

/**
 * The `Login` component renders a login form for user authentication. It includes fields for
 * username and password, and handles form submission with validation and error handling.
 *
 * @returns The rendered login form component.
 */
export default function Login() {
  return (
    <IonPage>
      <IonContent>
        <div className="mt-safe flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
          <div className="flex w-full max-w-sm flex-col gap-6">
            <IonImg
              className="mx-auto h-24 w-40 object-contain"
              src="/images/escobar-steakhouse-logo.png"
              alt="Escobar's Steakhouse"
            />
            <LoginForm />
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}
