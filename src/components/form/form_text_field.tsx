import { useId } from 'react';
import { FormField } from './form_field';

interface FormTextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  description?: string;
  error?: string;
  autoFocus?: boolean;
}

export function FormTextField({
  label,
  value,
  onChange,
  placeholder,
  description,
  error,
  autoFocus,
}: FormTextFieldProps) {
  const id = useId();

  return (
    <FormField
      label={label}
      description={description}
      error={error}
      htmlFor={id}
    >
      <input
        id={id}
        className="form-input"
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        spellCheck={false}
        autoComplete="off"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
      />
    </FormField>
  );
}
