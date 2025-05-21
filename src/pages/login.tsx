import { useRef, useState, type FormEvent } from "react";
import { IonContent, IonImg, IonPage, useIonRouter, useIonToast } from "@ionic/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkmarkCircleOutline } from "ionicons/icons";
import { AlertCircle, Eye, EyeOff, KeyRound, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";

import { loginFormSchema, type LoginFormSchema } from "@/lib/form-schema";
import { useAuth } from "@/hooks/use-auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
 * The `Login` component renders a login form for user authentication. It includes fields for
 * username and password, and handles form submission with validation and error handling.
 *
 * @returns The rendered login form component.
 */
export default function Login() {
  const formRef = useRef<HTMLFormElement>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const form = useForm<LoginFormSchema>({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(loginFormSchema),
  });
  const { login } = useAuth();
  const [presentToast] = useIonToast();
  const router = useIonRouter();

  /**
   * Handles the form submission event for the login form.
   *
   * @param event The form submission event.
   */
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    void form.handleSubmit(async (formData) => {
      const parsedData = loginFormSchema.safeParse(formData);

      if (!parsedData.success) {
        throw new Error("Form data is invalid:", parsedData.error);
      }

      try {
        setIsLoading(true);
        const response = await login(formData.email, formData.password);

        if (!(response?.success ?? false)) {
          form.setError("root", {
            message:
              "Hmm, something went wrong. Please double-check your username and password. If you're still having trouble, you can reset your password.",
          });
        } else {
          void presentToast({
            duration: 1500,
            icon: checkmarkCircleOutline,
            message: "Login successful!",
            swipeGesture: "vertical",
          });
          router.push("/create-pin");
        }
      } catch (error) {
        throw new Error("Failed to login");
      } finally {
        setIsLoading(false);
      }
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
                <h1 className="text-2xl font-semibold">Welcome back!</h1>
                <p className="text-muted-foreground">Please log in to continue.</p>
              </div>
            </div>

            {form.formState.errors.root != null && (
              <Alert variant="destructive">
                <AlertCircle className="w-4" />
                <AlertTitle>Oops!</AlertTitle>
                <AlertDescription>
                  <p>{form.formState.errors.root.message}</p>
                </AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form className="space-y-5" ref={formRef} onSubmit={handleSubmit}>
                <FormField
                  name="email"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email address</FormLabel>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
                          <User aria-hidden="true" strokeWidth={2} size={16} />
                        </div>
                        <FormControl>
                          <Input
                            className="peer ps-9"
                            type="email"
                            placeholder="Enter your email address"
                            autoComplete="email"
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="password"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
                          <KeyRound aria-hidden="true" strokeWidth={2} size={16} />
                        </div>
                        <FormControl>
                          <Input
                            className="ps-9 pe-9"
                            type={isVisible ? "text" : "password"}
                            placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <button
                          className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-muted-foreground/80 outline-offset-2 transition-colors hover:text-foreground focus:z-10 focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                          type="button"
                          aria-controls="password"
                          aria-label={isVisible ? "Hide password" : "Show password"}
                          aria-pressed={isVisible}
                          onClick={() => {
                            setIsVisible(!isVisible);
                          }}
                        >
                          {isVisible ? (
                            <EyeOff aria-hidden="true" strokeWidth={2} size={16} />
                          ) : (
                            <Eye aria-hidden="true" strokeWidth={2} size={16} />
                          )}
                        </button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex flex-col pt-1">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Logging in..." : "Log in"}
                  </Button>
                </div>
              </form>
            </Form>

            <div className="space-y-3 text-center text-sm">
              <p className="text-muted-foreground">
                First time?{" "}
                <Button className="h-auto p-0" variant="link" asChild>
                  <Link to="/sign-up">Sign up now</Link>
                </Button>
              </p>
              <p>
                <Button className="h-auto p-0" variant="link" asChild>
                  <Link to="/reset-password">Reset your password</Link>
                </Button>
              </p>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}
