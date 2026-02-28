import { type ReactNode, useId } from 'react';
import './list_section.scss';

export interface ListSectionProps {
  title: string;
  children: ReactNode;
}

export function ListSection({ title, children }: ListSectionProps) {
  const headerId = useId();

  return (
    <div className="list-section" role="group" aria-labelledby={headerId}>
      <div id={headerId} className="list-section__header">
        {title}
      </div>
      {children}
    </div>
  );
}
