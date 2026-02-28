import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { type ReactNode, useMemo } from 'react';
import './detail.scss';

export interface DetailProps {
  markdown: string;
  metadata?: ReactNode;
}

export function Detail({ markdown, metadata }: DetailProps) {
  const renderedHtml = useMemo(
    () => DOMPurify.sanitize(marked.parse(markdown, { async: false })),
    [markdown],
  );

  return (
    <div
      className={`detail${metadata ? ' detail--with-metadata' : ''}`}
      role="region"
      aria-label="Detail view"
    >
      <div className="detail__content" role="document">
        <div
          className="detail__markdown"
          dangerouslySetInnerHTML={{ __html: renderedHtml }}
        />
      </div>
      {metadata && <div className="detail__metadata">{metadata}</div>}
    </div>
  );
}
