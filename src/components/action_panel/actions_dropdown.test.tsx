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

describe('ActionsDropdown Submenu', () => {
  function createSubmenuSections(): DropdownSection[] {
    return [
      {
        actions: [
          {
            label: 'Open',
            onClick: vi.fn(),
          },
          {
            label: 'Copy As...',
            submenu: [
              {
                actions: [
                  {
                    label: 'Copy as Markdown',
                    onClick: vi.fn(),
                  },
                  {
                    label: 'Copy as JSON',
                    onClick: vi.fn(),
                  },
                ],
              },
            ],
          },
          {
            label: 'Delete',
            onClick: vi.fn(),
          },
        ],
      },
    ];
  }

  it('renders chevron on items with submenu', () => {
    const sections = createSubmenuSections();
    renderDropdown({ sections });

    const submenuItem = screen.getByText('Copy As...').closest('button')!;
    expect(
      submenuItem.querySelector('.actions-dropdown__chevron'),
    ).toBeInTheDocument();
    expect(submenuItem).toHaveClass('actions-dropdown__item--has-submenu');
  });

  it('sets aria-haspopup on submenu items', () => {
    const sections = createSubmenuSections();
    renderDropdown({ sections });

    const submenuItem = screen.getByText('Copy As...').closest('button')!;
    expect(submenuItem).toHaveAttribute('aria-haspopup', 'menu');

    const normalItem = screen.getByText('Open').closest('button')!;
    expect(normalItem).not.toHaveAttribute('aria-haspopup');
  });

  it('Enter on submenu item opens submenu', async () => {
    const user = userEvent.setup();
    const sections = createSubmenuSections();
    renderDropdown({ sections });

    await user.keyboard('{ArrowDown}{Enter}');

    expect(screen.getByText('Copy as Markdown')).toBeInTheDocument();
    expect(screen.getByText('Copy as JSON')).toBeInTheDocument();
    expect(screen.queryByText('Open')).not.toBeInTheDocument();
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });

  it('ArrowRight on submenu item opens submenu', async () => {
    const user = userEvent.setup();
    const sections = createSubmenuSections();
    renderDropdown({ sections });

    await user.keyboard('{ArrowDown}{ArrowRight}');

    expect(screen.getByText('Copy as Markdown')).toBeInTheDocument();
    expect(screen.getByText('Copy as JSON')).toBeInTheDocument();
  });

  it('click on submenu item opens submenu', async () => {
    const user = userEvent.setup();
    const sections = createSubmenuSections();
    renderDropdown({ sections });

    await user.click(screen.getByText('Copy As...'));

    expect(screen.getByText('Copy as Markdown')).toBeInTheDocument();
    expect(screen.getByText('Copy as JSON')).toBeInTheDocument();
  });

  it('Escape in submenu goes back to parent', async () => {
    const user = userEvent.setup();
    const sections = createSubmenuSections();
    const onClose = vi.fn();
    renderDropdown({
      sections,
      onClose,
    });

    await user.keyboard('{ArrowDown}{Enter}');
    expect(screen.getByText('Copy as Markdown')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.getByText('Open')).toBeInTheDocument();
    expect(screen.getByText('Copy As...')).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('ArrowLeft in submenu goes back to parent', async () => {
    const user = userEvent.setup();
    const sections = createSubmenuSections();
    renderDropdown({ sections });

    await user.keyboard('{ArrowDown}{ArrowRight}');
    expect(screen.getByText('Copy as Markdown')).toBeInTheDocument();

    await user.keyboard('{ArrowLeft}');
    expect(screen.getByText('Open')).toBeInTheDocument();
    expect(screen.getByText('Copy As...')).toBeInTheDocument();
  });

  it('Enter on submenu child action executes and closes', async () => {
    const user = userEvent.setup();
    const sections = createSubmenuSections();
    const childOnClick =
      sections[0]!.actions[1]!.submenu![0]!.actions[0]!.onClick!;
    const onClose = vi.fn();
    renderDropdown({
      sections,
      onClose,
    });

    await user.keyboard('{ArrowDown}{Enter}');
    await user.keyboard('{Enter}');

    expect(childOnClick).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows back button with parent label in submenu', async () => {
    const user = userEvent.setup();
    const sections = createSubmenuSections();
    renderDropdown({ sections });

    await user.keyboard('{ArrowDown}{Enter}');

    const backButton = screen.getByText('Copy As...').closest('button')!;
    expect(backButton).toHaveClass('actions-dropdown__back');
  });

  it('clicking back button returns to parent menu', async () => {
    const user = userEvent.setup();
    const sections = createSubmenuSections();
    renderDropdown({ sections });

    await user.keyboard('{ArrowDown}{Enter}');
    expect(screen.getByText('Copy as Markdown')).toBeInTheDocument();

    const backButton = screen
      .getByText('Copy As...')
      .closest('.actions-dropdown__back')!;
    await user.click(backButton);

    expect(screen.getByText('Open')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('ArrowRight on non-submenu item does nothing', async () => {
    const user = userEvent.setup();
    const sections = createSubmenuSections();
    renderDropdown({ sections });

    await user.keyboard('{ArrowRight}');
    expect(screen.getByText('Open')).toBeInTheDocument();
    expect(screen.getByText('Copy As...')).toBeInTheDocument();
  });

  it('ArrowLeft on root menu does nothing', async () => {
    const user = userEvent.setup();
    const sections = createSubmenuSections();
    const onClose = vi.fn();
    renderDropdown({
      sections,
      onClose,
    });

    await user.keyboard('{ArrowLeft}');
    expect(screen.getByText('Open')).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('keyboard nav works in submenu', async () => {
    const user = userEvent.setup();
    const sections = createSubmenuSections();
    const secondChildOnClick =
      sections[0]!.actions[1]!.submenu![0]!.actions[1]!.onClick!;
    const onClose = vi.fn();
    renderDropdown({
      sections,
      onClose,
    });

    await user.keyboard('{ArrowDown}{Enter}');
    await user.keyboard('{ArrowDown}{Enter}');

    expect(secondChildOnClick).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('restores active index to submenu parent item on Escape', async () => {
    const user = userEvent.setup();
    const sections = createSubmenuSections();
    renderDropdown({ sections });

    await user.keyboard('{ArrowDown}{Enter}');
    expect(screen.getByText('Copy as Markdown')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    const submenuItem = screen.getByText('Copy As...').closest('button')!;
    expect(submenuItem).toHaveClass('actions-dropdown__item--active');
  });

  it('restores active index to submenu parent item on ArrowLeft', async () => {
    const user = userEvent.setup();
    const sections = createSubmenuSections();
    renderDropdown({ sections });

    await user.keyboard('{ArrowDown}{ArrowRight}');
    expect(screen.getByText('Copy as Markdown')).toBeInTheDocument();

    await user.keyboard('{ArrowLeft}');
    const submenuItem = screen.getByText('Copy As...').closest('button')!;
    expect(submenuItem).toHaveClass('actions-dropdown__item--active');
  });

  it('applies slide-left class when entering submenu', async () => {
    const user = userEvent.setup();
    const sections = createSubmenuSections();
    const { container } = renderDropdown({ sections });

    await user.keyboard('{ArrowDown}{Enter}');
    const content = container.querySelector('.actions-dropdown__content');
    expect(content).toHaveClass('actions-dropdown__content--slide-left');
  });

  it('applies slide-right class when exiting submenu', async () => {
    const user = userEvent.setup();
    const sections = createSubmenuSections();
    const { container } = renderDropdown({ sections });

    await user.keyboard('{ArrowDown}{Enter}');
    await user.keyboard('{Escape}');
    const content = container.querySelector('.actions-dropdown__content');
    expect(content).toHaveClass('actions-dropdown__content--slide-right');
  });

  it('back button has menuitem role and aria-label', async () => {
    const user = userEvent.setup();
    const sections = createSubmenuSections();
    renderDropdown({ sections });

    await user.keyboard('{ArrowDown}{Enter}');
    const backButton = screen
      .getByText('Copy As...')
      .closest('.actions-dropdown__back')!;
    expect(backButton).toHaveAttribute('role', 'menuitem');
    expect(backButton).toHaveAttribute(
      'aria-label',
      'Back to parent menu from Copy As...',
    );
  });

  it('menu aria-label changes to submenu parent label', async () => {
    const user = userEvent.setup();
    const sections = createSubmenuSections();
    renderDropdown({ sections });

    const menu = screen.getByRole('menu');
    expect(menu).toHaveAttribute('aria-label', 'Available actions');

    await user.keyboard('{ArrowDown}{Enter}');
    expect(menu).toHaveAttribute('aria-label', 'Copy As...');
  });
});
