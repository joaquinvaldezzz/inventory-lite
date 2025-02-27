import { forwardRef } from 'react'
import { MinusIcon, PlusIcon } from 'lucide-react'
import { Button, Group, Input, NumberField, type NumberFieldProps } from 'react-aria-components'

import { cn } from '@/lib/utils'

export interface NumberInputProps extends Omit<NumberFieldProps, 'children' | 'name' | 'onChange'> {
  value?: number
  onChange?: (value: number | undefined) => void
}

export const NumberInput = forwardRef<HTMLDivElement, NumberInputProps>(
  (
    { className, value, defaultValue = 0, minValue = 0, maxValue, step = 1, onChange, ...props },
    _ref,
  ) => {
    return (
      <NumberField
        className={className}
        value={value}
        defaultValue={defaultValue}
        maxValue={maxValue}
        minValue={minValue}
        step={step}
        onChange={onChange}
        {...props}
      >
        <Group
          className={cn(
            'relative inline-flex h-9 w-full items-center overflow-hidden rounded-md border border-input text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none data-disabled:opacity-50 data-focus-within:border-ring data-focus-within:ring-3 data-focus-within:ring-ring/20 data-focus-within:has-aria-invalid:border-destructive data-focus-within:has-aria-invalid:ring-destructive/20 dark:data-focus-within:has-aria-invalid:ring-destructive/40',
          )}
        >
          <Button
            className="-ms-px flex aspect-square h-[inherit] items-center justify-center rounded-s-md border border-input bg-background text-sm text-muted-foreground/80 transition-[color,box-shadow] hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
            slot="decrement"
          >
            <MinusIcon aria-hidden="true" size={16} />
          </Button>
          <Input className="w-full grow bg-background px-3 py-2 text-center text-foreground tabular-nums" />
          <Button
            className="-me-px flex aspect-square h-[inherit] items-center justify-center rounded-e-md border border-input bg-background text-sm text-muted-foreground/80 transition-[color,box-shadow] hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
            slot="increment"
          >
            <PlusIcon aria-hidden="true" size={16} />
          </Button>
        </Group>
      </NumberField>
    )
  },
)

NumberInput.displayName = 'NumberInput'
