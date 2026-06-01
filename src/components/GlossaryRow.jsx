import React from 'react';
import PropTypes from 'prop-types';

/**
 * Table row component for a single glossary term.
 * Displays name, scope, German translation, Spanish translation, keep-as-is flag, and notes.
 * Includes Edit and Delete action buttons.
 * @param {object} props
 * @param {object} props.term - The glossary term object
 * @param {string} props.term.id - Unique term identifier
 * @param {string} props.term.name - Term name
 * @param {string} props.term.scope - Term scope
 * @param {string} [props.term.translationDE] - German translation
 * @param {string} [props.term.translationES] - Spanish translation
 * @param {boolean} [props.term.keepAsIs] - Whether to keep the term as-is
 * @param {string} [props.term.notes] - Additional notes
 * @param {Function} props.onEdit - Callback fired with the term object when Edit is clicked
 * @param {Function} props.onDelete - Callback fired with the term object when Delete is clicked
 * @returns {React.ReactElement} The table row element
 */
export function GlossaryRow({ term, onEdit, onDelete }) {
  /**
   * Handles clicking the Edit button.
   */
  const handleEdit = () => {
    onEdit(term);
  };

  /**
   * Handles clicking the Delete button.
   */
  const handleDelete = () => {
    onDelete(term);
  };

  /**
   * Handles keydown events on the Edit button for accessibility.
   * @param {React.KeyboardEvent<HTMLButtonElement>} e - The keydown event
   */
  const handleEditKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleEdit();
    }
  };

  /**
   * Handles keydown events on the Delete button for accessibility.
   * @param {React.KeyboardEvent<HTMLButtonElement>} e - The keydown event
   */
  const handleDeleteKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleDelete();
    }
  };

  return (
    <tr className="border-b border-gray-200 transition-colors hover:bg-gray-50">
      <td className="px-4 py-3 text-sm text-gray-900 font-medium">
        {term.name}
      </td>
      <td className="px-4 py-3 text-sm text-gray-700">
        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
          {term.scope}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-gray-700">
        {term.translationDE || '—'}
      </td>
      <td className="px-4 py-3 text-sm text-gray-700">
        {term.translationES || '—'}
      </td>
      <td className="px-4 py-3 text-sm text-gray-700">
        {term.keepAsIs ? (
          <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
            Yes
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
            No
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate" title={term.notes || ''}>
        {term.notes || '—'}
      </td>
      <td className="px-4 py-3 text-sm">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleEdit}
            onKeyDown={handleEditKeyDown}
            aria-label={`Edit term ${term.name}`}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-1 h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Edit
          </button>
          <button
            type="button"
            onClick={handleDelete}
            onKeyDown={handleDeleteKeyDown}
            aria-label={`Delete term ${term.name}`}
            className="inline-flex items-center rounded-md border border-red-300 bg-white px-3 py-1.5 text-xs font-medium text-red-700 shadow-sm transition-colors hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-1 h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}

GlossaryRow.propTypes = {
  term: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    scope: PropTypes.string.isRequired,
    translationDE: PropTypes.string,
    translationES: PropTypes.string,
    keepAsIs: PropTypes.bool,
    notes: PropTypes.string,
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default GlossaryRow;