import { useRef, useState, type FormEvent } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { CalendarIcon, Container, Store } from 'lucide-react'
import { useForm } from 'react-hook-form'

import { newDeliveryFormSchema, type NewDeliveryFormSchema } from '@/lib/form-schema'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { DataTable } from '@/components/ui/data-table'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

import { columns } from './columns'

export function NewDeliveryForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const [date, setDate] = useState<Date>()
  const form = useForm<NewDeliveryFormSchema>({
    defaultValues: {
      supplier: '',
      branch: '',
      date: new Date(),
      remarks: '',
    },
    resolver: zodResolver(newDeliveryFormSchema),
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      void form.handleSubmit(() => {
        // startTransition(() => {})
      })(event)
    } catch (error) {
      console.error('Form submission failed:', error)
    }
  }

  return (
    <Form {...form}>
      <form className="space-y-5" ref={formRef} onSubmit={handleSubmit}>
        <FormField
          control={form.control}
          name="supplier"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor={field.name}>Supplier</FormLabel>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
                  <Container size={16} strokeWidth={2} aria-hidden="true" />
                </div>
                <FormControl>
                  <Select
                    name={field.name}
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="ps-9" id={field.name}>
                      <SelectValue placeholder="Select a supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="north-caloocan">North Caloocan</SelectItem>
                      <SelectItem value="maginhawa">Maginhawa</SelectItem>
                      <SelectItem value="lagro">Lagro</SelectItem>
                      <SelectItem value="south-triangle">South Triangle</SelectItem>
                      <SelectItem value="bf-homes">BF Homes</SelectItem>
                      <SelectItem value="skyline">Skyline</SelectItem>
                      <SelectItem value="shaw-boulevard">Shaw Boulevard</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

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
                    name={field.name}
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="ps-9" id={field.name}>
                      <SelectValue placeholder="Select a branch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="north-caloocan">North Caloocan</SelectItem>
                      <SelectItem value="maginhawa">Maginhawa</SelectItem>
                      <SelectItem value="lagro">Lagro</SelectItem>
                      <SelectItem value="south-triangle">South Triangle</SelectItem>
                      <SelectItem value="bf-homes">BF Homes</SelectItem>
                      <SelectItem value="skyline">Skyline</SelectItem>
                      <SelectItem value="shaw-boulevard">Shaw Boulevard</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={() => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
                  <CalendarIcon size={16} strokeWidth={2} aria-hidden="true" />
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        className={cn('w-full justify-start ps-9 text-left font-normal')}
                        variant="outline"
                      >
                        {date != null ? format(date, 'PPP') : <span>Select a date</span>}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="remarks"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Remarks</FormLabel>
              <FormControl>
                <Textarea className="min-h-24" placeholder="Enter your remarks" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <DataTable columns={columns} data={[]} />

        <div className="mt-1 flex flex-col gap-3">
          <Button type="submit">Submit</Button>

          <Button variant="ghost" type="button">
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}
