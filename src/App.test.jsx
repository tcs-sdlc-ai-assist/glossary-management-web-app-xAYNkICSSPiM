import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App.jsx';
import { _resetForTesting, loadFromLocalStorage, addTerm } from './services/glossaryRepository.js';

describe('App', () => {
  beforeEach(() => {
    _resetForTesting();
    localStorage.clear();
    loadFromLocalStorage();
  });

  afterEach(() => {
    _resetForTesting();
    localStorage.clear();
  });

  describe('rendering', () => {
    it('renders the application header', async () => {
      render(<App />);

      expect(screen.getByText('Glossary Management')).toBeInTheDocument();
      expect(screen.getByText('Manage your glossary terms, translations, and definitions.')).toBeInTheDocument();
    });

    it('renders the Add Term button', async () => {
      render(<App />);

      expect(screen.getByRole('button', { name: /add term/i })).toBeInTheDocument();
    });

    it('renders the Import button', async () => {
      render(<App />);

      expect(screen.getByRole('button', { name: /import/i })).toBeInTheDocument();
    });

    it('renders the Export button', async () => {
      render(<App />);

      expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
    });

    it('renders the search bar', async () => {
      render(<App />);

      expect(screen.getByLabelText('Search glossary terms')).toBeInTheDocument();
    });

    it('renders the glossary table', async () => {
      render(<App />);

      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('renders empty state when no terms exist', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('No glossary terms found')).toBeInTheDocument();
      });
    });
  });

  describe('adding a term', () => {
    it('opens the add term modal when Add Term button is clicked', async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByRole('button', { name: /add term/i }));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
      expect(screen.getByText('Add New Term')).toBeInTheDocument();
    });

    it('adds a new term and displays it in the table', async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByRole('button', { name: /add term/i }));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const nameInput = screen.getByLabelText(/Name/);
      await user.type(nameInput, 'TestTerm');

      const scopeSelect = screen.getByLabelText(/Scope/);
      await user.selectOptions(scopeSelect, 'Global');

      const deInput = screen.getByLabelText(/Translation \(DE\)/);
      await user.type(deInput, 'TestDE');

      const esInput = screen.getByLabelText(/Translation \(ES\)/);
      await user.type(esInput, 'TestES');

      await user.click(screen.getByRole('button', { name: 'Add' }));

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText('TestTerm')).toBeInTheDocument();
      });

      expect(screen.getByText('TestDE')).toBeInTheDocument();
      expect(screen.getByText('TestES')).toBeInTheDocument();
    });

    it('shows a success notification after adding a term', async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByRole('button', { name: /add term/i }));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      await user.type(screen.getByLabelText(/Name/), 'NotifyTerm');
      await user.selectOptions(screen.getByLabelText(/Scope/), 'Global');
      await user.type(screen.getByLabelText(/Translation \(DE\)/), 'DE');

      await user.click(screen.getByRole('button', { name: 'Add' }));

      await waitFor(() => {
        expect(screen.getByText(/added successfully/i)).toBeInTheDocument();
      });
    });

    it('shows validation errors when submitting empty form', async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByRole('button', { name: /add term/i }));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Add' }));

      expect(screen.getByText('Name is required')).toBeInTheDocument();
      expect(screen.getByText('Scope is required')).toBeInTheDocument();
    });

    it('closes the add modal when Cancel is clicked', async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByRole('button', { name: /add term/i }));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Cancel' }));

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('editing a term', () => {
    beforeEach(() => {
      addTerm({
        name: 'EditMe',
        scope: 'Global',
        translationDE: 'BearbeiteMich',
        translationES: 'EditarMe',
        keepAsIs: false,
        notes: 'Original note',
      });
    });

    it('opens the edit modal with pre-populated data', async () => {
      const user = userEvent.setup();
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('EditMe')).toBeInTheDocument();
      });

      const editButton = screen.getByRole('button', { name: /edit term editme/i });
      await user.click(editButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      expect(screen.getByText('Edit Term')).toBeInTheDocument();
      expect(screen.getByLabelText(/Name/)).toHaveValue('EditMe');
      expect(screen.getByLabelText(/Scope/)).toHaveValue('Global');
      expect(screen.getByLabelText(/Translation \(DE\)/)).toHaveValue('BearbeiteMich');
      expect(screen.getByLabelText(/Translation \(ES\)/)).toHaveValue('EditarMe');
    });

    it('updates a term and displays the updated data', async () => {
      const user = userEvent.setup();
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('EditMe')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /edit term editme/i }));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const nameInput = screen.getByLabelText(/Name/);
      await user.clear(nameInput);
      await user.type(nameInput, 'UpdatedTerm');

      await user.click(screen.getByRole('button', { name: 'Update' }));

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText('UpdatedTerm')).toBeInTheDocument();
      });

      expect(screen.queryByText('EditMe')).not.toBeInTheDocument();
    });

    it('shows a success notification after editing a term', async () => {
      const user = userEvent.setup();
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('EditMe')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /edit term editme/i }));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const notesInput = screen.getByLabelText(/Notes/);
      await user.clear(notesInput);
      await user.type(notesInput, 'Updated note');

      await user.click(screen.getByRole('button', { name: 'Update' }));

      await waitFor(() => {
        expect(screen.getByText(/updated successfully/i)).toBeInTheDocument();
      });
    });
  });

  describe('deleting a term', () => {
    beforeEach(() => {
      addTerm({
        name: 'DeleteMe',
        scope: 'Project',
        translationDE: 'LöschMich',
        translationES: '',
        keepAsIs: false,
        notes: '',
      });
    });

    it('opens the delete confirmation modal', async () => {
      const user = userEvent.setup();
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('DeleteMe')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /delete term deleteme/i }));

      await waitFor(() => {
        expect(screen.getByText('Delete Term')).toBeInTheDocument();
      });

      expect(screen.getByText(/are you sure you want to delete/i)).toBeInTheDocument();
      expect(screen.getByText('"DeleteMe"')).toBeInTheDocument();
    });

    it('deletes the term when confirmed', async () => {
      const user = userEvent.setup();
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('DeleteMe')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /delete term deleteme/i }));

      await waitFor(() => {
        expect(screen.getByText('Delete Term')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Delete' }));

      await waitFor(() => {
        expect(screen.queryByText('DeleteMe')).not.toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText('No glossary terms found')).toBeInTheDocument();
      });
    });

    it('shows a success notification after deleting a term', async () => {
      const user = userEvent.setup();
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('DeleteMe')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /delete term deleteme/i }));

      await waitFor(() => {
        expect(screen.getByText('Delete Term')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Delete' }));

      await waitFor(() => {
        expect(screen.getByText(/deleted successfully/i)).toBeInTheDocument();
      });
    });

    it('cancels deletion and keeps the term', async () => {
      const user = userEvent.setup();
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('DeleteMe')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /delete term deleteme/i }));

      await waitFor(() => {
        expect(screen.getByText('Delete Term')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Cancel' }));

      await waitFor(() => {
        expect(screen.queryByText('Delete Term')).not.toBeInTheDocument();
      });

      expect(screen.getByText('DeleteMe')).toBeInTheDocument();
    });
  });

  describe('searching terms', () => {
    beforeEach(() => {
      addTerm({
        name: 'Apple',
        scope: 'Global',
        translationDE: 'Apfel',
        translationES: 'Manzana',
        keepAsIs: false,
        notes: 'A fruit',
      });
      addTerm({
        name: 'Banana',
        scope: 'Project',
        translationDE: 'Banane',
        translationES: 'Plátano',
        keepAsIs: false,
        notes: 'Yellow fruit',
      });
      addTerm({
        name: 'Cherry',
        scope: 'Team',
        translationDE: 'Kirsche',
        translationES: 'Cereza',
        keepAsIs: true,
        notes: '',
      });
    });

    it('filters terms based on search query', async () => {
      const user = userEvent.setup();
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Apple')).toBeInTheDocument();
        expect(screen.getByText('Banana')).toBeInTheDocument();
        expect(screen.getByText('Cherry')).toBeInTheDocument();
      });

      const searchInput = screen.getByLabelText('Search glossary terms');
      await user.type(searchInput, 'Apple');

      await waitFor(() => {
        expect(screen.getByText('Apple')).toBeInTheDocument();
        expect(screen.queryByText('Banana')).not.toBeInTheDocument();
        expect(screen.queryByText('Cherry')).not.toBeInTheDocument();
      });
    });

    it('shows all terms when search is cleared', async () => {
      const user = userEvent.setup();
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Apple')).toBeInTheDocument();
      });

      const searchInput = screen.getByLabelText('Search glossary terms');
      await user.type(searchInput, 'Apple');

      await waitFor(() => {
        expect(screen.queryByText('Banana')).not.toBeInTheDocument();
      });

      await user.clear(searchInput);

      await waitFor(() => {
        expect(screen.getByText('Apple')).toBeInTheDocument();
        expect(screen.getByText('Banana')).toBeInTheDocument();
        expect(screen.getByText('Cherry')).toBeInTheDocument();
      });
    });

    it('shows empty state when search has no results', async () => {
      const user = userEvent.setup();
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Apple')).toBeInTheDocument();
      });

      const searchInput = screen.getByLabelText('Search glossary terms');
      await user.type(searchInput, 'zzzznonexistent');

      await waitFor(() => {
        expect(screen.getByText('No glossary terms found')).toBeInTheDocument();
      });
    });

    it('clears search when clear button is clicked', async () => {
      const user = userEvent.setup();
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Apple')).toBeInTheDocument();
      });

      const searchInput = screen.getByLabelText('Search glossary terms');
      await user.type(searchInput, 'Apple');

      await waitFor(() => {
        expect(screen.queryByText('Banana')).not.toBeInTheDocument();
      });

      const clearButton = screen.getByRole('button', { name: 'Clear search' });
      await user.click(clearButton);

      await waitFor(() => {
        expect(screen.getByText('Apple')).toBeInTheDocument();
        expect(screen.getByText('Banana')).toBeInTheDocument();
        expect(screen.getByText('Cherry')).toBeInTheDocument();
      });
    });
  });

  describe('sorting terms', () => {
    beforeEach(() => {
      addTerm({
        name: 'Cherry',
        scope: 'Team',
        translationDE: 'Kirsche',
        translationES: 'Cereza',
        keepAsIs: true,
        notes: '',
      });
      addTerm({
        name: 'Apple',
        scope: 'Global',
        translationDE: 'Apfel',
        translationES: 'Manzana',
        keepAsIs: false,
        notes: 'A fruit',
      });
      addTerm({
        name: 'Banana',
        scope: 'Project',
        translationDE: 'Banane',
        translationES: 'Plátano',
        keepAsIs: false,
        notes: 'Yellow fruit',
      });
    });

    it('sorts terms by name ascending by default', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Apple')).toBeInTheDocument();
      });

      const table = screen.getByRole('table');
      const rows = within(table).getAllByRole('row');
      // Row 0 is header, rows 1-3 are data
      const firstDataRow = rows[1];
      expect(within(firstDataRow).getByText('Apple')).toBeInTheDocument();
    });

    it('toggles sort direction when clicking the same column header', async () => {
      const user = userEvent.setup();
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Apple')).toBeInTheDocument();
      });

      // Click Name header to toggle to descending
      await user.click(screen.getByText('Name'));

      await waitFor(() => {
        const table = screen.getByRole('table');
        const rows = within(table).getAllByRole('row');
        const firstDataRow = rows[1];
        expect(within(firstDataRow).getByText('Cherry')).toBeInTheDocument();
      });
    });

    it('sorts by a different column when clicking its header', async () => {
      const user = userEvent.setup();
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Apple')).toBeInTheDocument();
      });

      // Click Scope header to sort by scope ascending
      await user.click(screen.getByText('Scope'));

      await waitFor(() => {
        const table = screen.getByRole('table');
        const rows = within(table).getAllByRole('row');
        const firstDataRow = rows[1];
        expect(within(firstDataRow).getByText('Global')).toBeInTheDocument();
      });
    });

    it('updates aria-sort attribute on sorted column', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Apple')).toBeInTheDocument();
      });

      const nameHeader = screen.getByText('Name').closest('th');
      expect(nameHeader).toHaveAttribute('aria-sort', 'ascending');

      const scopeHeader = screen.getByText('Scope').closest('th');
      expect(scopeHeader).toHaveAttribute('aria-sort', 'none');
    });
  });

  describe('pagination', () => {
    beforeEach(() => {
      // Add 15 terms to trigger pagination (PAGE_SIZE = 10)
      for (let i = 0; i < 15; i++) {
        addTerm({
          name: `Term${String(i).padStart(2, '0')}`,
          scope: 'Global',
          translationDE: `DE${i}`,
          translationES: '',
          keepAsIs: false,
          notes: '',
        });
      }
    });

    it('displays pagination controls', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument();
      });
    });

    it('shows correct page info', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText(/Page/)).toBeInTheDocument();
        expect(screen.getByText('15')).toBeInTheDocument();
      });
    });

    it('navigates to the next page', async () => {
      const user = userEvent.setup();
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Term00')).toBeInTheDocument();
      });

      const nextButton = screen.getByRole('button', { name: /next page/i });
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('Term10')).toBeInTheDocument();
      });

      expect(screen.queryByText('Term00')).not.toBeInTheDocument();
    });

    it('navigates back to the previous page', async () => {
      const user = userEvent.setup();
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Term00')).toBeInTheDocument();
      });

      const nextButton = screen.getByRole('button', { name: /next page/i });
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('Term10')).toBeInTheDocument();
      });

      const prevButton = screen.getByRole('button', { name: /previous page/i });
      await user.click(prevButton);

      await waitFor(() => {
        expect(screen.getByText('Term00')).toBeInTheDocument();
      });
    });

    it('disables previous button on first page', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Term00')).toBeInTheDocument();
      });

      const prevButton = screen.getByRole('button', { name: /previous page/i });
      expect(prevButton).toBeDisabled();
    });

    it('disables next button on last page', async () => {
      const user = userEvent.setup();
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Term00')).toBeInTheDocument();
      });

      const nextButton = screen.getByRole('button', { name: /next page/i });
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('Term10')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(nextButton).toBeDisabled();
      });
    });
  });

  describe('import modal', () => {
    it('opens the import modal when Import button is clicked', async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByRole('button', { name: /import/i }));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      expect(screen.getByText('Import Glossary Terms')).toBeInTheDocument();
    });

    it('closes the import modal when Cancel is clicked', async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByRole('button', { name: /import/i }));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Cancel' }));

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('shows the file upload zone in the import modal', async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByRole('button', { name: /import/i }));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      expect(screen.getByText(/drag & drop a file here/i)).toBeInTheDocument();
      expect(screen.getByText(/supported formats/i)).toBeInTheDocument();
    });
  });

  describe('export', () => {
    beforeEach(() => {
      addTerm({
        name: 'ExportTerm',
        scope: 'Global',
        translationDE: 'ExportDE',
        translationES: 'ExportES',
        keepAsIs: false,
        notes: 'Export note',
      });
    });

    it('triggers export and shows success notification', async () => {
      const user = userEvent.setup();

      // Mock URL.createObjectURL and URL.revokeObjectURL
      const createObjectURLMock = vi.fn(() => 'blob:mock-url');
      const revokeObjectURLMock = vi.fn();
      global.URL.createObjectURL = createObjectURLMock;
      global.URL.revokeObjectURL = revokeObjectURLMock;

      // Mock link click
      const clickMock = vi.fn();
      const appendChildMock = vi.spyOn(document.body, 'appendChild').mockImplementation((el) => {
        if (el.tagName === 'A') {
          el.click = clickMock;
        }
        return el;
      });
      const removeChildMock = vi.spyOn(document.body, 'removeChild').mockImplementation(() => {});

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('ExportTerm')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /export/i }));

      await waitFor(() => {
        expect(screen.getByText(/exported successfully/i)).toBeInTheDocument();
      });

      appendChildMock.mockRestore();
      removeChildMock.mockRestore();
    });
  });

  describe('notification display', () => {
    it('displays notification with dismiss button', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Trigger a notification by adding a term
      await user.click(screen.getByRole('button', { name: /add term/i }));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      await user.type(screen.getByLabelText(/Name/), 'NotifyTest');
      await user.selectOptions(screen.getByLabelText(/Scope/), 'Global');
      await user.type(screen.getByLabelText(/Translation \(DE\)/), 'DE');

      await user.click(screen.getByRole('button', { name: 'Add' }));

      await waitFor(() => {
        expect(screen.getByText(/added successfully/i)).toBeInTheDocument();
      });

      const dismissButton = screen.getByRole('button', { name: /dismiss notification/i });
      expect(dismissButton).toBeInTheDocument();

      await user.click(dismissButton);

      await waitFor(() => {
        expect(screen.queryByText(/added successfully/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('full CRUD flow', () => {
    it('performs add, edit, and delete lifecycle', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Add a term
      await user.click(screen.getByRole('button', { name: /add term/i }));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      await user.type(screen.getByLabelText(/Name/), 'LifecycleTerm');
      await user.selectOptions(screen.getByLabelText(/Scope/), 'Project');
      await user.type(screen.getByLabelText(/Translation \(DE\)/), 'LebenDE');
      await user.type(screen.getByLabelText(/Translation \(ES\)/), 'VidaES');

      await user.click(screen.getByRole('button', { name: 'Add' }));

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText('LifecycleTerm')).toBeInTheDocument();
      });

      // Dismiss notification if present
      const dismissButtons = screen.queryAllByRole('button', { name: /dismiss notification/i });
      if (dismissButtons.length > 0) {
        await user.click(dismissButtons[0]);
      }

      // Edit the term
      await user.click(screen.getByRole('button', { name: /edit term lifecycleterm/i }));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const nameInput = screen.getByLabelText(/Name/);
      await user.clear(nameInput);
      await user.type(nameInput, 'UpdatedLifecycle');

      await user.click(screen.getByRole('button', { name: 'Update' }));

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText('UpdatedLifecycle')).toBeInTheDocument();
      });

      expect(screen.queryByText('LifecycleTerm')).not.toBeInTheDocument();

      // Dismiss notification if present
      const dismissButtons2 = screen.queryAllByRole('button', { name: /dismiss notification/i });
      if (dismissButtons2.length > 0) {
        await user.click(dismissButtons2[0]);
      }

      // Delete the term
      await user.click(screen.getByRole('button', { name: /delete term updatedlifecycle/i }));

      await waitFor(() => {
        expect(screen.getByText('Delete Term')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Delete' }));

      await waitFor(() => {
        expect(screen.queryByText('UpdatedLifecycle')).not.toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText('No glossary terms found')).toBeInTheDocument();
      });
    });
  });
});