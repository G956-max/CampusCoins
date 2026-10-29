import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../../utils/cn';

const Input = React.forwardRef(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      type = 'text',
      className,
      id,
      name,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordType = type === 'password';
    const inputType = isPasswordType ? (showPassword ? 'text' : 'password') : type;
    const inputId = id || name;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold tracking-wide text-[#17211B]"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-[#647168]">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            name={name}
            type={inputType}
            className={cn(
              'w-full bg-white border rounded-xl px-3.5 py-2.5 text-sm text-[#17211B] placeholder-[#647168]/50 transition-all duration-150 shadow-sm',
              'focus:outline-none focus:ring-2 focus:ring-[#168451]/20 focus:border-[#168451]',
              leftIcon ? 'pl-10' : 'pl-3.5',
              isPasswordType || rightIcon ? 'pr-10' : 'pr-3.5',
              error
                ? 'border-[#C43D3D] focus:border-[#C43D3D] focus:ring-[#C43D3D]/20'
                : 'border-[#E1E9E2] hover:border-[#168451]/60',
              className
            )}
            {...props}
          />

          {isPasswordType ? (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 flex items-center text-[#647168] hover:text-[#17211B] transition-colors focus:outline-none"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          ) : rightIcon ? (
            <div className="absolute right-3.5 flex items-center pointer-events-none text-[#647168]">
              {rightIcon}
            </div>
          ) : null}
        </div>

        {error && (
          <p className="text-xs text-[#C43D3D] font-medium animate-fadeIn">
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

Input.displayName = 'Input';
export default Input;
