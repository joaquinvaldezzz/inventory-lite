import { startTransition, useRef, useState, type FormEvent } from 'react'
import { IonContent, IonPage } from '@ionic/react'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { Eye, EyeOff, KeyRound, User } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'

import { loginFormSchema, type LoginFormSchema } from '@/lib/form-schema'
import type { LoginResponse } from '@/lib/types'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

export function Login() {
  const formRef = useRef<HTMLFormElement>(null)
  const [isVisible, setIsVisible] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const form = useForm<LoginFormSchema>({
    defaultValues: {
      username: '',
      password: '',
    },
    resolver: zodResolver(loginFormSchema),
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    void form.handleSubmit(() => {
      if (formRef.current == null) {
        console.error('Form reference is not available')
        return
      }

      const formData = Object.fromEntries(new FormData(formRef.current))
      const parsedData = loginFormSchema.safeParse(formData)

      if (!parsedData.success) {
        console.error('Form data is invalid:', parsedData.error)
      }

      setIsLoading(true)

      startTransition(() => {
        async function submitForm() {
          if (formRef.current == null) {
            console.error('Form reference is not available')
            return
          }

          try {
            const formData = new FormData(formRef.current)
            const request = await axios.post<LoginResponse>(
              '/api',
              JSON.stringify(Object.fromEntries(formData)),
            )
            const branches = request.data.data.user.branches
            localStorage.setItem('branches', JSON.stringify(branches))
          } catch (error) {
            console.error('Form submission failed:', error)
          } finally {
            setIsLoading(false)
          }
        }

        void submitForm()
      })
    })(event)
  }

  return (
    <IonPage>
      <IonContent>
        <div className="mt-safe py-12">
          <div className="space-y-8 px-4">
            <div className="space-y-6">
              <img
                className="mx-auto h-24 w-40 object-contain"
                src="/images/escobar-steakhouse-logo.png"
                alt="Escobar's Steakhouse"
              />
              <div className="space-y-2 text-center">
                <h1 className="text-2xl font-semibold">Log in to your account</h1>
                <p className="text-gray-600">Welcome back! Please enter your details.</p>
              </div>
            </div>

            <Form {...form}>
              <form className="space-y-5" ref={formRef} onSubmit={handleSubmit}>
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
                          <User size={16} strokeWidth={2} aria-hidden="true" />
                        </div>
                        <FormControl>
                          <Input
                            className="peer ps-9"
                            placeholder="Enter your username"
                            autoComplete="username"
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
                          <KeyRound size={16} strokeWidth={2} aria-hidden="true" />
                        </div>
                        <FormControl>
                          <Input
                            className="ps-9 pe-9"
                            type={isVisible ? 'text' : 'password'}
                            placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                            {...field}
                          />
                        </FormControl>
                        <button
                          className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-muted-foreground/80 outline-offset-2 transition-colors hover:text-foreground focus:z-10 focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                          type="button"
                          onClick={() => {
                            setIsVisible(!isVisible)
                          }}
                          aria-label={isVisible ? 'Hide password' : 'Show password'}
                          aria-pressed={isVisible}
                          aria-controls="password"
                        >
                          {isVisible ? (
                            <EyeOff size={16} strokeWidth={2} aria-hidden="true" />
                          ) : (
                            <Eye size={16} strokeWidth={2} aria-hidden="true" />
                          )}
                        </button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="mt-1 flex flex-col">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Logging in...' : 'Log in'}
                  </Button>
                </div>
              </form>
            </Form>

            <div className="space-y-2">
              <p className="text-center text-sm text-gray-600">
                Forgot password? Reset your password{' '}
                <Button className="h-auto p-0" variant="link" asChild>
                  <a href="">here</a>
                </Button>
                .
              </p>
              <p className="text-center text-sm text-gray-600">
                <Button className="h-auto p-0" variant="link" asChild>
                  <Link to="/branch-selector">Go to Branch Selector</Link>
                </Button>
              </p>
              <p className="text-center text-sm text-gray-600">
                <Button className="h-auto p-0" variant="link" asChild>
                  <Link to="/app">Go to App</Link>
                </Button>
              </p>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  )
}
