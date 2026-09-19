import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';

const Select = React.forwardRef(
  (
    {
      label,
      options = [],
      error,
      helperText,
      className,
      id,
      name,
      placeholder = 'Select an option',
      ...props
    },
    ref
  ) => {
    const selectId = id || name;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold tracking-wider text-slate-300 uppercase"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          <select
            ref={ref}
            id={selectId}
            name={name}
            className={cn(
              'w-full appearance-none bg-slate-900/80 border rounded-xl px-3.5 py-2.5 pr-10 text-sm text-slate-100 transition-all duration-150',
              'focus:outline-none focus:ring-2 focus:ring-campus-500/30 focus:border-campus-500 cursor-pointer',
              error
                ? 'border-rose-500/80 focus:border-rose-500'
                : 'border-slate-800 hover:border-slate-700',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled className="bg-slate-900 text-slate-500">
                {placeholder}
              </option>
            )}
            {options.map((option) => {
              const value = typeof option === 'object' ? option.value : option;
              const optLabel = typeof option === 'object' ? option.label : option;
              return (
                <option
                  key={value}
                  value={value}
                  className="bg-slate-900 text-slate-100 py-1"
                >
                  {optLabel}
                </option>
              );
            })}
          </select>

          <div className="absolute right-3.5 flex items-center pointer-events-none text-slate-400">
            <ChevronDown size={18} />
          </div>
        </div>

        {error && (
          <p className="text-xs text-rose-400 font-medium">
            {error}
          </p>
        )}

        {helperText && !error && (
          <p className="text-xs text-slate-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
export default Select;
