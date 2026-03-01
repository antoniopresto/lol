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
    contextLabel?: string;
  } = {},
) {
  const defaultActions: Action[] = [
    {
      label: 'Open',
      shortcut: <span>Enter</span>,
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
    contextLabel: overrides.contextLabel,
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

  it('renders actions trigger with label and shortcut', () => {
    renderActionPanel();
    expect(screen.getByText('Actions')).toBeInTheDocument();
    expect(screen.getByText('⌘K')).toBeInTheDocument();
  });

  it('renders primary shortcut', () => {
    renderActionPanel();
    expect(screen.getByText('Enter')).toBeInTheDocument();
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

  it('calls onClick when actions trigger is clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    renderActionPanel({
      actions: [
        {
          label: 'Open',
          shortcut: <span>Enter</span>,
        },
        {
          label: 'Actions',
          shortcut: <span>⌘K</span>,
          onClick,
        },
      ],
    });

    await user.click(screen.getByText('Actions'));
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

  it('actions trigger has aria-haspopup', () => {
    renderActionPanel();
    const actionsButton = screen.getByText('Actions').closest('button')!;
    expect(actionsButton).toHaveAttribute('aria-haspopup', 'menu');
  });

  it('renders context label when provided', () => {
    renderActionPanel({ contextLabel: 'Raycast' });
    expect(screen.getByText('Raycast')).toBeInTheDocument();
  });

  it('renders separator between primary action and actions trigger', () => {
    const { container } = renderActionPanel();
    expect(
      container.querySelector('.action-panel__separator'),
    ).toBeInTheDocument();
  });

  it('renders Raycast logo', () => {
    const { container } = renderActionPanel();
    expect(container.querySelector('.action-panel__logo')).toBeInTheDocument();
  });
});
