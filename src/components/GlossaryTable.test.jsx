import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GlossaryTable } from './GlossaryTable.jsx';

const mockTerms = [
  {
    id: 'term-1',
    name: 'Apple',
    scope: 'Global',
    translationDE: 'Apfel',
    translationES: 'Manzana',
    keepAsIs: false,
    notes: 'A fruit',
  },
  {
    id: 'term-2',
    name: 'Banana',
    scope: 'Project',
    translationDE: 'Banane',
    translationES: 'Plátano',
    keepAsIs: false,
    notes: 'Yellow fruit',
  },
  {
    id: 'term-3',
    name: 'Cherry',
    scope: 'Team',
    translationDE: 'Kirsche',
    translationES: 'Cereza',
    keepAsIs: true,
    notes: '',
  },
];

const defaultProps = {
  terms: mockTerms,
  sortColumn: 'name',
  sortDirection: 'asc',
  onSort: vi.fn(),
  onEdit: vi.fn(),
  onDelete: vi.fn(),
};

describe('GlossaryTable', () => {
  describe('rendering terms', () => {
    it('renders all provided terms in the table', () => {
      render(<GlossaryTable {...defaultProps} />);

      expect(screen.getByText('Apple')).toBeInTheDocument();
      expect(screen.getByText('Banana')).toBeInTheDocument();
      expect(screen.getByText('Cherry')).toBeInTheDocument();
    });

    it('renders term scopes as badges', () => {
      render(<GlossaryTable {...defaultProps} />);

      expect(screen.getByText('Global')).toBeInTheDocument();
      expect(screen.getByText('Project')).toBeInTheDocument();
      expect(screen.getByText('Team')).toBeInTheDocument();
    });

    it('renders German translations for each term', () => {
      render(<GlossaryTable {...defaultProps} />);

      expect(screen.getByText('Apfel')).toBeInTheDocument();
      expect(screen.getByText('Banane')).toBeInTheDocument();
      expect(screen.getByText('Kirsche')).toBeInTheDocument();
    });

    it('renders Spanish translations for each term', () => {
      render(<GlossaryTable {...defaultProps} />);

      expect(screen.getByText('Manzana')).toBeInTheDocument();
      expect(screen.getByText('Plátano')).toBeInTheDocument();
      expect(screen.getByText('Cereza')).toBeInTheDocument();
    });

    it('renders keepAsIs status correctly', () => {
      render(<GlossaryTable {...defaultProps} />);

      const yesElements = screen.getAllByText('Yes');
      const noElements = screen.getAllByText('No');

      expect(yesElements).toHaveLength(1);
      expect(noElements).toHaveLength(2);
    });

    it('renders notes for terms that have them', () => {
      render(<GlossaryTable {...defaultProps} />);

      expect(screen.getByText('A fruit')).toBeInTheDocument();
      expect(screen.getByText('Yellow fruit')).toBeInTheDocument();
    });

    it('renders dash for empty notes', () => {
      render(<GlossaryTable {...defaultProps} />);

      const table = screen.getByRole('table');
      const rows = within(table).getAllByRole('row');
      // Row 0 is header, row 3 is Cherry with empty notes
      const cherryRow = rows[3];
      const cells = within(cherryRow).getAllByRole('cell');
      // Notes is the 6th cell (index 5)
      expect(cells[5]).toHaveTextContent('—');
    });

    it('renders column headers', () => {
      render(<GlossaryTable {...defaultProps} />);

      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Scope')).toBeInTheDocument();
      expect(screen.getByText('Translation (DE)')).toBeInTheDocument();
      expect(screen.getByText('Translation (ES)')).toBeInTheDocument();
      expect(screen.getByText('Keep As Is')).toBeInTheDocument();
      expect(screen.getByText('Notes')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });

    it('renders a table element with role table', () => {
      render(<GlossaryTable {...defaultProps} />);

      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('renders the correct number of rows including header', () => {
      render(<GlossaryTable {...defaultProps} />);

      const table = screen.getByRole('table');
      const rows = within(table).getAllByRole('row');
      // 1 header row + 3 data rows
      expect(rows).toHaveLength(4);
    });

    it('renders dash for missing translations', () => {
      const termsWithMissing = [
        {
          id: 'term-missing',
          name: 'TestTerm',
          scope: 'Global',
          translationDE: '',
          translationES: '',
          keepAsIs: true,
          notes: '',
        },
      ];

      render(
        <GlossaryTable
          {...defaultProps}
          terms={termsWithMissing}
        />
      );

      const table = screen.getByRole('table');
      const rows = within(table).getAllByRole('row');
      const dataRow = rows[1];
      const cells = within(dataRow).getAllByRole('cell');
      // translationDE is cell index 2, translationES is cell index 3
      expect(cells[2]).toHaveTextContent('—');
      expect(cells[3]).toHaveTextContent('—');
    });
  });

  describe('empty state', () => {
    it('renders empty state message when terms array is empty', () => {
      render(<GlossaryTable {...defaultProps} terms={[]} />);

      expect(screen.getByText('No glossary terms found')).toBeInTheDocument();
      expect(
        screen.getByText('Add a new term or adjust your search criteria.')
      ).toBeInTheDocument();
    });

    it('does not render data rows when terms array is empty', () => {
      render(<GlossaryTable {...defaultProps} terms={[]} />);

      expect(screen.queryByText('Apple')).not.toBeInTheDocument();
      expect(screen.queryByText('Banana')).not.toBeInTheDocument();
    });

    it('still renders column headers when terms array is empty', () => {
      render(<GlossaryTable {...defaultProps} terms={[]} />);

      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Scope')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });
  });

  describe('sort header clicks', () => {
    it('calls onSort with column key when Name header is clicked', async () => {
      const onSort = vi.fn();
      const user = userEvent.setup();

      render(<GlossaryTable {...defaultProps} onSort={onSort} />);

      await user.click(screen.getByText('Name'));

      expect(onSort).toHaveBeenCalledTimes(1);
      expect(onSort).toHaveBeenCalledWith('name');
    });

    it('calls onSort with column key when Scope header is clicked', async () => {
      const onSort = vi.fn();
      const user = userEvent.setup();

      render(<GlossaryTable {...defaultProps} onSort={onSort} />);

      await user.click(screen.getByText('Scope'));

      expect(onSort).toHaveBeenCalledTimes(1);
      expect(onSort).toHaveBeenCalledWith('scope');
    });

    it('calls onSort with column key when Translation (DE) header is clicked', async () => {
      const onSort = vi.fn();
      const user = userEvent.setup();

      render(<GlossaryTable {...defaultProps} onSort={onSort} />);

      await user.click(screen.getByText('Translation (DE)'));

      expect(onSort).toHaveBeenCalledTimes(1);
      expect(onSort).toHaveBeenCalledWith('translationDE');
    });

    it('calls onSort with column key when Translation (ES) header is clicked', async () => {
      const onSort = vi.fn();
      const user = userEvent.setup();

      render(<GlossaryTable {...defaultProps} onSort={onSort} />);

      await user.click(screen.getByText('Translation (ES)'));

      expect(onSort).toHaveBeenCalledTimes(1);
      expect(onSort).toHaveBeenCalledWith('translationES');
    });

    it('calls onSort with column key when Keep As Is header is clicked', async () => {
      const onSort = vi.fn();
      const user = userEvent.setup();

      render(<GlossaryTable {...defaultProps} onSort={onSort} />);

      await user.click(screen.getByText('Keep As Is'));

      expect(onSort).toHaveBeenCalledTimes(1);
      expect(onSort).toHaveBeenCalledWith('keepAsIs');
    });

    it('calls onSort with column key when Notes header is clicked', async () => {
      const onSort = vi.fn();
      const user = userEvent.setup();

      render(<GlossaryTable {...defaultProps} onSort={onSort} />);

      await user.click(screen.getByText('Notes'));

      expect(onSort).toHaveBeenCalledTimes(1);
      expect(onSort).toHaveBeenCalledWith('notes');
    });

    it('calls onSort when header is activated via keyboard Enter', async () => {
      const onSort = vi.fn();
      const user = userEvent.setup();

      render(<GlossaryTable {...defaultProps} onSort={onSort} />);

      const nameHeader = screen.getByText('Name').closest('th');
      nameHeader.focus();
      await user.keyboard('{Enter}');

      expect(onSort).toHaveBeenCalledWith('name');
    });

    it('calls onSort when header is activated via keyboard Space', async () => {
      const onSort = vi.fn();
      const user = userEvent.setup();

      render(<GlossaryTable {...defaultProps} onSort={onSort} />);

      const scopeHeader = screen.getByText('Scope').closest('th');
      scopeHeader.focus();
      await user.keyboard(' ');

      expect(onSort).toHaveBeenCalledWith('scope');
    });

    it('displays ascending sort indicator on active sort column', () => {
      render(
        <GlossaryTable
          {...defaultProps}
          sortColumn="name"
          sortDirection="asc"
        />
      );

      const nameHeader = screen.getByText('Name').closest('th');
      expect(nameHeader).toHaveAttribute('aria-sort', 'ascending');
    });

    it('displays descending sort indicator on active sort column', () => {
      render(
        <GlossaryTable
          {...defaultProps}
          sortColumn="name"
          sortDirection="desc"
        />
      );

      const nameHeader = screen.getByText('Name').closest('th');
      expect(nameHeader).toHaveAttribute('aria-sort', 'descending');
    });

    it('displays none sort indicator on inactive sort columns', () => {
      render(
        <GlossaryTable
          {...defaultProps}
          sortColumn="name"
          sortDirection="asc"
        />
      );

      const scopeHeader = screen.getByText('Scope').closest('th');
      expect(scopeHeader).toHaveAttribute('aria-sort', 'none');
    });
  });

  describe('edit button interactions', () => {
    it('calls onEdit with the correct term when Edit button is clicked', async () => {
      const onEdit = vi.fn();
      const user = userEvent.setup();

      render(<GlossaryTable {...defaultProps} onEdit={onEdit} />);

      const editButtons = screen.getAllByRole('button', { name: /edit term/i });
      await user.click(editButtons[0]);

      expect(onEdit).toHaveBeenCalledTimes(1);
      expect(onEdit).toHaveBeenCalledWith(mockTerms[0]);
    });

    it('calls onEdit with the second term when its Edit button is clicked', async () => {
      const onEdit = vi.fn();
      const user = userEvent.setup();

      render(<GlossaryTable {...defaultProps} onEdit={onEdit} />);

      const editButtons = screen.getAllByRole('button', { name: /edit term/i });
      await user.click(editButtons[1]);

      expect(onEdit).toHaveBeenCalledTimes(1);
      expect(onEdit).toHaveBeenCalledWith(mockTerms[1]);
    });

    it('renders an Edit button for each term', () => {
      render(<GlossaryTable {...defaultProps} />);

      const editButtons = screen.getAllByRole('button', { name: /edit term/i });
      expect(editButtons).toHaveLength(3);
    });

    it('has accessible label on Edit buttons', () => {
      render(<GlossaryTable {...defaultProps} />);

      expect(
        screen.getByRole('button', { name: 'Edit term Apple' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Edit term Banana' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Edit term Cherry' })
      ).toBeInTheDocument();
    });
  });

  describe('delete button interactions', () => {
    it('calls onDelete with the correct term when Delete button is clicked', async () => {
      const onDelete = vi.fn();
      const user = userEvent.setup();

      render(<GlossaryTable {...defaultProps} onDelete={onDelete} />);

      const deleteButtons = screen.getAllByRole('button', { name: /delete term/i });
      await user.click(deleteButtons[0]);

      expect(onDelete).toHaveBeenCalledTimes(1);
      expect(onDelete).toHaveBeenCalledWith(mockTerms[0]);
    });

    it('calls onDelete with the third term when its Delete button is clicked', async () => {
      const onDelete = vi.fn();
      const user = userEvent.setup();

      render(<GlossaryTable {...defaultProps} onDelete={onDelete} />);

      const deleteButtons = screen.getAllByRole('button', { name: /delete term/i });
      await user.click(deleteButtons[2]);

      expect(onDelete).toHaveBeenCalledTimes(1);
      expect(onDelete).toHaveBeenCalledWith(mockTerms[2]);
    });

    it('renders a Delete button for each term', () => {
      render(<GlossaryTable {...defaultProps} />);

      const deleteButtons = screen.getAllByRole('button', { name: /delete term/i });
      expect(deleteButtons).toHaveLength(3);
    });

    it('has accessible label on Delete buttons', () => {
      render(<GlossaryTable {...defaultProps} />);

      expect(
        screen.getByRole('button', { name: 'Delete term Apple' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Delete term Banana' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Delete term Cherry' })
      ).toBeInTheDocument();
    });
  });

  describe('interaction isolation', () => {
    it('does not call onDelete when Edit button is clicked', async () => {
      const onEdit = vi.fn();
      const onDelete = vi.fn();
      const user = userEvent.setup();

      render(
        <GlossaryTable {...defaultProps} onEdit={onEdit} onDelete={onDelete} />
      );

      const editButtons = screen.getAllByRole('button', { name: /edit term/i });
      await user.click(editButtons[0]);

      expect(onEdit).toHaveBeenCalledTimes(1);
      expect(onDelete).not.toHaveBeenCalled();
    });

    it('does not call onEdit when Delete button is clicked', async () => {
      const onEdit = vi.fn();
      const onDelete = vi.fn();
      const user = userEvent.setup();

      render(
        <GlossaryTable {...defaultProps} onEdit={onEdit} onDelete={onDelete} />
      );

      const deleteButtons = screen.getAllByRole('button', { name: /delete term/i });
      await user.click(deleteButtons[0]);

      expect(onDelete).toHaveBeenCalledTimes(1);
      expect(onEdit).not.toHaveBeenCalled();
    });
  });
});