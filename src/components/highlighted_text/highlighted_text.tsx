import { useMemo } from 'react';
import { fuzzyScore } from '../../utils/fuzzy_search';
import './highlighted_text.scss';

interface HighlightedTextProps {
  text: string;
  query: string;
  indices?: number[];
  className?: string;
}

function buildSegments(
  text: string,
  indices: number[],
):
  | {
      text: string;
      highlighted: boolean;
    }[]
  | null {
  if (indices.length === 0) return null;

  const indexSet = new Set(indices);
  const parts: {
    text: string;
    highlighted: boolean;
  }[] = [];
  let current = '';
  let currentHighlighted = false;

  for (let i = 0; i < text.length; i++) {
    const isHighlighted = indexSet.has(i);
    if (i === 0) {
      currentHighlighted = isHighlighted;
      current = text[i]!;
    } else if (isHighlighted === currentHighlighted) {
      current += text[i]!;
    } else {
      parts.push({
        text: current,
        highlighted: currentHighlighted,
      });
      current = text[i]!;
      currentHighlighted = isHighlighted;
    }
  }
  if (current) {
    parts.push({
      text: current,
      highlighted: currentHighlighted,
    });
  }

  return parts;
}

export function HighlightedText({
  text,
  query,
  indices: precomputedIndices,
  className,
}: HighlightedTextProps) {
  const segments = useMemo(() => {
    if (!query) return null;

    if (precomputedIndices) {
      return buildSegments(text, precomputedIndices);
    }

    const result = fuzzyScore(query, text);
    if (!result || result.indices.length === 0) return null;
    return buildSegments(text, result.indices);
  }, [
    text,
    query,
    precomputedIndices,
  ]);

  if (!segments) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={className}>
      {segments.map((segment, i) =>
        segment.highlighted ? (
          <span key={i} className="highlighted-text__match">
            {segment.text}
          </span>
        ) : (
          <span key={i}>{segment.text}</span>
        ))}
    </span>
  );
}
