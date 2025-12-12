import * as React from "react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  withWeekdayHeader?: boolean;
};

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  withWeekdayHeader = true,
  ...props
}: CalendarProps) {
  return (
    <div className={cn("p-3", className)}>
      {withWeekdayHeader && (
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-muted-foreground mb-2 px-1">
          {WEEKDAYS.map((d) => (
            <div key={d} className="h-8 flex items-center justify-center">
              {d}
            </div>
          ))}
        </div>
      )}
      <DayPicker
        showOutsideDays={showOutsideDays}
        className=""
        classNames={{
          head: "hidden",
          months: "flex flex-col space-y-2",
          month: "space-y-2",
          caption:
            "flex items-center justify-between px-1 text-sm font-semibold text-foreground",
          caption_label: "text-sm font-semibold",
          nav: "flex items-center gap-1",
          nav_button:
            "h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 transition-colors",
          table: "w-full border-collapse",
          head_row: "hidden",
          head_cell: "hidden",
          row: "grid grid-cols-7 gap-1 text-center",
          cell: "h-9 w-9 p-0",
          day: "h-9 w-9 inline-flex items-center justify-center rounded-md text-sm font-medium hover:bg-slate-100 dark:hover:bg-white/10 transition-colors",
          day_selected:
            "bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold",
          day_today:
            "border border-slate-400 dark:border-white/30 font-semibold",
          ...classNames,
        }}
        styles={{ head: { display: "none" } }}
        {...props}
      />
    </div>
  );
}

export default Calendar;
