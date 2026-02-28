import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Action } from './action_panel';
import { ActionPanel } from './action_panel';
import type { DropdownAction } from './actions_dropdown';

function renderActionPanel(
  overrides: {
    actions?: Action[];
    dropdownOpen?: boolean;
    dropdownActions?: DropdownAction[];
    onDropdownClose?: () => void;
  } = {},
) {
  const defaultActions: Action[] = [
    {
      label: 'Open',
      shortcut: <span>Enter</span>,
      onClick: vi.fn(),
    },
    {
      label: 'Copy',
      shortcut: <span>⌘C</span>,
      onClick: vi.fn(),
    },
    {
      label: 'Actions',
      shortcut: <span>⌘K</span>,
      onClick: vi.fn(),
    },
  ];

  const defaultDropdownActions: DropdownAction[] = [
    {
      label: 'Delete',
      shortcut: <span>⌘D</span>,
      onClick: vi.fn(),
    },
    {
      label: 'Move',
      shortcut: <span>⌘M</span>,
      onClick: vi.fn(),
    },
  ];

  const props = {
    actions: overrides.actions ?? defaultActions,
    dropdownOpen: overrides.dropdownOpen ?? false,
    dropdownActions: overrides.dropdownActions ?? defaultDropdownActions,
    onDropdownClose: overrides.onDropdownClose ?? vi.fn(),
  };

  return {
    ...render(<ActionPanel {...props} />),
    props,
  };
}

describe('ActionPanel', () => {
  it('renders primary action', () => {
    renderActionPanel();
    expect(screen.getByText('Open')).toBeInTheDocument();
  });

  it('renders secondary actions', () => {
    renderActionPanel();
    expect(screen.getByText('Copy')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('renders shortcuts', () => {
    renderActionPanel();
    expect(screen.getByText('Enter')).toBeInTheDocument();
    expect(screen.getByText('⌘C')).toBeInTheDocument();
  });

  it('returns null when no actions provided', () => {
    const { container } = render(
      <ActionPanel
        actions={[]}
        dropdownOpen={false}
        dropdownActions={[]}
        onDropdownClose={vi.fn()}
      />,
    );
    expect(container.innerHTML).toBe('');
  });

  it('calls onClick when primary action is clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    renderActionPanel({
      actions: [
        {
          label: 'Open',
          shortcut: <span>Enter</span>,
          onClick,
        },
      ],
    });

    await user.click(screen.getByText('Open'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('calls onClick when secondary action is clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    renderActionPanel({
      actions: [
        {
          label: 'Open',
          shortcut: <span>Enter</span>,
        },
        {
          label: 'Copy',
          shortcut: <span>⌘C</span>,
          onClick,
        },
      ],
    });

    await user.click(screen.getByText('Copy'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('has toolbar role', () => {
    renderActionPanel();
    expect(screen.getByRole('toolbar')).toBeInTheDocument();
  });

  it('shows dropdown when dropdownOpen is true', () => {
    renderActionPanel({ dropdownOpen: true });
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByText('Move')).toBeInTheDocument();
  });

  it('hides dropdown when dropdownOpen is false', () => {
    renderActionPanel({ dropdownOpen: false });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('last secondary action has aria-haspopup', () => {
    renderActionPanel();
    const actionsButton = screen.getByText('Actions').closest('button')!;
    expect(actionsButton).toHaveAttribute('aria-haspopup', 'menu');
  });
});
