import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './date_picker.scss';

export type DatePickerType = 'date' | 'datetime';

interface DatePickerProps {
  value: Date | null;
  onChange: (date: Date) => void;
  type?: DatePickerType;
  min?: Date;
  max?: Date;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isDisabled: boolean;
}

const WEEKDAYS = [
  'Mo',
  'Tu',
  'We',
  'Th',
  'Fr',
  'Sa',
  'Su',
];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isDateDisabled(date: Date, min?: Date, max?: Date): boolean {
  if (min) {
    const minDay = new Date(min);
    minDay.setHours(0, 0, 0, 0);
    const checkDay = new Date(date);
    checkDay.setHours(0, 0, 0, 0);
    if (checkDay < minDay) return true;
  }
  if (max) {
    const maxDay = new Date(max);
    maxDay.setHours(0, 0, 0, 0);
    const checkDay = new Date(date);
    checkDay.setHours(0, 0, 0, 0);
    if (checkDay > maxDay) return true;
  }
  return false;
}

function getCalendarDays(
  year: number,
  month: number,
  selected: Date | null,
  min?: Date,
  max?: Date
): CalendarDay[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const firstOfMonth = new Date(year, month, 1);
  let startDay = firstOfMonth.getDay() - 1;
  if (startDay < 0) startDay = 6;

  const startDate = new Date(year, month, 1 - startDay);
  const days: CalendarDay[] = [];

  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);

    days.push({
      date,
      isCurrentMonth: date.getMonth() === month,
      isToday: isSameDay(date, today),
      isSelected: selected ? isSameDay(date, selected) : false,
      isDisabled: isDateDisabled(date, min, max),
    });
  }

  return days;
}

function padTwo(n: number): string {
  return String(n).padStart(2, '0');
}

