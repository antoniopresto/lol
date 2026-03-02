import { useCallback, useId, useMemo } from 'react';
import { DatePicker, type DatePickerType } from '../date_picker/date_picker';
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

function parseDate(str: string): Date | null {
  if (!str) return null;
  const d = new Date(str + 'T00:00:00');
  return isNaN(d.getTime()) ? null : d;
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
  const type: DatePickerType = includeTime ? 'datetime' : 'date';

  const dateValue = useMemo(() => parseDate(value), [value]);
  const minDate = useMemo(() => (min ? parseDate(min) : undefined), [min]);
  const maxDate = useMemo(() => (max ? parseDate(max) : undefined), [max]);

  const handleChange = useCallback(
    (date: Date) => {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      onChange(`${yyyy}-${mm}-${dd}`);
    },
    [onChange],
  );

  return (
    <FormField
      label={label}
      description={description}
      error={error}
      htmlFor={id}
    >
      <DatePicker
        value={dateValue}
        onChange={handleChange}
        type={type}
        min={minDate ?? undefined}
        max={maxDate ?? undefined}
      />
    </FormField>
  );
}
