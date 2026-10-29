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
            className="block text-xs font-semibold tracking-wide text-[#17211B]"
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
              'w-full appearance-none bg-white border rounded-xl px-3.5 py-2.5 pr-10 text-sm text-[#17211B] transition-all duration-150 shadow-sm',
              'focus:outline-none focus:ring-2 focus:ring-[#168451]/20 focus:border-[#168451] cursor-pointer',
              error
                ? 'border-[#C43D3D] focus:border-[#C43D3D]'
                : 'border-[#E1E9E2] hover:border-[#168451]/60',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled className="bg-white text-[#647168]">
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
                  className="bg-white text-[#17211B] py-1"
                >
                  {optLabel}
                </option>
              );
            })}
          </select>

          <div className="absolute right-3.5 flex items-center pointer-events-none text-[#647168]">
            <ChevronDown size={18} />
          </div>
        </div>

        {error && (
          <p className="text-xs text-[#C43D3D] font-medium">
            {error}
          </p>
        )}

        {helperText && !error && (
          <p className="text-xs text-[#647168]">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
export default Select;
