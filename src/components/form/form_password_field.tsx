import { useId, useState } from 'react';
import { FormField } from './form_field';

interface FormPasswordFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  description?: string;
  error?: string;
  autoFocus?: boolean;
}

function EyeIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8 3.5C4.5 3.5 1.73 5.86 1 8c.73 2.14 3.5 4.5 7 4.5s6.27-2.36 7-4.5c-.73-2.14-3.5-4.5-7-4.5Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2 2l12 12M6.5 6.65a2 2 0 0 0 2.85 2.85M8 12.5c-3.5 0-6.27-2.36-7-4.5a7.56 7.56 0 0 1 2.76-3.53M8 3.5c3.5 0 6.27 2.36 7 4.5a7.58 7.58 0 0 1-1.4 2.13"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FormPasswordField({
  label,
  value,
  onChange,
  placeholder,
  description,
  error,
  autoFocus,
}: FormPasswordFieldProps) {
  const id = useId();
  const [revealed, setRevealed] = useState(false);

  return (
    <FormField
      label={label}
      description={description}
      error={error}
      htmlFor={id}
    >
      <div className="form-password-wrapper">
        <input
          id={id}
          className="form-input form-input--password"
          type={revealed ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          spellCheck={false}
          autoComplete="current-password"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        <button
          type="button"
          className="form-password-toggle"
          onClick={() => setRevealed(prev => !prev)}
          aria-label={revealed ? 'Hide password' : 'Show password'}
        >
          {revealed ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
    </FormField>
  );
}
