import type { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  description?: string;
  error?: string;
  children: ReactNode;
  htmlFor?: string;
}

export function FormField({
  label,
  description,
  error,
  children,
  htmlFor,
}: FormFieldProps) {
  return (
    <div className={`form-field${error ? ' form-field--error' : ''}`}>
      <div className="form-field__header">
        <label className="form-field__label" htmlFor={htmlFor}>
          {label}
        </label>
        {error && (
          <span
            className="form-field__error"
            id={htmlFor ? `${htmlFor}-error` : undefined}
          >
            {error}
          </span>
        )}
        {!error && description && (
          <span className="form-field__description">{description}</span>
        )}
      </div>
      <div className="form-field__control">{children}</div>
    </div>
  );
}
