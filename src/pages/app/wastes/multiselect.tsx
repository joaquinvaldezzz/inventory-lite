/* eslint-disable complexity -- TODO: refactor this component */
import * as React from "react";
import { CaretSortIcon, CheckIcon, Cross2Icon } from "@radix-ui/react-icons";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: Option[];
  value?: string[] | string;
  onChange?: (values: string[] | string) => void;
  placeholder?: string;
  inputPlaceholder?: string;
  emptyPlaceholder?: string;
  className?: string;
  multiple?: boolean;
}

const MultiSelect = React.forwardRef<HTMLInputElement, MultiSelectProps>(
  (
    {
      inputPlaceholder,
      emptyPlaceholder,
      placeholder,
      className,
      options,
      value,
      onChange,
      multiple,
      ...props
    },
    ref,
  ) => {
    const [searchTerm, setSearchTerm] = React.useState<string>("");
    const [isOpen, setIsOpen] = React.useState(false);

    const handleSelect = (selectedValue: string) => {
      if (multiple ?? false) {
        const newValue =
          (value?.includes(selectedValue) ?? false) && Array.isArray(value)
            ? value.filter((v) => v !== selectedValue)
            : // eslint-disable-next-line @typescript-eslint/no-misused-spread -- Safe to use spread here as we're dealing with simple string values
              [...(value ?? []), selectedValue];
        onChange?.(newValue);
      } else {
        onChange?.(selectedValue);
        setIsOpen(false);
      }
    };

    const handleClear = () => {
      onChange?.((multiple ?? false) ? [] : "");
    };

    return (
      <Popover open={isOpen} onOpenChange={setIsOpen} {...props}>
        <PopoverTrigger asChild>
          <div
            className={cn(
              "flex h-auto min-h-9 cursor-pointer items-center justify-between rounded-md border px-3 py-1 data-[state=open]:border-ring",
              className,
            )}
          >
            <div
              className={cn(
                "items-center gap-1 overflow-hidden text-sm",
                (multiple ?? false) ? "flex grow flex-wrap" : "inline-flex whitespace-nowrap",
              )}
            >
              {value != null && value.length > 0 ? (
                (multiple ?? false) ? (
                  options
                    .filter((option) => Array.isArray(value) && value.includes(option.value))
                    .map((option) => (
                      <Badge key={option.value} variant="light">
                        <span>{option.label}</span>
                        <span
                          className="flex items-center rounded-sm px-px text-muted-foreground/60 hover:bg-accent hover:text-muted-foreground"
                          onClick={(e) => {
                            e.preventDefault();
                            handleSelect(option.value);
                          }}
                        >
                          <Cross2Icon />
                        </span>
                      </Badge>
                    ))
                ) : (
                  options.find((opt) => opt.value === value)?.label
                )
              ) : (
                <span className="mr-auto text-muted-foreground">{placeholder}</span>
              )}
            </div>
            <div className="flex items-center self-stretch pl-1 text-muted-foreground/60 hover:text-foreground [&>div]:flex [&>div]:items-center [&>div]:self-stretch">
              {value != null && value.length > 0 ? (
                <div
                  onClick={(e) => {
                    e.preventDefault();
                    handleClear();
                  }}
                >
                  <Cross2Icon className="size-4" />
                </div>
              ) : (
                <div>
                  <CaretSortIcon className="size-4" />
                </div>
              )}
            </div>
          </div>
        </PopoverTrigger>

        <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
          <Command>
            <div className="relative">
              <CommandInput
                className="h-9"
                placeholder={inputPlaceholder ?? "Search..."}
                value={searchTerm}
                ref={ref}
                onValueChange={(e) => {
                  setSearchTerm(e);
                }}
              />
              {searchTerm.length > 0 && (
                <div
                  className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3 text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setSearchTerm("");
                  }}
                >
                  <Cross2Icon className="size-4" />
                </div>
              )}
            </div>
            <CommandEmpty>{emptyPlaceholder ?? "No results found."}</CommandEmpty>
            <CommandGroup>
              <ScrollArea>
                <div className="max-h-64">
                  {options.map((option) => {
                    const isSelected = Array.isArray(value) && value.includes(option.value);
                    return (
                      <CommandItem
                        key={option.value}
                        // value={option.value}
                        onSelect={() => {
                          handleSelect(option.value);
                        }}
                      >
                        {(multiple ?? false) && (
                          <div
                            className={cn(
                              "flex size-4 items-center justify-center rounded-[4px] border border-primary",
                              isSelected
                                ? "bg-primary text-primary-foreground"
                                : "opacity-50 [&_svg]:invisible",
                            )}
                          >
                            <CheckIcon />
                          </div>
                        )}
                        <span>{option.label}</span>
                        {(multiple ?? false) && option.value === value && (
                          <CheckIcon
                            className={cn(
                              "ml-auto",
                              option.value === value ? "opacity-100" : "opacity-0",
                            )}
                          />
                        )}
                      </CommandItem>
                    );
                  })}
                </div>
              </ScrollArea>
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    );
  },
);

MultiSelect.displayName = "MultiSelect";

export default MultiSelect;
