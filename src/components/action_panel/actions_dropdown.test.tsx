import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { DropdownAction, DropdownSection } from './actions_dropdown';
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
    sections?: DropdownSection[];
    open?: boolean;
    onClose?: () => void;
  } = {},
) {
  const actions = createActions();
  const defaultSections: DropdownSection[] = [{ actions }];
  const sections = overrides.sections ?? defaultSections;
  const flatActions = sections.flatMap(s => s.actions);
  const onClose = overrides.onClose ?? vi.fn();
  const result = render(
    <ActionsDropdown
      sections={sections}
      open={overrides.open ?? true}
      onClose={onClose}
    />,
  );
  return {
    ...result,
    actions: flatActions,
    onClose,
  };
}

describe('ActionsDropdown', () => {
  it('renders nothing when closed', () => {
    const { container } = renderDropdown({ open: false });
    expect(container.innerHTML).toBe('');
  });

  it('renders nothing when sections have no actions', () => {
    const { container } = renderDropdown({
      sections: [{ actions: [] }],
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

  it('renders section titles', () => {
    renderDropdown({
      sections: [
        {
          title: 'Primary',
          actions: [
            {
              label: 'Open',
              onClick: vi.fn(),
            },
          ],
        },
        {
          title: 'Other',
          actions: [
            {
              label: 'Close',
              onClick: vi.fn(),
            },
          ],
        },
      ],
    });
    expect(screen.getByText('Primary')).toBeInTheDocument();
    expect(screen.getByText('Other')).toBeInTheDocument();
  });

  it('renders separator between sections', () => {
    const { container } = renderDropdown({
      sections: [
        {
          title: 'First',
          actions: [
            {
              label: 'A',
              onClick: vi.fn(),
            },
          ],
        },
        {
          title: 'Second',
          actions: [
            {
              label: 'B',
              onClick: vi.fn(),
            },
          ],
        },
      ],
    });
    const separators = container.querySelectorAll(
      '.actions-dropdown__separator',
    );
    expect(separators).toHaveLength(1);
  });

  it('does not render separator before first section', () => {
    const { container } = renderDropdown({
      sections: [
        {
          title: 'Only',
          actions: [
            {
              label: 'Solo',
              onClick: vi.fn(),
            },
          ],
        },
      ],
    });
    expect(
      container.querySelector('.actions-dropdown__separator'),
    ).not.toBeInTheDocument();
  });

  it('keyboard navigation works across sections', async () => {
    const user = userEvent.setup();
    const onClick1 = vi.fn();
    const onClick2 = vi.fn();
    renderDropdown({
      sections: [
        {
          actions: [
            {
              label: 'First',
              onClick: onClick1,
            },
          ],
        },
        {
          actions: [
            {
              label: 'Second',
              onClick: onClick2,
            },
          ],
        },
      ],
    });

    await user.keyboard('{ArrowDown}{Enter}');
    expect(onClick2).toHaveBeenCalledTimes(1);
  });

  it('skips empty sections and renders only non-empty ones', () => {
    const { container } = renderDropdown({
      sections: [
        {
          title: 'Empty',
          actions: [],
        },
        {
          title: 'Has Items',
          actions: [
            {
              label: 'Action',
              onClick: vi.fn(),
            },
          ],
        },
      ],
    });
    expect(screen.queryByText('Empty')).not.toBeInTheDocument();
    expect(screen.getByText('Has Items')).toBeInTheDocument();
    expect(
      container.querySelector('.actions-dropdown__separator'),
    ).not.toBeInTheDocument();
  });

  it('renders section without title (no title div)', () => {
    const { container } = renderDropdown({
      sections: [
        {
          actions: [
            {
              label: 'Untitled Action',
              onClick: vi.fn(),
            },
          ],
        },
      ],
    });
    expect(screen.getByText('Untitled Action')).toBeInTheDocument();
    expect(
      container.querySelector('.actions-dropdown__section-title'),
    ).not.toBeInTheDocument();
  });

  it('renders correct number of separators for 3 sections', () => {
    const { container } = renderDropdown({
      sections: [
        {
          title: 'A',
          actions: [
            {
              label: 'A1',
              onClick: vi.fn(),
            },
          ],
        },
        {
          title: 'B',
          actions: [
            {
              label: 'B1',
              onClick: vi.fn(),
            },
          ],
        },
        {
          title: 'C',
          actions: [
            {
              label: 'C1',
              onClick: vi.fn(),
            },
          ],
        },
      ],
    });
    const separators = container.querySelectorAll(
      '.actions-dropdown__separator',
    );
    expect(separators).toHaveLength(2);
  });

  it('sets aria-activedescendant on menu', () => {
    renderDropdown();
    const menu = screen.getByRole('menu');
    expect(menu).toHaveAttribute('aria-activedescendant', 'action-item-0');
  });

  it('section groups use aria-labelledby when titled', () => {
    renderDropdown({
      sections: [
        {
          title: 'My Section',
          actions: [
            {
              label: 'X',
              onClick: vi.fn(),
            },
          ],
        },
      ],
    });
    const group = screen.getByRole('group');
    expect(group).toHaveAttribute('aria-labelledby', 'section-title-0');
    expect(screen.getByText('My Section')).toHaveAttribute(
      'id',
      'section-title-0',
    );
  });
});
