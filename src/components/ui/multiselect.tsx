/* eslint-disable complexity, max-lines -- We need to handle multiple cases */
import * as React from 'react'
import { forwardRef, useEffect } from 'react'
import { Command as CommandPrimitive, useCommandState } from 'cmdk'
import { X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Command, CommandGroup, CommandItem, CommandList } from '@/components/ui/command'

export interface Option {
  value: string
  label: string
  disable?: boolean

  /** Fixed option that can‘t be removed. */
  fixed?: boolean

  /** Group the options by providing key. */
  [key: string]: string | boolean | undefined
}
type GroupOption = Record<string, Option[]>

interface MultipleSelectorProps {
  value?: Option[]
  defaultOptions?: Option[]

  /** Manually controlled options */
  options?: Option[]
  placeholder?: string

  /** Loading component. */
  loadingIndicator?: React.ReactNode

  /** Empty component. */
  emptyIndicator?: React.ReactNode

  /** Debounce time for async search. Only work with `onSearch`. */
  delay?: number

  /**
   * Only work with `onSearch` prop. Trigger search when `onFocus`. For example, when user click on
   * the input, it will trigger the search to get initial options.
   */
  triggerSearchOnFocus?: boolean

  /** Async search */
  onSearch?: (value: string) => Promise<Option[]>

  /**
   * Sync search. This search will not showing loadingIndicator. The rest props are the same as
   * async search. i.e.: creatable, groupBy, delay.
   */
  onSearchSync?: (value: string) => Option[]
  onChange?: (options: Option[]) => void

  /** Limit the maximum number of selected options. */
  maxSelected?: number

  /** When the number of selected options exceeds the limit, the onMaxSelected will be called. */
  onMaxSelected?: (maxLimit: number) => void

  /** Hide the placeholder when there are options selected. */
  hidePlaceholderWhenSelected?: boolean
  disabled?: boolean

  /** Group the options base on provided key. */
  groupBy?: string
  className?: string
  badgeClassName?: string

  /**
   * First item selected is a default behavior by cmdk. That is why the default is true. This is a
   * workaround solution by add a dummy item.
   *
   * @reference https://github.com/pacocoursey/cmdk/issues/171
   */
  selectFirstItem?: boolean

  /** Allow user to create option when there is no option matched. */
  creatable?: boolean

  /** Props of `Command` */
  commandProps?: React.ComponentPropsWithoutRef<typeof Command>

  /** Props of `CommandInput` */
  inputProps?: Omit<
    React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>,
    'value' | 'placeholder' | 'disabled'
  >

  /** Hide the clear all button. */
  hideClearAllButton?: boolean
}

export interface MultipleSelectorRef {
  selectedValue: Option[]
  input: HTMLInputElement
  focus: () => void
  reset: () => void
}

/**
 * @param value The value to be debounced.
 * @param delay The delay time to debounce.
 * @returns The debounced value.
 */
export function useDebounce<T>(value: T, delay?: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay ?? 500)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * @param options The options to be grouped.
 * @param groupBy The key to group the options.
 * @returns The grouped options.
 */
function transToGroupOption(options: Option[], groupBy?: string) {
  if (options.length === 0) {
    return {}
  }
  if (groupBy == null) {
    return {
      '': options,
    }
  }

  const groupOption: GroupOption = {}
  options.forEach((option) => {
    const key = (option[groupBy] as string) || ''
    groupOption[key] ||= []
    groupOption[key].push(option)
  })

  return groupOption
}

/**
 * @param groupOption The grouped options.
 * @param picked The picked options.
 * @returns The options without the picked options.
 */
function removePickedOption(groupOption: GroupOption, picked: Option[]) {
  const cloneOption = JSON.parse(JSON.stringify(groupOption)) as GroupOption

  for (const [key, value] of Object.entries(cloneOption)) {
    cloneOption[key] = value.filter((val) => picked.find((p) => p.value === val.value) == null)
  }
  return cloneOption
}

/**
 * @param groupOption The grouped options.
 * @param targetOption The target options to check.
 * @returns Whether the options exist in the groupOption.
 */
function isOptionsExist(groupOption: GroupOption, targetOption: Option[]) {
  for (const [, value] of Object.entries(groupOption)) {
    if (value.some((option) => targetOption.find((p) => p.value === option.value) != null)) {
      return true
    }
  }
  return false
}

