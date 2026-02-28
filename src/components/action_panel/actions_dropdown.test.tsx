import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { DropdownAction } from './actions_dropdown';
import { ActionsDropdown } from './actions_dropdown';

function createActions(): DropdownAction[] {
  return [
    {
      label: 'Copy URL',
      shortcut: <span>⌘C</span>,
      onClick: vi.fn(),
    },
    {
      label: 'Delete',
      shortcut: <span>⌘D</span>,
      onClick: vi.fn(),
    },
    {
      label: 'Move',
      onClick: vi.fn(),
    },
  ];
}

function renderDropdown(
  overrides: {
    actions?: DropdownAction[];
    open?: boolean;
    onClose?: () => void;
  } = {},
) {
  const actions = overrides.actions ?? createActions();
  const onClose = overrides.onClose ?? vi.fn();
  const result = render(
    <ActionsDropdown
      actions={actions}
      open={overrides.open ?? true}
      onClose={onClose}
    />,
  );
  return {
    ...result,
    actions,
    onClose,
  };
}

describe('ActionsDropdown', () => {
  it('renders nothing when closed', () => {
    const { container } = renderDropdown({ open: false });
    expect(container.innerHTML).toBe('');
  });

  it('renders nothing when actions are empty', () => {
    const { container } = renderDropdown({
      actions: [],
      open: true,
    });
    expect(container.innerHTML).toBe('');
  });

  it('renders all actions when open', () => {
    renderDropdown();
    expect(screen.getByText('Copy URL')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByText('Move')).toBeInTheDocument();
  });

  it('renders shortcuts when provided', () => {
    renderDropdown();
    expect(screen.getByText('⌘C')).toBeInTheDocument();
    expect(screen.getByText('⌘D')).toBeInTheDocument();
  });

  it('first item is active by default', () => {
    renderDropdown();
    const firstItem = screen.getByText('Copy URL').closest('button')!;
    expect(firstItem).toHaveClass('actions-dropdown__item--active');
  });

  it('ArrowDown navigates to next item', async () => {
    const user = userEvent.setup();
    renderDropdown();

    await user.keyboard('{ArrowDown}');
    const secondItem = screen.getByText('Delete').closest('button')!;
    expect(secondItem).toHaveClass('actions-dropdown__item--active');
  });

  it('ArrowDown wraps from last to first', async () => {
    const user = userEvent.setup();
    renderDropdown();

    await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}');
    const firstItem = screen.getByText('Copy URL').closest('button')!;
    expect(firstItem).toHaveClass('actions-dropdown__item--active');
  });

  it('ArrowUp navigates to previous item', async () => {
    const user = userEvent.setup();
    renderDropdown();

    await user.keyboard('{ArrowDown}{ArrowUp}');
    const firstItem = screen.getByText('Copy URL').closest('button')!;
    expect(firstItem).toHaveClass('actions-dropdown__item--active');
  });

  it('ArrowUp wraps from first to last', async () => {
    const user = userEvent.setup();
    renderDropdown();

    await user.keyboard('{ArrowUp}');
    const lastItem = screen.getByText('Move').closest('button')!;
    expect(lastItem).toHaveClass('actions-dropdown__item--active');
  });

  it('Enter executes action and closes', async () => {
    const user = userEvent.setup();
    const { actions, onClose } = renderDropdown();

    await user.keyboard('{Enter}');
    expect(actions[0]!.onClick).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('Enter executes navigated action', async () => {
    const user = userEvent.setup();
    const { actions, onClose } = renderDropdown();

    await user.keyboard('{ArrowDown}{Enter}');
    expect(actions[1]!.onClick).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('Escape closes dropdown', async () => {
    const user = userEvent.setup();
    const { onClose } = renderDropdown();

    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('clicking action executes and closes', async () => {
    const user = userEvent.setup();
    const { actions, onClose } = renderDropdown();

    await user.click(screen.getByText('Delete'));
    expect(actions[1]!.onClick).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('mouse enter changes active item', async () => {
    const user = userEvent.setup();
    renderDropdown();

    const moveItem = screen.getByText('Move').closest('button')!;
    await user.hover(moveItem);
    expect(moveItem).toHaveClass('actions-dropdown__item--active');
  });

  it('click outside closes dropdown', async () => {
    const user = userEvent.setup();
    const { onClose } = renderDropdown();

    await user.click(document.body);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('has menu role and menuitem roles', () => {
    renderDropdown();
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getAllByRole('menuitem')).toHaveLength(3);
  });

  it('⌘K closes dropdown', async () => {
    const user = userEvent.setup();
    const { onClose } = renderDropdown();

    await user.keyboard('{Meta>}k{/Meta}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
