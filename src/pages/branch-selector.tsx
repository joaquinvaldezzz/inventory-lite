import { useEffect, useRef, useState, type FormEvent } from 'react'
import { IonContent, IonPage, useIonRouter } from '@ionic/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Store } from 'lucide-react'
import { useForm } from 'react-hook-form'

import { getCurrentUser, getUserBranches } from '@/lib/dal'
import { branchSelectorFormSchema, type BranchSelectorFormSchema } from '@/lib/form-schema'
import { saveToStorage } from '@/lib/storage'
import type { Branch } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function BranchSelector() {
  const formRef = useRef<HTMLFormElement>(null)
  const [username, setUsername] = useState<string>('')
  const [branches, setBranches] = useState<Branch[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const form = useForm<BranchSelectorFormSchema>({
    defaultValues: {
      branch: '',
    },
    resolver: zodResolver(branchSelectorFormSchema),
  })
  const router = useIonRouter()
  const { toast } = useToast()

  useEffect(() => {
    void (async () => {
      const username = await getCurrentUser()
      const userBranches = await getUserBranches()

      if (username != null) {
        setUsername(username.data.user.name)
      }

      if (userBranches != null) {
        setBranches(userBranches)
      }
    })()
  }, [])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      void form.handleSubmit(async () => {
        if (formRef.current == null) {
          console.error('Form reference is not available')
          return
        }

        const formData = Object.fromEntries(new FormData(formRef.current))
        const parsedData = branchSelectorFormSchema.safeParse(formData)

        if (!parsedData.success) {
          console.error('Form data is invalid:', parsedData.error)
          // Optionally, provide user feedback here
          return
        }

        setIsLoading(true)

        try {
          await saveToStorage('currentBranch', JSON.stringify(formData))
          toast({
            description: 'Branch selected successfully!',
          })
          router.push('/app')
        } catch (error) {
          toast({
            description: 'Failed to select branch. Please try again.',
            variant: 'destructive',
          })
          console.error('Form submission failed:', error)
        } finally {
          setIsLoading(false)
        }
      })(event)
    } catch (error) {
      console.error('Form submission failed:', error)
    }
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
                <h1 className="text-2xl font-semibold">Hello, {username}!</h1>
                <p className="text-muted-foreground">Please select a branch to proceed.</p>
              </div>
            </div>

            <Form {...form}>
              <form className="space-y-5" ref={formRef} onSubmit={handleSubmit}>
                <FormField
                  control={form.control}
                  name="branch"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor={field.name}>Branch</FormLabel>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
                          <Store size={16} strokeWidth={2} aria-hidden="true" />
                        </div>
                        <FormControl>
                          <Select
                            name="branch"
                            defaultValue={field.value}
                            onValueChange={field.onChange}
                            disabled={isLoading}
                          >
                            <SelectTrigger className="ps-9" id={field.name}>
                              <SelectValue placeholder="Select a branch" />
                            </SelectTrigger>
                            <SelectContent>
                              {branches.length > 0 ? (
                                branches.map((branch) => (
                                  <SelectItem
                                    value={String(branch.id)}
                                    aria-label={branch.branch}
                                    key={branch.id}
                                  >
                                    {branch.branch}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="0" aria-disabled="true" disabled>
                                  No branches available
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="mt-1 flex flex-col">
                  <Button type="submit">{isLoading ? 'Proceeding...' : 'Proceed'}</Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </IonContent>
    </IonPage>
  )
}
