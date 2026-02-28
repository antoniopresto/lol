import { useId } from 'react';
import { FormField } from './form_field';

interface FormDatePickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
  error?: string;
  includeTime?: boolean;
  min?: string;
  max?: string;
}

export function FormDatePicker({
  label,
  value,
  onChange,
  description,
  error,
  includeTime,
  min,
  max,
}: FormDatePickerProps) {
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
        className="form-input form-input--date"
        type={includeTime ? 'datetime-local' : 'date'}
        value={value}
        onChange={e => onChange(e.target.value)}
        min={min}
        max={max}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
      />
    </FormField>
  );
}
