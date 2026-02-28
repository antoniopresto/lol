import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SearchBar } from './search_bar';

function renderSearchBar(
  props: Partial<React.ComponentProps<typeof SearchBar>> = {},
) {
  const defaultProps = {
    value: '',
    onChange: vi.fn(),
    ...props,
  };
  return {
    ...render(<SearchBar {...defaultProps} />),
    onChange: defaultProps.onChange,
  };
}

describe('SearchBar', () => {
  it('renders with placeholder', () => {
    renderSearchBar({ placeholder: 'Type here...' });
    expect(screen.getByPlaceholderText('Type here...')).toBeInTheDocument();
  });

  it('uses default placeholder when not specified', () => {
    renderSearchBar({});
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('autofocuses the input on mount', () => {
    renderSearchBar({});
    expect(screen.getByRole('combobox')).toHaveFocus();
  });

  it('calls onChange when user types', async () => {
    const user = userEvent.setup();
    const { onChange } = renderSearchBar({});

    const input = screen.getByRole('combobox');
    await user.type(input, 'hello');
    expect(onChange).toHaveBeenCalled();
  });

  it('renders breadcrumbs when provided', () => {
    renderSearchBar({
      breadcrumbs: [
        { label: 'Home' },
        { label: 'Settings' },
      ],
    });
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('does not render breadcrumbs when not provided', () => {
    renderSearchBar({});
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('calls onBack when breadcrumb button is clicked', async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();
    renderSearchBar({
      breadcrumbs: [
        {
          label: 'Home',
          onBack,
        },
        { label: 'Current' },
      ],
    });

    await user.click(screen.getByText('Home'));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('Escape clears value first if present', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onBack = vi.fn();
    renderSearchBar({
      value: 'search text',
      onChange,
      breadcrumbs: [
        {
          label: 'Home',
          onBack,
        },
      ],
    });

    const input = screen.getByRole('combobox');
    await user.type(input, '{Escape}');
    expect(onChange).toHaveBeenCalledWith('');
    expect(onBack).not.toHaveBeenCalled();
  });

  it('Escape triggers onBack when value is empty', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onBack = vi.fn();
    renderSearchBar({
      value: '',
      onChange,
      breadcrumbs: [
        {
          label: 'Home',
          onBack,
        },
      ],
    });

    const input = screen.getByRole('combobox');
    await user.type(input, '{Escape}');
    expect(onBack).toHaveBeenCalledTimes(1);
    expect(onChange).not.toHaveBeenCalledWith('');
  });

  it('has correct ARIA attributes', () => {
    renderSearchBar({
      activeDescendantId: 'list-item-2',
    });
    const input = screen.getByRole('combobox');
    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(input).toHaveAttribute('aria-controls', 'command-list');
    expect(input).toHaveAttribute('aria-activedescendant', 'list-item-2');
    expect(input).toHaveAttribute('aria-label', 'Search commands');
  });

  it('marks the last breadcrumb as current', () => {
    renderSearchBar({
      breadcrumbs: [
        {
          label: 'Home',
          onBack: vi.fn(),
        },
        { label: 'Current' },
      ],
    });
    const current = screen.getByText('Current');
    expect(current).toHaveAttribute('aria-current', 'location');
  });

  it('renders search icon', () => {
    renderSearchBar({});
    const svg = document.querySelector('.search-bar__icon');
    expect(svg).toBeInTheDocument();
  });
});
