import { useId } from 'react';
import { FormField } from './form_field';

export interface FormDropdownOption {
  label: string;
  value: string;
}

interface FormDropdownProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: FormDropdownOption[];
  placeholder?: string;
  description?: string;
  error?: string;
}

export function FormDropdown({
  label,
  value,
  onChange,
  options,
  placeholder,
  description,
  error,
}: FormDropdownProps) {
  const id = useId();

  return (
    <FormField
      label={label}
      description={description}
      error={error}
      htmlFor={id}
    >
      <select
        id={id}
        className="form-input form-input--select"
        value={value}
        onChange={e => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
      >
        {placeholder && !value && (
          <option value="" disabled hidden>
            {placeholder}
          </option>
        )}
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FormField>
  );
}
