import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TermModal } from './TermModal.jsx';

const existingTerms = [
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
];

const defaultProps = {
  isOpen: true,
  term: null,
  existingTerms,
  onSave: vi.fn(),
  onClose: vi.fn(),
};

describe('TermModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders nothing when isOpen is false', () => {
      render(<TermModal {...defaultProps} isOpen={false} />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders the modal when isOpen is true', () => {
      render(<TermModal {...defaultProps} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('renders "Add New Term" title in add mode', () => {
      render(<TermModal {...defaultProps} />);

      expect(screen.getByText('Add New Term')).toBeInTheDocument();
    });

    it('renders "Edit Term" title in edit mode', () => {
      render(<TermModal {...defaultProps} term={existingTerms[0]} />);

      expect(screen.getByText('Edit Term')).toBeInTheDocument();
    });

    it('renders all form fields', () => {
      render(<TermModal {...defaultProps} />);

      expect(screen.getByLabelText(/Name/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Scope/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Translation \(DE\)/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Translation \(ES\)/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Keep As Is/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Notes/)).toBeInTheDocument();
    });

    it('renders Add button in add mode', () => {
      render(<TermModal {...defaultProps} />);

      expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
    });

    it('renders Update button in edit mode', () => {
      render(<TermModal {...defaultProps} term={existingTerms[0]} />);

      expect(screen.getByRole('button', { name: 'Update' })).toBeInTheDocument();
    });

    it('renders Cancel button', () => {
      render(<TermModal {...defaultProps} />);

      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    it('renders Close modal button', () => {
      render(<TermModal {...defaultProps} />);

      expect(screen.getByRole('button', { name: 'Close modal' })).toBeInTheDocument();
    });

    it('renders scope dropdown with all options', () => {
      render(<TermModal {...defaultProps} />);

      const scopeSelect = screen.getByLabelText(/Scope/);
      expect(scopeSelect).toBeInTheDocument();

      const options = within(scopeSelect).getAllByRole('option');
      expect(options).toHaveLength(5); // "Select scope" + 4 scope options
      expect(within(scopeSelect).getByText('Select scope')).toBeInTheDocument();
      expect(within(scopeSelect).getByText('Global')).toBeInTheDocument();
      expect(within(scopeSelect).getByText('Project')).toBeInTheDocument();
      expect(within(scopeSelect).getByText('Team')).toBeInTheDocument();
      expect(within(scopeSelect).getByText('Personal')).toBeInTheDocument();
    });
  });

  describe('add mode - empty form', () => {
    it('renders empty name field', () => {
      render(<TermModal {...defaultProps} />);

      expect(screen.getByLabelText(/Name/)).toHaveValue('');
    });

    it('renders empty scope field', () => {
      render(<TermModal {...defaultProps} />);

      expect(screen.getByLabelText(/Scope/)).toHaveValue('');
    });

    it('renders empty translation DE field', () => {
      render(<TermModal {...defaultProps} />);

      expect(screen.getByLabelText(/Translation \(DE\)/)).toHaveValue('');
    });

    it('renders empty translation ES field', () => {
      render(<TermModal {...defaultProps} />);

      expect(screen.getByLabelText(/Translation \(ES\)/)).toHaveValue('');
    });

    it('renders unchecked keepAsIs checkbox', () => {
      render(<TermModal {...defaultProps} />);

      expect(screen.getByLabelText(/Keep As Is/)).not.toBeChecked();
    });

    it('renders empty notes field', () => {
      render(<TermModal {...defaultProps} />);

      expect(screen.getByLabelText(/Notes/)).toHaveValue('');
    });
  });

  describe('edit mode - pre-population', () => {
    it('pre-populates name field with term name', () => {
      render(<TermModal {...defaultProps} term={existingTerms[0]} />);

      expect(screen.getByLabelText(/Name/)).toHaveValue('Apple');
    });

    it('pre-populates scope field with term scope', () => {
      render(<TermModal {...defaultProps} term={existingTerms[0]} />);

      expect(screen.getByLabelText(/Scope/)).toHaveValue('Global');
    });

    it('pre-populates translation DE field', () => {
      render(<TermModal {...defaultProps} term={existingTerms[0]} />);

      expect(screen.getByLabelText(/Translation \(DE\)/)).toHaveValue('Apfel');
    });

    it('pre-populates translation ES field', () => {
      render(<TermModal {...defaultProps} term={existingTerms[0]} />);

      expect(screen.getByLabelText(/Translation \(ES\)/)).toHaveValue('Manzana');
    });

    it('pre-populates keepAsIs checkbox', () => {
      const termWithKeepAsIs = {
        ...existingTerms[0],
        keepAsIs: true,
      };
      render(<TermModal {...defaultProps} term={termWithKeepAsIs} />);

      expect(screen.getByLabelText(/Keep As Is/)).toBeChecked();
    });

    it('pre-populates notes field', () => {
      render(<TermModal {...defaultProps} term={existingTerms[0]} />);

      expect(screen.getByLabelText(/Notes/)).toHaveValue('A fruit');
    });
  });

  describe('required field validation', () => {
    it('shows error when name is empty on submit', async () => {
      const user = userEvent.setup();
      render(<TermModal {...defaultProps} />);

      const scopeSelect = screen.getByLabelText(/Scope/);
      await user.selectOptions(scopeSelect, 'Global');

      const deInput = screen.getByLabelText(/Translation \(DE\)/);
      await user.type(deInput, 'SomeTranslation');

      await user.click(screen.getByRole('button', { name: 'Add' }));

      expect(screen.getByText('Name is required')).toBeInTheDocument();
      expect(defaultProps.onSave).not.toHaveBeenCalled();
    });

    it('shows error when scope is empty on submit', async () => {
      const user = userEvent.setup();
      render(<TermModal {...defaultProps} />);

      const nameInput = screen.getByLabelText(/Name/);
      await user.type(nameInput, 'NewTerm');

      const deInput = screen.getByLabelText(/Translation \(DE\)/);
      await user.type(deInput, 'SomeTranslation');

      await user.click(screen.getByRole('button', { name: 'Add' }));

      expect(screen.getByText('Scope is required')).toBeInTheDocument();
      expect(defaultProps.onSave).not.toHaveBeenCalled();
    });

    it('shows error when no translation and keepAsIs is false', async () => {
      const user = userEvent.setup();
      render(<TermModal {...defaultProps} />);

      const nameInput = screen.getByLabelText(/Name/);
      await user.type(nameInput, 'NewTerm');

      const scopeSelect = screen.getByLabelText(/Scope/);
      await user.selectOptions(scopeSelect, 'Global');

      await user.click(screen.getByRole('button', { name: 'Add' }));

      expect(screen.getByText(/At least one translation/)).toBeInTheDocument();
      expect(defaultProps.onSave).not.toHaveBeenCalled();
    });

    it('shows multiple errors when multiple fields are invalid', async () => {
      const user = userEvent.setup();
      render(<TermModal {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: 'Add' }));

      expect(screen.getByText('Name is required')).toBeInTheDocument();
      expect(screen.getByText('Scope is required')).toBeInTheDocument();
      expect(defaultProps.onSave).not.toHaveBeenCalled();
    });

    it('clears name error when user types in name field', async () => {
      const user = userEvent.setup();
      render(<TermModal {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: 'Add' }));

      expect(screen.getByText('Name is required')).toBeInTheDocument();

      const nameInput = screen.getByLabelText(/Name/);
      await user.type(nameInput, 'N');

      expect(screen.queryByText('Name is required')).not.toBeInTheDocument();
    });

    it('clears scope error when user selects a scope', async () => {
      const user = userEvent.setup();
      render(<TermModal {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: 'Add' }));

      expect(screen.getByText('Scope is required')).toBeInTheDocument();

      const scopeSelect = screen.getByLabelText(/Scope/);
      await user.selectOptions(scopeSelect, 'Global');

      expect(screen.queryByText('Scope is required')).not.toBeInTheDocument();
    });
  });

  describe('duplicate name validation', () => {
    it('shows error when name duplicates an existing term', async () => {
      const user = userEvent.setup();
      render(<TermModal {...defaultProps} />);

      const nameInput = screen.getByLabelText(/Name/);
      await user.type(nameInput, 'Apple');

      const scopeSelect = screen.getByLabelText(/Scope/);
      await user.selectOptions(scopeSelect, 'Global');

      const deInput = screen.getByLabelText(/Translation \(DE\)/);
      await user.type(deInput, 'SomeTranslation');

      await user.click(screen.getByRole('button', { name: 'Add' }));

      expect(screen.getByText('A term with this name already exists')).toBeInTheDocument();
      expect(defaultProps.onSave).not.toHaveBeenCalled();
    });

    it('shows error for case-insensitive duplicate name', async () => {
      const user = userEvent.setup();
      render(<TermModal {...defaultProps} />);

      const nameInput = screen.getByLabelText(/Name/);
      await user.type(nameInput, 'apple');

      const scopeSelect = screen.getByLabelText(/Scope/);
      await user.selectOptions(scopeSelect, 'Global');

      const deInput = screen.getByLabelText(/Translation \(DE\)/);
      await user.type(deInput, 'SomeTranslation');

      await user.click(screen.getByRole('button', { name: 'Add' }));

      expect(screen.getByText('A term with this name already exists')).toBeInTheDocument();
      expect(defaultProps.onSave).not.toHaveBeenCalled();
    });

    it('allows editing a term to keep its own name', async () => {
      const onSave = vi.fn();
      const user = userEvent.setup();
      render(<TermModal {...defaultProps} term={existingTerms[0]} onSave={onSave} />);

      const notesInput = screen.getByLabelText(/Notes/);
      await user.clear(notesInput);
      await user.type(notesInput, 'Updated notes');

      await user.click(screen.getByRole('button', { name: 'Update' }));

      expect(screen.queryByText('A term with this name already exists')).not.toBeInTheDocument();
      expect(onSave).toHaveBeenCalledTimes(1);
    });

    it('shows error when editing a term to a name that already exists', async () => {
      const onSave = vi.fn();
      const user = userEvent.setup();
      render(<TermModal {...defaultProps} term={existingTerms[0]} onSave={onSave} />);

      const nameInput = screen.getByLabelText(/Name/);
      await user.clear(nameInput);
      await user.type(nameInput, 'Banana');

      await user.click(screen.getByRole('button', { name: 'Update' }));

      expect(screen.getByText('A term with this name already exists')).toBeInTheDocument();
      expect(onSave).not.toHaveBeenCalled();
    });
  });

  describe('successful submission', () => {
    it('calls onSave with correct data when adding a new term', async () => {
      const onSave = vi.fn();
      const user = userEvent.setup();
      render(<TermModal {...defaultProps} onSave={onSave} />);

      const nameInput = screen.getByLabelText(/Name/);
      await user.type(nameInput, 'Cherry');

      const scopeSelect = screen.getByLabelText(/Scope/);
      await user.selectOptions(scopeSelect, 'Team');

      const deInput = screen.getByLabelText(/Translation \(DE\)/);
      await user.type(deInput, 'Kirsche');

      const esInput = screen.getByLabelText(/Translation \(ES\)/);
      await user.type(esInput, 'Cereza');

      const notesInput = screen.getByLabelText(/Notes/);
      await user.type(notesInput, 'A red fruit');

      await user.click(screen.getByRole('button', { name: 'Add' }));

      expect(onSave).toHaveBeenCalledTimes(1);
      expect(onSave).toHaveBeenCalledWith({
        name: 'Cherry',
        scope: 'Team',
        translationDE: 'Kirsche',
        translationES: 'Cereza',
        keepAsIs: false,
        notes: 'A red fruit',
      });
    });

    it('calls onSave with correct data when keepAsIs is checked and no translations', async () => {
      const onSave = vi.fn();
      const user = userEvent.setup();
      render(<TermModal {...defaultProps} onSave={onSave} />);

      const nameInput = screen.getByLabelText(/Name/);
      await user.type(nameInput, 'Cherry');

      const scopeSelect = screen.getByLabelText(/Scope/);
      await user.selectOptions(scopeSelect, 'Personal');

      const keepAsIsCheckbox = screen.getByLabelText(/Keep As Is/);
      await user.click(keepAsIsCheckbox);

      await user.click(screen.getByRole('button', { name: 'Add' }));

      expect(onSave).toHaveBeenCalledTimes(1);
      expect(onSave).toHaveBeenCalledWith({
        name: 'Cherry',
        scope: 'Personal',
        translationDE: '',
        translationES: '',
        keepAsIs: true,
        notes: '',
      });
    });

    it('calls onSave with updated data in edit mode', async () => {
      const onSave = vi.fn();
      const user = userEvent.setup();
      render(<TermModal {...defaultProps} term={existingTerms[0]} onSave={onSave} />);

      const nameInput = screen.getByLabelText(/Name/);
      await user.clear(nameInput);
      await user.type(nameInput, 'Apricot');

      const deInput = screen.getByLabelText(/Translation \(DE\)/);
      await user.clear(deInput);
      await user.type(deInput, 'Aprikose');

      await user.click(screen.getByRole('button', { name: 'Update' }));

      expect(onSave).toHaveBeenCalledTimes(1);
      expect(onSave).toHaveBeenCalledWith({
        name: 'Apricot',
        scope: 'Global',
        translationDE: 'Aprikose',
        translationES: 'Manzana',
        keepAsIs: false,
        notes: 'A fruit',
      });
    });

    it('trims whitespace from text fields on submit', async () => {
      const onSave = vi.fn();
      const user = userEvent.setup();
      render(<TermModal {...defaultProps} onSave={onSave} />);

      const nameInput = screen.getByLabelText(/Name/);
      await user.type(nameInput, '  Cherry  ');

      const scopeSelect = screen.getByLabelText(/Scope/);
      await user.selectOptions(scopeSelect, 'Global');

      const deInput = screen.getByLabelText(/Translation \(DE\)/);
      await user.type(deInput, '  Kirsche  ');

      await user.click(screen.getByRole('button', { name: 'Add' }));

      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Cherry',
          translationDE: 'Kirsche',
        })
      );
    });
  });

  describe('cancel behavior', () => {
    it('calls onClose when Cancel button is clicked', async () => {
      const onClose = vi.fn();
      const user = userEvent.setup();
      render(<TermModal {...defaultProps} onClose={onClose} />);

      await user.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when Close modal button is clicked', async () => {
      const onClose = vi.fn();
      const user = userEvent.setup();
      render(<TermModal {...defaultProps} onClose={onClose} />);

      await user.click(screen.getByRole('button', { name: 'Close modal' }));

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when backdrop is clicked', async () => {
      const onClose = vi.fn();
      const user = userEvent.setup();
      render(<TermModal {...defaultProps} onClose={onClose} />);

      const dialog = screen.getByRole('dialog');
      await user.click(dialog);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose when clicking inside the modal content', async () => {
      const onClose = vi.fn();
      const user = userEvent.setup();
      render(<TermModal {...defaultProps} onClose={onClose} />);

      await user.click(screen.getByLabelText(/Name/));

      expect(onClose).not.toHaveBeenCalled();
    });

    it('does not call onSave when Cancel is clicked', async () => {
      const onSave = vi.fn();
      const onClose = vi.fn();
      const user = userEvent.setup();
      render(<TermModal {...defaultProps} onSave={onSave} onClose={onClose} />);

      await user.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(onSave).not.toHaveBeenCalled();
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('keyboard interaction', () => {
    it('calls onClose when Escape key is pressed', async () => {
      const onClose = vi.fn();
      const user = userEvent.setup();
      render(<TermModal {...defaultProps} onClose={onClose} />);

      await user.keyboard('{Escape}');

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('accessibility', () => {
    it('has aria-modal attribute set to true', () => {
      render(<TermModal {...defaultProps} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('has aria-labelledby pointing to the title', () => {
      render(<TermModal {...defaultProps} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby', 'term-modal-title');
    });

    it('marks name field as required with aria-required', () => {
      render(<TermModal {...defaultProps} />);

      const nameInput = screen.getByLabelText(/Name/);
      expect(nameInput).toHaveAttribute('aria-required', 'true');
    });

    it('marks scope field as required with aria-required', () => {
      render(<TermModal {...defaultProps} />);

      const scopeSelect = screen.getByLabelText(/Scope/);
      expect(scopeSelect).toHaveAttribute('aria-required', 'true');
    });

    it('sets aria-invalid on name field when there is an error', async () => {
      const user = userEvent.setup();
      render(<TermModal {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: 'Add' }));

      const nameInput = screen.getByLabelText(/Name/);
      expect(nameInput).toHaveAttribute('aria-invalid', 'true');
    });

    it('sets aria-invalid to false on name field when there is no error', () => {
      render(<TermModal {...defaultProps} />);

      const nameInput = screen.getByLabelText(/Name/);
      expect(nameInput).toHaveAttribute('aria-invalid', 'false');
    });

    it('displays error messages with role alert', async () => {
      const user = userEvent.setup();
      render(<TermModal {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: 'Add' }));

      const alerts = screen.getAllByRole('alert');
      expect(alerts.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('form reset on reopen', () => {
    it('resets form fields when modal is reopened in add mode', () => {
      const { rerender } = render(<TermModal {...defaultProps} term={existingTerms[0]} />);

      expect(screen.getByLabelText(/Name/)).toHaveValue('Apple');

      rerender(<TermModal {...defaultProps} isOpen={false} term={null} />);
      rerender(<TermModal {...defaultProps} isOpen={true} term={null} />);

      expect(screen.getByLabelText(/Name/)).toHaveValue('');
      expect(screen.getByLabelText(/Scope/)).toHaveValue('');
      expect(screen.getByLabelText(/Translation \(DE\)/)).toHaveValue('');
      expect(screen.getByLabelText(/Translation \(ES\)/)).toHaveValue('');
      expect(screen.getByLabelText(/Keep As Is/)).not.toBeChecked();
      expect(screen.getByLabelText(/Notes/)).toHaveValue('');
    });

    it('clears validation errors when modal is reopened', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<TermModal {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: 'Add' }));

      expect(screen.getByText('Name is required')).toBeInTheDocument();

      rerender(<TermModal {...defaultProps} isOpen={false} />);
      rerender(<TermModal {...defaultProps} isOpen={true} />);

      expect(screen.queryByText('Name is required')).not.toBeInTheDocument();
    });
  });
});