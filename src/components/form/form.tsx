import type { FormEvent, ReactNode } from 'react';
import './form.scss';

interface FormProps {
  children: ReactNode;
  onSubmit?: () => void;
}

export function Form({ children, onSubmit }: FormProps) {
  function handleSubmit(e: FormEvent) {
    e.preventDefault();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && e.metaKey && onSubmit) {
      e.preventDefault();
      onSubmit();
    }
  }

  return (
    <form
      className="form"
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
      noValidate
    >
      <div className="form__fields">{children}</div>
    </form>
  );
}
