import { useId } from 'react';
import { FormField } from './form_field';

interface FormTextAreaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  description?: string;
  error?: string;
  rows?: number;
}

export function FormTextArea({
  label,
  value,
  onChange,
  placeholder,
  description,
  error,
  rows = 4,
}: FormTextAreaProps) {
  const id = useId();

  return (
    <FormField
      label={label}
      description={description}
      error={error}
      htmlFor={id}
    >
      <textarea
        id={id}
        className="form-input form-input--textarea"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        spellCheck={false}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
      />
    </FormField>
  );
}
