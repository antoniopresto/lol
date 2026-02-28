import { useId } from 'react';

interface FormCheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
  error?: string;
}

export function FormCheckbox({
  label,
  checked,
  onChange,
  description,
  error,
}: FormCheckboxProps) {
  const id = useId();

  return (
    <div className={`form-checkbox${error ? ' form-checkbox--error' : ''}`}>
      <div className="form-checkbox__row">
        <input
          id={id}
          type="checkbox"
          className="form-checkbox__input"
          checked={checked}
          onChange={e => onChange(e.target.checked)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        <div
          className={`form-checkbox__box${checked ? ' form-checkbox__box--checked' : ''}`}
          aria-hidden="true"
        >
          {checked && (
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 5L4.5 7.5L8 2.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
        <label className="form-checkbox__label" htmlFor={id}>
          {label}
        </label>
      </div>
      {error && (
        <span className="form-checkbox__error" id={`${id}-error`}>
          {error}
        </span>
      )}
      {!error && description && (
        <span className="form-checkbox__description">{description}</span>
      )}
    </div>
  );
}
