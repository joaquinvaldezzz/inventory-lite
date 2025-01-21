'use client'

import { startTransition, useActionState, useRef, type FormEvent } from 'react'
import Image from 'next/image'
import { zodResolver } from '@hookform/resolvers/zod'
import { Store } from 'lucide-react'
import { useForm } from 'react-hook-form'

import { login, type Branch } from '@/lib/actions'
import { branchSelectorFormSchema, type BranchSelectorFormSchema } from '@/lib/form-schema'
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

import Logo from '@/public/images/escobars-steakhouse-logo.png'

export function BranchSelector({ branches }: { branches: Branch[] }) {
  const formRef = useRef<HTMLFormElement>(null)

  const form = useForm<BranchSelectorFormSchema>({
    defaultValues: {
      branch: '',
    },
    resolver: zodResolver(branchSelectorFormSchema),
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    /* try {
      void form.handleSubmit(() => {
        startTransition(() => {
          if (formRef.current == null) return
          formAction(new FormData(formRef.current))
        })
      })(event)
    } catch (error) {
      console.error('Form submission failed:', error)
    } */
  }

  return (
    <div className="py-12">
      <div className="space-y-8 px-4">
        <div className="space-y-6">
          <Image
            className="mx-auto h-24 w-40 object-contain"
            src={Logo}
            alt="Escobar's Steakhouse"
            priority
          />
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold">Select a branch</h1>
            <p className="text-gray-600">Please select a branch to proceed.</p>
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
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Proceeding...' : 'Proceed'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