export function DatePicker({
  value,
  onChange,
  type = 'datetime',
  min,
  max,
}: DatePickerProps) {
  const now = useMemo(() => new Date(), []);
  const initial = value ?? now;

  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [hours, setHours] = useState(initial.getHours());
  const [minutes, setMinutes] = useState(initial.getMinutes());

  const gridRef = useRef<HTMLDivElement>(null);

  const days = useMemo(
    () => getCalendarDays(viewYear, viewMonth, value, min, max),
    [
      viewYear,
      viewMonth,
      value,
      min,
      max,
    ],
  );

  useEffect(() => {
    if (value) {
      setViewYear(value.getFullYear());
      setViewMonth(value.getMonth());
    }
  }, [value]);

  const goToPrevMonth = useCallback(() => {
    setViewMonth(prev => {
      if (prev === 0) {
        setViewYear(y => y - 1);
        return 11;
      }
      return prev - 1;
    });
  }, []);

  const goToNextMonth = useCallback(() => {
    setViewMonth(prev => {
      if (prev === 11) {
        setViewYear(y => y + 1);
        return 0;
      }
      return prev + 1;
    });
  }, []);

  const selectDay = useCallback(
    (day: CalendarDay) => {
      if (day.isDisabled) return;
      const d = new Date(day.date);
      if (type === 'datetime') {
        d.setHours(hours, minutes, 0, 0);
      } else {
        d.setHours(0, 0, 0, 0);
      }
      onChange(d);
    },
    [
      onChange,
      type,
      hours,
      minutes,
    ],
  );

  const handleTimeChange = useCallback(
    (newHours: number, newMinutes: number) => {
      setHours(newHours);
      setMinutes(newMinutes);
      if (value) {
        const d = new Date(value);
        d.setHours(newHours, newMinutes, 0, 0);
        onChange(d);
      }
    },
    [
      value,
      onChange,
    ],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const idx = focusedIndex ?? days.findIndex(d => d.isSelected);
      const current = idx >= 0 ? idx : days.findIndex(d => d.isCurrentMonth);

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          setFocusedIndex(Math.max(0, current - 1));
          return;
        case 'ArrowRight':
          e.preventDefault();
          setFocusedIndex(Math.min(41, current + 1));
          return;
        case 'ArrowUp': {
          e.preventDefault();
          const up = current - 7;
          if (up < 0) {
            goToPrevMonth();
          } else {
            setFocusedIndex(up);
          }
          return;
        }
        case 'ArrowDown': {
          e.preventDefault();
          const down = current + 7;
          if (down > 41) {
            goToNextMonth();
          } else {
            setFocusedIndex(down);
          }
          return;
        }
        case 'PageUp':
          e.preventDefault();
          goToPrevMonth();
          return;
        case 'PageDown':
          e.preventDefault();
          goToNextMonth();
          return;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (current >= 0 && current < 42) {
            const day = days[current];
            if (day && !day.isDisabled) {
              selectDay(day);
            }
          }
          return;
        default:
          return;
      }
    },
    [
      focusedIndex,
      days,
      goToPrevMonth,
      goToNextMonth,
      selectDay,
    ],
  );

  useEffect(() => {
    if (focusedIndex !== null && gridRef.current) {
      const btn = gridRef.current.querySelector(
        `[data-day-index="${focusedIndex}"]`,
      ) as HTMLButtonElement | null;
      btn?.focus();
    }
  }, [focusedIndex]);

  return (
    <div className="date-picker">
      <div className="date-picker__header">
        <button
          type="button"
          className="date-picker__nav-btn"
          onClick={goToPrevMonth}
          aria-label="Previous month"
        >
          <ChevronLeft />
        </button>
        <span className="date-picker__month-year">
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button
          type="button"
          className="date-picker__nav-btn"
          onClick={goToNextMonth}
          aria-label="Next month"
        >
          <ChevronRight />
        </button>
      </div>

      <div className="date-picker__weekdays">
        {WEEKDAYS.map(day => (
          <span key={day} className="date-picker__weekday">
            {day}
          </span>
        ))}
      </div>

      <div
        ref={gridRef}
        className="date-picker__grid"
        role="grid"
        aria-label="Calendar"
        onKeyDown={handleKeyDown}
      >
        {days.map((day, i) => {
          const classes = ['date-picker__day'];
          if (!day.isCurrentMonth) classes.push('date-picker__day--other');
          if (day.isToday) classes.push('date-picker__day--today');
          if (day.isSelected) classes.push('date-picker__day--selected');
          if (day.isDisabled) classes.push('date-picker__day--disabled');

          return (
            <button
              key={i}
              type="button"
              className={classes.join(' ')}
              data-day-index={i}
              onClick={() => selectDay(day)}
              disabled={day.isDisabled}
              tabIndex={
                day.isSelected || (focusedIndex === i && !day.isDisabled)
                  ? 0
                  : -1
              }
              aria-label={day.date.toLocaleDateString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
              aria-selected={day.isSelected}
              aria-disabled={day.isDisabled}
            >
              {day.date.getDate()}
            </button>
          );
        })}
      </div>

      {type === 'datetime' && (
        <div className="date-picker__time">
          <label className="date-picker__time-label">Time</label>
          <div className="date-picker__time-inputs">
            <input
              type="number"
              className="date-picker__time-input"
              value={padTwo(hours)}
              onChange={e => {
                const h = Math.max(0, Math.min(23, Number(e.target.value)));
                handleTimeChange(h, minutes);
              }}
              min={0}
              max={23}
              aria-label="Hours"
            />
            <span className="date-picker__time-separator">:</span>
            <input
              type="number"
              className="date-picker__time-input"
              value={padTwo(minutes)}
              onChange={e => {
                const m = Math.max(0, Math.min(59, Number(e.target.value)));
                handleTimeChange(hours, m);
              }}
              min={0}
              max={59}
              aria-label="Minutes"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function ChevronLeft() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M8.5 3.5L5 7l3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M5.5 3.5L9 7l-3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
