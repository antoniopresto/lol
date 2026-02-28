import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { List } from '../list';
import { ListItem } from './list_item';

function renderItem(
  props: Partial<React.ComponentProps<typeof ListItem>> = {},
) {
  return render(
    <List itemCount={2}>
      <ListItem index={0} title="First" {...props} />
      <ListItem index={1} title="Second" />
    </List>,
  );
}

describe('ListItem', () => {
  it('renders title', () => {
    renderItem({ title: 'My Item' });
    expect(screen.getByText('My Item')).toBeInTheDocument();
  });

  it('renders subtitle when provided', () => {
    renderItem({ subtitle: 'Description' });
    expect(screen.getByText('Description')).toBeInTheDocument();
  });

  it('does not render subtitle when not provided', () => {
    renderItem({});
    expect(screen.queryByText('Description')).not.toBeInTheDocument();
  });

  it('renders icon when provided', () => {
    renderItem({ icon: <svg data-testid="icon" /> });
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders accessories', () => {
    renderItem({
      accessories: [
        { text: 'Today' },
        { text: '3pm' },
      ],
    });
    expect(screen.getByText('Today')).toBeInTheDocument();
    expect(screen.getByText('3pm')).toBeInTheDocument();
  });

  it('applies active class when index matches activeIndex', () => {
    renderItem({});
    const item = screen.getByText('First').closest('.list-item');
    expect(item).toHaveClass('list-item--active');
  });

  it('sets aria-selected correctly', () => {
    renderItem({});
    const items = screen.getAllByRole('option');
    expect(items[0]).toHaveAttribute('aria-selected', 'true');
    expect(items[1]).toHaveAttribute('aria-selected', 'false');
  });

  it('updates active index on mouse enter', async () => {
    const user = userEvent.setup();
    renderItem({});

    const secondItem = screen.getByText('Second').closest('.list-item')!;
    await user.hover(secondItem);

    expect(secondItem).toHaveClass('list-item--active');
    expect(screen.getAllByRole('option')[1]).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    renderItem({ onClick });

    const item = screen.getByText('First').closest('.list-item')!;
    await user.click(item);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('sets data-list-index attribute', () => {
    renderItem({ index: 0 });
    const item = screen.getByText('First').closest('.list-item')!;
    expect(item).toHaveAttribute('data-list-index', '0');
  });
});