/**
 * The `CommandEmpty` of shadcn/ui will cause the cmdk empty not rendering correctly. So we create
 * one and copy the `Empty` implementation from `cmdk`.
 *
 * @reference https://github.com/hsuanyi-chou/shadcn-ui-expansions/issues/34#issuecomment-1949561607
 */
const CommandEmpty = forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof CommandPrimitive.Empty>
>(({ className, ...props }, forwardedRef) => {
  const render = useCommandState((state) => state.filtered.count === 0)

  if (!render) return null

  return (
    <div
      className={cn('px-2 py-4 text-center text-sm', className)}
      role="presentation"
      // eslint-disable-next-line react/no-unknown-property -- `cmdk-empty` is a custom attribute
      cmdk-empty=""
      ref={forwardedRef}
      {...props}
    />
  )
})

CommandEmpty.displayName = 'CommandEmpty'

const MultipleSelector = React.forwardRef<MultipleSelectorRef, MultipleSelectorProps>(
  (
    {
      value,
      onChange,
      placeholder,
      defaultOptions: arrayDefaultOptions = [],
      options: arrayOptions,
      delay,
      onSearch,
      onSearchSync,
      loadingIndicator,
      emptyIndicator,
      maxSelected = Number.MAX_SAFE_INTEGER,
      onMaxSelected,
      hidePlaceholderWhenSelected,
      disabled,
      groupBy,
      className,
      badgeClassName,
      selectFirstItem = true,
      creatable = false,
      triggerSearchOnFocus = false,
      commandProps,
      inputProps,
      hideClearAllButton = false,
    }: MultipleSelectorProps,
    ref: React.Ref<MultipleSelectorRef>,
  ) => {
    const inputRef = React.useRef<HTMLInputElement>(null)
    const [open, setOpen] = React.useState(false)
    const [onScrollbar, setOnScrollbar] = React.useState(false)
    const [isLoading, setIsLoading] = React.useState(false)
    const dropdownRef = React.useRef<HTMLDivElement>(null) // Added this

    const [selected, setSelected] = React.useState<Option[]>(value ?? [])
    const [options, setOptions] = React.useState<GroupOption>(
      transToGroupOption(arrayDefaultOptions, groupBy),
    )
    const [inputValue, setInputValue] = React.useState('')
    const debouncedSearchTerm = useDebounce(inputValue, delay ?? 500)

    React.useImperativeHandle(
      ref,
      () => ({
        selectedValue: [...selected],
        input: inputRef.current!,
        focus: () => inputRef.current?.focus(),
        reset: () => {
          setSelected([])
        },
      }),
      [selected],
    )

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        dropdownRef.current != null &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current != null &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
        inputRef.current.blur()
      }
    }

    const handleUnselect = React.useCallback(
      (option: Option) => {
        const newOptions = selected.filter((s) => s.value !== option.value)
        setSelected(newOptions)
        onChange?.(newOptions)
      },
      [onChange, selected],
    )

    const handleKeyDown = React.useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>) => {
        const input = inputRef.current
        if (input != null) {
          if (e.key === 'Delete' || e.key === 'Backspace') {
            if (input.value === '' && selected.length > 0) {
              const lastSelectOption = selected[selected.length - 1]
              // If last item is fixed, we should not remove it.
              if (!(lastSelectOption.fixed ?? false)) {
                handleUnselect(selected[selected.length - 1])
              }
            }
          }
          // This is not a default behavior of the <input /> field
          if (e.key === 'Escape') {
            input.blur()
          }
        }
      },
      [handleUnselect, selected],
    )

    useEffect(() => {
      if (open) {
        document.addEventListener('mousedown', handleClickOutside)
        document.addEventListener('touchend', handleClickOutside)
      } else {
        document.removeEventListener('mousedown', handleClickOutside)
        document.removeEventListener('touchend', handleClickOutside)
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
        document.removeEventListener('touchend', handleClickOutside)
      }
    }, [open])

    useEffect(() => {
      if (value != null) {
        setSelected(value)
      }
    }, [value])

    useEffect(() => {
      /** If `onSearch` is provided, do not trigger options updated. */
      if (arrayOptions == null || onSearch != null) {
        return
      }
      const newOption = transToGroupOption(arrayOptions || [], groupBy)
      if (JSON.stringify(newOption) !== JSON.stringify(options)) {
        setOptions(newOption)
      }
    }, [arrayDefaultOptions, arrayOptions, groupBy, onSearch, options])

    useEffect(() => {
      /** Sync search */

      const doSearchSync = () => {
        const res = onSearchSync?.(debouncedSearchTerm)
        setOptions(transToGroupOption(res ?? [], groupBy))
      }

      const exec = () => {
        if (onSearchSync == null || !open) return

        if (triggerSearchOnFocus) {
          doSearchSync()
        }

        if (debouncedSearchTerm.length > 0) {
          doSearchSync()
        }
      }

      exec()
    }, [debouncedSearchTerm, groupBy, open, triggerSearchOnFocus])

    useEffect(() => {
      /** Async search */

      const doSearch = async () => {
        setIsLoading(true)
        const res = await onSearch?.(debouncedSearchTerm)
        setOptions(transToGroupOption(res ?? [], groupBy))
        setIsLoading(false)
      }

      const exec = async () => {
        if (onSearch == null || !open) return

        if (triggerSearchOnFocus) {
          await doSearch()
        }

        if (debouncedSearchTerm.length > 0) {
          await doSearch()
        }
      }

      void exec()
    }, [debouncedSearchTerm, groupBy, open, triggerSearchOnFocus])

    const CreatableItem = () => {
      if (!creatable) return undefined
      if (
        isOptionsExist(options, [{ value: inputValue, label: inputValue }]) ||
        selected.find((s) => s.value === inputValue) != null
      ) {
        return undefined
      }

      const Item = (
        <CommandItem
          className="cursor-pointer"
          value={inputValue}
          onMouseDown={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          onSelect={(value: string) => {
            if (selected.length >= maxSelected) {
              onMaxSelected?.(selected.length)
              return
            }
            setInputValue('')
            const newOptions = [...selected, { value, label: value }]
            setSelected(newOptions)
            onChange?.(newOptions)
          }}
        >
          {`Create "${inputValue}"`}
        </CommandItem>
      )

      // For normal creatable
      if (onSearch == null && inputValue.length > 0) {
        return Item
      }

      // For async search creatable. avoid showing creatable item before loading at first.
      if (onSearch != null && debouncedSearchTerm.length > 0 && !isLoading) {
        return Item
      }

      return undefined
    }

    const EmptyItem = React.useCallback(() => {
      if (emptyIndicator === undefined) return undefined

      // For async search that showing emptyIndicator
      if (onSearch != null && !creatable && Object.keys(options).length === 0) {
        return (
          <CommandItem value="-" disabled>
            {emptyIndicator}
          </CommandItem>
        )
      }

      return <CommandEmpty>{emptyIndicator}</CommandEmpty>
    }, [creatable, emptyIndicator, onSearch, options])

    const selectables = React.useMemo<GroupOption>(
      () => removePickedOption(options, selected),
      [options, selected],
    )

    /** Avoid Creatable Selector freezing or lagging when paste a long string. */
    const commandFilter = React.useCallback(() => {
      if (commandProps?.filter != null) {
        return commandProps.filter
      }

      if (creatable) {
        return (value: string, search: string) => {
          return value.toLowerCase().includes(search.toLowerCase()) ? 1 : -1
        }
      }
      // Using default filter in `cmdk`. We don&lsquo;t have to provide it.
      return undefined
    }, [creatable, commandProps?.filter])

    return (
      <Command
        className={cn('h-auto overflow-visible bg-transparent', commandProps?.className)}
        filter={commandFilter()}
        ref={dropdownRef}
        shouldFilter={commandProps?.shouldFilter ?? onSearch == null} // When onSearch is provided, we don't want to filter the options. You can still override it.
        onKeyDown={(e) => {
          handleKeyDown(e)
          commandProps?.onKeyDown?.(e)
        }}
        {...commandProps}
      >
        <div
          className={cn(
            'relative min-h-9.5 rounded-lg border border-input text-sm transition-shadow focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/20 focus-within:outline-hidden has-disabled:cursor-not-allowed has-disabled:opacity-50',
            {
              'p-1': selected.length !== 0,
              'cursor-text': !(disabled ?? false) && selected.length !== 0,
            },
            !hideClearAllButton && 'pe-9',
            className,
          )}
          onClick={() => {
            if (disabled ?? false) return
            inputRef.current?.focus()
          }}
        >
          <div className="flex flex-wrap gap-1">
            {selected.map((option) => {
              return (
                <div
                  className={cn(
                    'animate-fadeIn relative inline-flex h-7 cursor-default items-center rounded-md border border-solid bg-background ps-2 pe-7 pl-2 text-xs font-medium text-secondary-foreground transition-all hover:bg-background disabled:cursor-not-allowed disabled:opacity-50 data-fixed:pe-2',
                    badgeClassName,
                  )}
                  data-disabled={(disabled ?? false) || undefined}
                  data-fixed={option.fixed}
                  key={option.value}
                >
                  {option.label}
                  <button
                    className="absolute -inset-y-px -end-px flex size-7 items-center justify-center rounded-e-lg border border-transparent p-0 text-muted-foreground/80 outline-0 transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring/70"
                    aria-label="Remove"
                    onClick={() => {
                      handleUnselect(option)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleUnselect(option)
                      }
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                  >
                    <X aria-hidden="true" strokeWidth={2} size={14} />
                  </button>
                </div>
              )
            })}
            {/* Avoid having the "Search" Icon */}
            <CommandPrimitive.Input
              {...inputProps}
              className={cn(
                'flex-1 bg-transparent outline-hidden placeholder:text-muted-foreground disabled:cursor-not-allowed',
                {
                  'w-full': hidePlaceholderWhenSelected,
                  'px-3 py-2': selected.length === 0,
                  'ml-1': selected.length !== 0,
                },
                inputProps?.className,
              )}
              placeholder={
                (hidePlaceholderWhenSelected ?? false) && selected.length !== 0 ? '' : placeholder
              }
              value={inputValue}
              disabled={disabled}
              ref={inputRef}
              onBlur={(event) => {
                if (!onScrollbar) {
                  setOpen(false)
                }
                inputProps?.onBlur?.(event)
              }}
              onFocus={(event) => {
                setOpen(true)
                if (triggerSearchOnFocus) {
                  void onSearch?.(debouncedSearchTerm)
                }
                inputProps?.onFocus?.(event)
              }}
              onValueChange={(value) => {
                setInputValue(value)
                inputProps?.onValueChange?.(value)
              }}
            />
            <button
              className={cn(
                'absolute end-0 top-0 flex size-9 items-center justify-center rounded-lg border border-transparent text-muted-foreground/80 transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring/70',
                (hideClearAllButton ||
                  (disabled ?? false) ||
                  selected.length < 1 ||
                  selected.filter((s) => s.fixed ?? false).length === selected.length) &&
                  'hidden',
              )}
              type="button"
              aria-label="Clear all"
              onClick={() => {
                setSelected(selected.filter((s) => s.fixed ?? false))
                onChange?.(selected.filter((s) => s.fixed ?? false))
              }}
            >
              <X aria-hidden="true" strokeWidth={2} size={16} />
            </button>
          </div>
        </div>
        <div className="relative">
          <div
            className={cn(
              'absolute top-2 z-50 w-full overflow-hidden rounded-lg border border-input',
              'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
              !open && 'hidden',
            )}
            data-state={open ? 'open' : 'closed'}
          >
            {open && (
              <CommandList
                className="bg-popover text-popover-foreground shadow-lg shadow-black/5 outline-hidden"
                onMouseEnter={() => {
                  setOnScrollbar(true)
                }}
                onMouseLeave={() => {
                  setOnScrollbar(false)
                }}
                onMouseUp={() => {
                  inputRef.current?.focus()
                }}
              >
                {isLoading ? (
                  <>{loadingIndicator}</>
                ) : (
                  <>
                    {EmptyItem()}
                    {CreatableItem()}
                    {!selectFirstItem && <CommandItem className="hidden" value="-" />}
                    {Object.entries(selectables).map(([key, dropdowns]) => (
                      <CommandGroup className="h-full overflow-auto" heading={key} key={key}>
                        <>
                          {dropdowns.map((option) => {
                            return (
                              <CommandItem
                                className={cn(
                                  'cursor-pointer',
                                  (option.disable ?? false) && 'cursor-not-allowed opacity-50',
                                )}
                                value={option.value}
                                disabled={option.disable}
                                key={option.value}
                                onMouseDown={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                }}
                                onSelect={() => {
                                  if (selected.length >= maxSelected) {
                                    onMaxSelected?.(selected.length)
                                    return
                                  }
                                  setInputValue('')
                                  const newOptions = [...selected, option]
                                  setSelected(newOptions)
                                  onChange?.(newOptions)
                                }}
                              >
                                {option.label}
                              </CommandItem>
                            )
                          })}
                        </>
                      </CommandGroup>
                    ))}
                  </>
                )}
              </CommandList>
            )}
          </div>
        </div>
      </Command>
    )
  },
)

MultipleSelector.displayName = 'MultipleSelector'

export default MultipleSelector
