import { useEffect, useRef, type ComponentProps, type Ref } from "react";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { DayPicker, getDefaultClassNames, type DayButton } from "react-day-picker";

import { cn } from "@/lib/utils";

import { Button } from "./button";
import { buttonVariants } from "./button-variants";

/**
 * Calendar component provides a customizable date picker interface.
 *
 * This component extends the react-day-picker DayPicker with enhanced styling and additional
 * customization options. It supports:
 *
 * - Single date selection and date range selection
 * - Customizable button variants and styling
 * - Responsive design with mobile-friendly layout
 * - Accessibility features including keyboard navigation
 * - Custom formatters for date display
 * - Outside days display control
 *
 * The component uses CSS custom properties for consistent spacing and theming across different
 * contexts (cards, popovers, etc.).
 *
 * @param props Component configuration and DayPicker props
 * @param props.className Additional CSS classes for custom styling
 * @param props.classNames Custom class names for specific calendar elements
 * @param props.showOutsideDays Whether to show days from adjacent months (default: true)
 * @param props.captionLayout Layout style for the month/year caption (default: "label")
 * @param props.buttonVariant Button style variant for navigation buttons (default: "ghost")
 * @param props.formatters Custom formatters for date and month display
 * @param props.components Custom component overrides for calendar elements
 * @returns JSX element representing the calendar interface
 */
export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}: ComponentProps<typeof DayPicker> & {
  buttonVariant?: ComponentProps<typeof Button>["variant"];
}) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      className={cn(
        "group/calendar bg-background p-3 [--cell-size:--spacing(8)] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className,
      )}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn("relative flex flex-col gap-4 md:flex-row", defaultClassNames.months),
        month: cn("flex w-full flex-col gap-4", defaultClassNames.month),
        nav: cn(
          "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
          defaultClassNames.nav,
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "size-(--cell-size) p-0 select-none aria-disabled:opacity-50",
          defaultClassNames.button_previous,
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "size-(--cell-size) p-0 select-none aria-disabled:opacity-50",
          defaultClassNames.button_next,
        ),
        month_caption: cn(
          "flex h-(--cell-size) w-full items-center justify-center px-(--cell-size)",
          defaultClassNames.month_caption,
        ),
        dropdowns: cn(
          "flex h-(--cell-size) w-full items-center justify-center gap-1.5 text-sm font-medium",
          defaultClassNames.dropdowns,
        ),
        dropdown_root: cn(
          "relative rounded-md border border-input shadow-xs has-focus:border-ring has-focus:ring-[3px] has-focus:ring-ring/50",
          defaultClassNames.dropdown_root,
        ),
        dropdown: cn("absolute inset-0 opacity-0", defaultClassNames.dropdown),
        caption_label: cn(
          "font-medium select-none",
          captionLayout === "label"
            ? "text-sm"
            : "flex h-8 items-center gap-1 rounded-md pr-1 pl-2 text-sm [&>svg]:size-3.5 [&>svg]:text-muted-foreground",
          defaultClassNames.caption_label,
        ),
        table: "w-full border-collapse",
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "flex-1 rounded-md text-[0.8rem] font-normal text-muted-foreground select-none",
          defaultClassNames.weekday,
        ),
        week: cn("mt-2 flex w-full", defaultClassNames.week),
        week_number_header: cn("w-(--cell-size) select-none", defaultClassNames.week_number_header),
        week_number: cn(
          "text-[0.8rem] text-muted-foreground select-none",
          defaultClassNames.week_number,
        ),
        day: cn(
          "group/day relative aspect-square h-full w-full p-0 text-center select-none [&:first-child[data-selected=true]_button]:rounded-l-md [&:last-child[data-selected=true]_button]:rounded-r-md",
          defaultClassNames.day,
        ),
        range_start: cn("rounded-l-md bg-accent", defaultClassNames.range_start),
        range_middle: cn("rounded-none", defaultClassNames.range_middle),
        range_end: cn("rounded-r-md bg-accent", defaultClassNames.range_end),
        today: cn(
          "rounded-md bg-accent text-accent-foreground data-[selected=true]:rounded-none",
          defaultClassNames.today,
        ),
        outside: cn(
          "text-muted-foreground aria-selected:text-muted-foreground",
          defaultClassNames.outside,
        ),
        disabled: cn("text-muted-foreground opacity-50", defaultClassNames.disabled),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      showOutsideDays={showOutsideDays}
      formatters={{
        formatMonthDropdown: (date) => date.toLocaleString("default", { month: "short" }),
        ...formatters,
      }}
      captionLayout={captionLayout}
      components={{
        Root: ({
          className,
          rootRef,
          ...props
        }: ComponentProps<"div"> & { rootRef?: Ref<HTMLDivElement> }) => {
          return <div className={cn(className)} data-slot="calendar" ref={rootRef} {...props} />;
        },
        Chevron: ({
          className,
          orientation,
          ...props
        }: ComponentProps<"svg"> & { orientation?: string }) => {
          if (orientation === "left") {
            return <ChevronLeftIcon className={cn("size-4", className)} {...props} />;
          }

          if (orientation === "right") {
            return <ChevronRightIcon className={cn("size-4", className)} {...props} />;
          }

          return <ChevronDownIcon className={cn("size-4", className)} {...props} />;
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-(--cell-size) items-center justify-center text-center">
                {children}
              </div>
            </td>
          );
        },
        ...components,
      }}
      {...props}
    />
  );
}

/**
 * CalendarDayButton component renders individual day buttons within the calendar.
 *
 * This component handles the visual representation and interaction for each calendar day. It
 * supports:
 *
 * - Single date selection highlighting
 * - Date range selection with start, middle, and end states
 * - Focus management for keyboard navigation
 * - Custom styling based on selection state
 * - Accessibility attributes for screen readers
 *
 * The component automatically focuses when the day is selected via keyboard navigation and applies
 * appropriate styling based on selection modifiers.
 *
 * @param props Day button configuration and event handlers
 * @param props.className Additional CSS classes for custom styling
 * @param props.day The date object representing this day
 * @param props.modifiers Object containing selection and state modifiers
 * @returns JSX element representing a calendar day button
 */
export function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames();
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  return (
    <Button
      className={cn(
        "flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 leading-none font-normal group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-[3px] group-data-[focused=true]/day:ring-ring/50 data-[range-end=true]:rounded-md data-[range-end=true]:rounded-r-md data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground data-[range-middle=true]:rounded-none data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:rounded-md data-[range-start=true]:rounded-l-md data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground dark:hover:text-accent-foreground [&>span]:text-xs [&>span]:opacity-70",
        defaultClassNames.day,
        className,
      )}
      data-range-middle={modifiers.range_middle}
      data-day={day.date.toLocaleDateString()}
      data-range-end={modifiers.range_end}
      data-range-start={modifiers.range_start}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      ref={ref}
      size="icon"
      variant="ghost"
      {...props}
    />
  );
}
