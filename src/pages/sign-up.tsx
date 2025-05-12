import { useRef, useState, type FormEvent } from "react";
import { IonContent, IonImg, IonPage, useIonToast } from "@ionic/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkmarkCircleOutline } from "ionicons/icons";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";

import { signUpFormSchema, type SignUpFormSchema } from "@/lib/form-schema";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * Sign up page component that handles user registration
 *
 * @returns The sign up form component
 */
export default function SignUp() {
  const formRef = useRef<HTMLFormElement>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const form = useForm<SignUpFormSchema>({
    defaultValues: {
      first_name: "",
      middle_name: "",
      last_name: "",
      email: "",
      username: "",
      password: "",
      confirm_password: "",
      role: "",
      branch: "",
    },
    resolver: zodResolver(signUpFormSchema),
  });
  const [presentToast] = useIonToast();

  /**
   * Handles the form submission event.
   *
   * @param event The form submission event.
   */
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    void form.handleSubmit(() => {
      try {
        if (formRef.current == null) {
          throw new Error("Form reference is not available");
        }

        const formData = Object.fromEntries(new FormData(formRef.current));
        const parsedData = signUpFormSchema.safeParse(formData);

        if (!parsedData.success) {
          throw new Error("Form data is invalid:", parsedData.error);
        }

        setIsLoading(true);

        try {
          // eslint-disable-next-line no-console -- TODO: Remove this once the form is implemented
          console.log(formData);
          void presentToast({
            duration: 1500,
            icon: checkmarkCircleOutline,
            message: "Account created successfully!",
            swipeGesture: "vertical",
          });
        } catch (error) {
          throw new Error("Form submission failed");
        } finally {
          setIsLoading(false);
        }
      } catch (error) {
        throw new Error("Form submission failed");
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
                <h1 className="text-2xl font-semibold">Create an account</h1>
                <p className="text-muted-foreground">
                  Please enter your details to create an account.
                </p>
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
                  name="first_name"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First name</FormLabel>
                      <FormControl>
                        <Input autoComplete="first name" disabled={isLoading} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="middle_name"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Middle name</FormLabel>
                      <FormControl>
                        <Input autoComplete="middle name" disabled={isLoading} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="last_name"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last name</FormLabel>
                      <FormControl>
                        <Input autoComplete="last name" disabled={isLoading} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="email"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email address</FormLabel>
                      <FormControl>
                        <Input autoComplete="email" disabled={isLoading} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="username"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input autoComplete="username" disabled={isLoading} {...field} />
                      </FormControl>
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
                        <FormControl>
                          <Input
                            type={isVisible ? "text" : "password"}
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

                <FormField
                  name="confirm_password"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm password</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            type={isVisible ? "text" : "password"}
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

                <FormField
                  name="role"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor={field.name}>Role</FormLabel>
                      <FormControl>
                        <Select
                          name={field.name}
                          defaultValue={field.value}
                          disabled={isLoading}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger id={field.name}>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="user">User</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="branch"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor={field.name}>Branch</FormLabel>
                      <FormControl>
                        <Select
                          name={field.name}
                          defaultValue={field.value}
                          disabled={isLoading}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger id={field.name}>
                            <SelectValue placeholder="Select a branch" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="user">User</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex flex-col pt-1">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Creating your account..." : "Sign up"}
                  </Button>
                </div>
              </form>
            </Form>

            <div className="space-y-3 text-center text-sm">
              <p className="text-muted-foreground">
                Already have an account? Log in{" "}
                <Button className="h-auto p-0" variant="link">
                  here
                </Button>
              </p>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}
