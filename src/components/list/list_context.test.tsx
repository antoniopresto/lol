import { render, renderHook, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { List } from './list';
import { useListContext } from './list_context';

function ContextReader() {
  const { activeIndex } = useListContext();
  return <div data-testid="index">{activeIndex}</div>;
}

describe('useListContext', () => {
  it('throws when used outside List', () => {
    expect(() => {
      renderHook(() => useListContext());
    }).toThrow('useListContext must be used within a List');
  });

  it('provides context value when used within List', () => {
    render(
      <List itemCount={3}>
        <ContextReader />
      </List>,
    );
    expect(screen.getByTestId('index')).toHaveTextContent('0');
  });
});
