import { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

interface BaseInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement>, BaseInputProps {
  as?: 'input';
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement>, BaseInputProps {
  as: 'textarea';
  showCharCount?: boolean;
}

type CombinedInputProps = InputProps | TextareaProps;

export default function Input({
  label,
  error,
  helperText,
  fullWidth = true,
  className = '',
  ...props
}: CombinedInputProps) {
  const inputId = 'id' in props ? props.id : undefined;
  const errorId = error && inputId ? `${inputId}-error` : undefined;
  const helperId = helperText && inputId ? `${inputId}-helper` : undefined;

  const baseClassName = `
    ${fullWidth ? 'w-full' : ''}
    px-4 py-3 border rounded-lg
    focus:ring-2 focus:ring-purple-500 focus:border-transparent
    outline-none transition
    text-gray-900
    disabled:bg-gray-100 disabled:cursor-not-allowed
    ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}
    ${className}
  `;

  const isTextarea = 'as' in props && props.as === 'textarea';
  const showCharCount = isTextarea && 'showCharCount' in props && props.showCharCount;
  const currentLength = isTextarea && typeof props.value === 'string' ? props.value.length : 0;
  const maxLength = 'maxLength' in props ? props.maxLength : undefined;

  const ariaDescribedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && inputId && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      {isTextarea ? (
        <textarea
          {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)}
          className={baseClassName}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={ariaDescribedBy}
        />
      ) : (
        <input
          {...(props as InputHTMLAttributes<HTMLInputElement>)}
          className={baseClassName}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={ariaDescribedBy}
        />
      )}

      {showCharCount && maxLength && (
        <p className="mt-1 text-xs text-gray-500 text-right">
          {currentLength}/{maxLength}
        </p>
      )}

      {error && errorId && (
        <p id={errorId} className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {helperText && !error && helperId && (
        <p id={helperId} className="mt-1 text-sm text-gray-600">
          {helperText}
        </p>
      )}
    </div>
  );
}
