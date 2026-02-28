import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { List } from './list';
import { ListItem } from './list_item/list_item';

function renderList(props: {
  itemCount?: number;
  onActiveIndexChange?: (i: number) => void;
  onAction?: (i: number) => void;
}) {
  const count = props.itemCount ?? 3;
  return render(
    <List
      itemCount={count}
      onActiveIndexChange={props.onActiveIndexChange}
      onAction={props.onAction}
    >
      {Array.from({ length: count }, (_, i) => (
        <ListItem key={i} index={i} title={`Item ${i}`} />
      ))}
    </List>,
  );
}

describe('List', () => {
  it('renders a listbox with items', () => {
    renderList({});
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(3);
  });

  it('first item is active by default', () => {
    renderList({});
    const items = screen.getAllByRole('option');
    expect(items[0]).toHaveAttribute('aria-selected', 'true');
    expect(items[1]).toHaveAttribute('aria-selected', 'false');
  });

  it('ArrowDown moves active index forward', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderList({ onActiveIndexChange: onChange });

    await user.keyboard('{ArrowDown}');
    expect(onChange).toHaveBeenCalledWith(1);

    const items = screen.getAllByRole('option');
    expect(items[1]).toHaveAttribute('aria-selected', 'true');
  });

  it('ArrowDown wraps to first item from last', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderList({ onActiveIndexChange: onChange });

    await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}');
    expect(onChange).toHaveBeenLastCalledWith(0);
  });

  it('ArrowUp wraps to last item from first', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderList({ onActiveIndexChange: onChange });

    await user.keyboard('{ArrowUp}');
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('ArrowUp moves active index backward', async () => {
    const user = userEvent.setup();
    renderList({});

    await user.keyboard('{ArrowDown}{ArrowDown}{ArrowUp}');
    const items = screen.getAllByRole('option');
    expect(items[1]).toHaveAttribute('aria-selected', 'true');
  });

  it('Enter triggers onAction with active index', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    renderList({ onAction });

    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');
    expect(onAction).toHaveBeenCalledWith(1);
  });

  it('does not navigate when modifier keys are pressed', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderList({ onActiveIndexChange: onChange });

    await user.keyboard('{Meta>}{ArrowDown}{/Meta}');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('does not trigger action when modifier keys are pressed with Enter', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    renderList({ onAction });

    await user.keyboard('{Meta>}{Enter}{/Meta}');
    await user.keyboard('{Control>}{Enter}{/Control}');
    await user.keyboard('{Alt>}{Enter}{/Alt}');
    expect(onAction).not.toHaveBeenCalled();
  });

  it('does nothing when itemCount is 0', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    renderList({
      itemCount: 0,
      onAction,
    });

    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');
    expect(onAction).not.toHaveBeenCalled();
  });

  it('clamps active index when itemCount decreases', () => {
    const { rerender } = render(
      <List itemCount={3}>
        <ListItem index={0} title="A" />
        <ListItem index={1} title="B" />
        <ListItem index={2} title="C" />
      </List>,
    );

    rerender(
      <List itemCount={1}>
        <ListItem index={0} title="A" />
      </List>,
    );

    const items = screen.getAllByRole('option');
    expect(items[0]).toHaveAttribute('aria-selected', 'true');
  });
});
