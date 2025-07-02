'use client';

import * as React from 'react';
import ReactDatePicker from 'react-datepicker';
import { cn } from '@/lib/utils';
import "react-datepicker/dist/react-datepicker.css";

interface DatePickerProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  className?: string;
  placeholderText?: string;
}

export const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  ({ selected, onChange, className, placeholderText, ...props }) => {
    return (
      <ReactDatePicker
        selected={selected}
        onChange={onChange}
        className={cn(
          "flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        placeholderText={placeholderText}
        dateFormat="dd/MM/yyyy"
        showPopperArrow={false}
        calendarClassName="bg-white shadow-lg rounded-lg border border-gray-200"
        popperClassName="z-50"
        popperPlacement="bottom-start"
        {...props}
      />
    );
  }
);

DatePicker.displayName = "DatePicker"; 